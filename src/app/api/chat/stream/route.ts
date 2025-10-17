import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callQwenStreamAPI } from "@/lib/qwen-api";

/**
 * 流式发送消息并获取AI回复的API处理函数
 * 
 * 这个API提供实时流式聊天体验，用户可以实时看到AI的回复过程
 * 主要特性：
 * 1. 支持流式响应，实时显示AI回复
 * 2. 支持用户中断生成过程
 * 3. 实时保存消息到数据库
 * 4. 完整的错误处理和用户友好的错误提示
 * 
 * @param request - 包含会话ID和消息内容的HTTP请求
 * @returns 流式响应，包含实时AI回复数据
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    // 从请求体中解析会话ID和消息内容
    const { sessionId, content } = await request.json();

    // 验证必填参数
    if (!sessionId || !content) {
      return new Response("Session ID and content are required", { status: 400 });
    }

    // 查找用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // 验证聊天会话是否属于当前用户
    // 确保用户只能访问自己的聊天会话，防止越权访问
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id // 确保会话属于当前用户
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' } // 按创建时间升序排列，获取完整对话历史
        }
      }
    });

    if (!chatSession) {
      return new Response("Chat session not found", { status: 404 });
    }

    // 保存用户消息到数据库
    // 记录用户发送的消息，用于构建对话历史
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'USER', // 标记消息角色为用户
        chatSessionId: sessionId
      }
    });

    // 准备发送给千问AI的消息历史
    // 将数据库中的消息格式转换为千问API要求的格式
    const messages = chatSession.messages.map(msg => ({
      role: (msg.role === 'USER' ? 'user' : 'assistant') as 'user' | 'assistant',
      content: msg.content
    }));

    // 添加当前用户消息到历史中
    messages.push({
      role: 'user',
      content
    });

    // 创建流式响应
    // 使用ReadableStream实现Server-Sent Events (SSE)
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder(); // 用于将字符串转换为字节流
        let isInterrupted = false; // 标记是否被用户中断
        
        // 监听请求中断信号
        // 当用户关闭页面或取消请求时触发
        request.signal?.addEventListener('abort', () => {
          isInterrupted = true;
          console.log('Request interrupted by client');
        });
        
        // 发送用户消息到客户端
        // 让前端知道用户消息已保存
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'user_message',
          message: userMessage
        })}\n\n`));

        // 创建AI消息记录
        // 先创建一个空的消息记录，后续会逐步更新内容
        const assistantMessage = await prisma.message.create({
          data: {
            content: '',
            role: 'ASSISTANT',
            chatSessionId: sessionId
          }
        });

        // 发送开始信号
        // 通知前端AI开始生成回复
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'start',
          messageId: assistantMessage.id
        })}\n\n`));

        try {
          // 调用千问流式API，传递中断检查函数
          let currentContent = ''; // 累积的AI回复内容
          await callQwenStreamAPI(messages, async (chunk: string) => {
            // 检查是否被用户中断
            if (isInterrupted) {
              throw new Error('Interrupted by user');
            }
            
            currentContent += chunk; // 累积内容
            
            // 发送流式数据到客户端
            // 每个字符都会实时发送给前端显示
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'chunk',
              content: chunk,
              messageId: assistantMessage.id
            })}\n\n`));

            // 每20个字符更新一次数据库，减少数据库压力
            // 避免频繁的数据库写入操作
            if (currentContent.length % 20 === 0) {
              await prisma.message.update({
                where: { id: assistantMessage.id },
                data: { content: currentContent }
              });
            }
          }, () => isInterrupted); // 传递中断检查函数

          // 最终更新数据库
          // 确保完整的AI回复被保存
          await prisma.message.update({
            where: { id: assistantMessage.id },
            data: { content: currentContent }
          });

          // 发送完成信号
          // 通知前端AI回复生成完成
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'done',
            messageId: assistantMessage.id
          })}\n\n`));

          // 更新会话的最后更新时间
          // 用于会话列表的排序和显示
          await prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() }
          });

        } catch (error) {
          if (isInterrupted) {
            console.log("Stream interrupted by user");
            // 发送中断信号
            // 通知前端生成过程被用户中断
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: 'interrupted',
              messageId: assistantMessage.id
            })}\n\n`));
          } else {
            console.error("Stream error:", error);
            
            // 根据不同的错误类型发送相应的错误信息
            // 提供用户友好的错误提示，便于问题排查
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
            
            // 发送错误信息到客户端
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({
              type: errorType,
              error: errorMessage,
              messageId: assistantMessage.id
            })}\n\n`));
          }
        } finally {
          // 关闭流
          controller.close();
        }
      }
    });

    // 返回流式响应
    // 设置适当的HTTP头以支持Server-Sent Events
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream', // SSE内容类型
        'Cache-Control': 'no-cache', // 禁用缓存
        'Connection': 'keep-alive', // 保持连接
        'Access-Control-Allow-Origin': '*', // 允许跨域
        'Access-Control-Allow-Headers': 'Cache-Control',
      },
    });

  } catch (error) {
    console.error("Error in stream:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
