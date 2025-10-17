import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 获取用户的聊天会话列表
 * 
 * 返回当前用户的所有聊天会话，包括每个会话的最后一条消息
 * 用于在侧边栏显示会话历史列表
 * 
 * @returns 包含用户所有聊天会话的响应
 */
export async function GET() {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 查询用户及其所有聊天会话
    // 使用include关联查询，获取每个会话的最后一条消息用于预览
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        chatSessions: {
          include: {
            messages: {
              orderBy: { createdAt: 'desc' }, // 按创建时间降序排列
              take: 1 // 只取最新的一条消息用于预览
            }
          },
          orderBy: { updatedAt: 'desc' } // 会话按最后更新时间降序排列
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 返回用户的聊天会话列表
    return NextResponse.json({ sessions: user.chatSessions });
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 创建新的聊天会话
 * 
 * 为用户创建一个新的聊天会话，可以指定会话标题
 * 如果未提供标题，则使用默认标题"New Chat"
 * 
 * @param request - 包含会话标题的HTTP请求
 * @returns 包含新创建会话信息的响应
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 从请求体中解析会话标题
    const { title } = await request.json();

    // 查找用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 创建新的聊天会话
    const chatSession = await prisma.chatSession.create({
      data: {
        title: title || "New Chat", // 使用提供的标题或默认标题
        userId: user.id // 关联到当前用户
      }
    });

    // 返回新创建的会话信息
    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

