import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callQwenStreamAPI } from "@/lib/qwen-api";

// 流式发送消息并获取AI回复
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { sessionId, content } = await request.json();

    if (!sessionId || !content) {
      return new Response("Session ID and content are required", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // 验证会话属于当前用户
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!chatSession) {
      return new Response("Chat session not found", { status: 404 });
    }

    // 保存用户消息
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'USER',
        chatSessionId: sessionId
      }
    });

    // 准备发送给千问的消息历史
    const messages = chatSession.messages.map(msg => ({
      role: (msg.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content
    }));

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content
    });

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        let isInterrupted = false;
        
        // 监听请求中断信号
        request.signal?.addEventListener('abort', () => {
          isInterrupted = true;
          console.log('Request interrupted by client');
        });
        
        // 发送用户消息
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'user_message',
          message: userMessage
        })}\n\n`));

        // 创建AI消息记录
        const assistantMessage = await prisma.message.create({
          data: {
            content: '',
            role: 'ASSISTANT',
            chatSessionId: sessionId
          }
        });

        // 发送开始信号
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          messageId: assistantMessage.id
        })}\n\n`));

        try {
          // 调用千问流式API，传递中断检查函数
          let currentContent = '';
          await callQwenStreamAPI(messages, async (chunk: string) => {
            // 检查是否被中断
            if (isInterrupted) {
              throw new Error('Interrupted by user');
            }
            
            currentContent += chunk;
            
            // 发送流式数据
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'chunk',
              content: chunk,
              messageId: assistantMessage.id
            })}\n\n`));

            // 每20个字符更新一次数据库，减少数据库压力
            if (currentContent.length % 20 === 0) {
              await prisma.message.update({
                where: { id: assistantMessage.id },
                data: { content: currentContent }
              });
            }
          }, () => isInterrupted);

          // 最终更新数据库
          await prisma.message.update({
            where: { id: assistantMessage.id },
            data: { content: currentContent }
          });

          // 发送完成信号
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            messageId: assistantMessage.id
          })}\n\n`));

          // 更新会话的更新时间
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() }
          });

        } catch (error) {
          if (isInterrupted) {
            console.log("Stream interrupted by user");
            // 发送中断信号
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'interrupted',
              messageId: assistantMessage.id
            })}\n\n`));
          } else {
            console.error("Stream error:", error);
            
            // 根据错误类型发送不同的错误信息
            let errorMessage = 'AI服务暂时不可用，请稍后重试';
            let errorType = 'error';
            
            if (error instanceof Error) {
              switch (error.message) {
                case 'API_QUOTA_EXCEEDED':
                  errorMessage = '⚠️ API调用次数已达上限，请稍后再试或联系管理员';
                  errorType = 'quota_exceeded';
                  break;
                case 'API_KEY_INVALID':
                  errorMessage = '🔑 API密钥配置有误，请联系管理员';
                  errorType = 'api_key_error';
                  break;
                case 'API_SERVICE_UNAVAILABLE':
                  errorMessage = '🔧 AI服务暂时不可用，请稍后重试';
                  errorType = 'service_unavailable';
                  break;
                case 'NETWORK_ERROR':
                  errorMessage = '🌐 网络连接异常，请检查网络后重试';
                  errorType = 'network_error';
                  break;
                case 'API_ERROR':
                  errorMessage = '❌ AI服务出现错误，请稍后重试';
                  errorType = 'api_error';
                  break;
                default:
                  errorMessage = '❌ 未知错误，请稍后重试';
                  errorType = 'unknown_error';
              }
            }
            
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: errorType,
              error: errorMessage,
              messageId: assistantMessage.id
            })}\n\n`));
          }
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error("Error in stream:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
