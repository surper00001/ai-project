import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
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
      role: msg.role === 'USER' ? 'user' : 'assistant',
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
          // 调用千问流式API
          let currentContent = '';
          await callQwenStreamAPI(messages, async (chunk: string) => {
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
          });

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
          console.error("Stream error:", error);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            type: 'error',
            error: 'Failed to get response from AI'
          })}\n\n`));
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
