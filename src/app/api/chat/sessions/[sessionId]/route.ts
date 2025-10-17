import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * 获取特定会话的所有消息
 * 
 * 根据会话ID获取指定聊天会话的完整消息历史
 * 包含权限验证，确保用户只能访问自己的会话
 * 
 * @param request - HTTP请求对象
 * @param params - 包含会话ID的路由参数
 * @returns 包含会话和消息历史的响应
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // 从路由参数中获取会话ID
    const { sessionId } = await params;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 查找用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 查找指定会话，确保会话属于当前用户
    // 使用findFirst而不是findUnique，因为需要额外的userId条件
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id // 确保用户只能访问自己的会话
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' } // 按创建时间升序排列，保持对话顺序
        }
      }
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // 返回完整的会话信息，包括所有消息
    return NextResponse.json({ session: chatSession });
  } catch (error) {
    console.error("Error fetching chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * 删除聊天会话
 * 
 * 根据会话ID删除指定的聊天会话
 * 包含权限验证，确保用户只能删除自己的会话
 * 删除会话会同时删除该会话下的所有消息
 * 
 * @param request - HTTP请求对象
 * @param params - 包含会话ID的路由参数
 * @returns 删除成功的响应
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // 从路由参数中获取会话ID
    const { sessionId } = await params;
    
    // 验证用户身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 查找用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 验证会话是否存在且属于当前用户
    const chatSession = await prisma.chatSession.findFirst({
      where: {
        id: sessionId,
        userId: user.id // 确保用户只能删除自己的会话
      }
    });

    if (!chatSession) {
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // 删除会话（由于外键约束，相关消息也会被自动删除）
    await prisma.chatSession.delete({
      where: { id: sessionId }
    });

    // 返回删除成功消息
    return NextResponse.json({ message: "Chat session deleted successfully" });
  } catch (error) {
    console.error("Error deleting chat session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
