import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callQwenAPI, QwenMessage } from "@/lib/qwen-api";

// 发送消息并获取AI回复
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, content } = await request.json();

    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "Session ID and content are required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
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
    const messages: QwenMessage[] = chatSession.messages.map(msg => ({
      role: msg.role === 'USER' ? 'user' : 'assistant',
      content: msg.content
    }));

    // 添加当前用户消息
    messages.push({
      role: 'user',
      content
    });

    // 调用千问API
    const aiResponse = await callQwenAPI(messages);

    // 保存AI回复
    const assistantMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'ASSISTANT',
        chatSessionId: sessionId
      }
    });

    // 更新会话的更新时间
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    return NextResponse.json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

