import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callQwenAPI, QwenMessage } from "@/lib/qwen-api";

/**
 * 发送消息并获取AI回复的API处理函数
 * 
 * 这个API负责处理用户发送的聊天消息，并调用AI服务获取回复
 * 主要流程：
 * 1. 验证用户身份和会话权限
 * 2. 保存用户消息到数据库
 * 3. 构建消息历史并调用AI API
 * 4. 保存AI回复并更新会话时间
 * 
 * @param request - 包含会话ID和消息内容的HTTP请求
 * @returns 包含用户消息和AI回复的响应
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户的会话信息
    // 验证用户是否已登录
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 从请求体中解析会话ID和消息内容
    const { sessionId, content } = await request.json();

    // 验证必填参数
    if (!sessionId || !content) {
      return NextResponse.json(
        { error: "Session ID and content are required" },
        { status: 400 }
      );
    }

    // 根据邮箱查找用户信息
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      return NextResponse.json({ error: "Chat session not found" }, { status: 404 });
    }

    // 保存用户消息到数据库
    // 记录用户发送的消息，用于构建对话历史和后续分析
    const userMessage = await prisma.message.create({
      data: {
        content,
        role: 'USER', // 标记消息角色为用户
        chatSessionId: sessionId
      }
    });

    // 准备发送给千问AI的消息历史
    // 将数据库中的消息格式转换为千问API要求的格式
    const messages: QwenMessage[] = chatSession.messages.map(msg => ({
      role: msg.role === 'USER' ? 'user' : 'assistant', // 转换角色名称
      content: msg.content
    }));

    // 添加当前用户消息到历史中
    messages.push({
      role: 'user',
      content
    });

    // 调用千问AI API获取回复
    // 传入完整的对话历史，让AI能够理解上下文
    const aiResponse = await callQwenAPI(messages);

    // 保存AI回复到数据库
    // 记录AI的回复，完成对话的闭环
    const assistantMessage = await prisma.message.create({
      data: {
        content: aiResponse,
        role: 'ASSISTANT', // 标记消息角色为AI助手
        chatSessionId: sessionId
      }
    });

    // 更新会话的最后更新时间
    // 用于会话列表的排序和显示
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() }
    });

    // 返回用户消息和AI回复
    return NextResponse.json({
      userMessage,
      assistantMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    
    // 根据不同的错误类型返回相应的错误信息和状态码
    // 提供用户友好的错误提示，便于问题排查
    let errorMessage = 'AI服务暂时不可用，请稍后重试';
    let statusCode = 500;
    
    if (error instanceof Error) {
      switch (error.message) {
        case 'API_QUOTA_EXCEEDED':
          errorMessage = 'API调用次数已达上限，请稍后再试或联系管理员';
          statusCode = 429; // 请求过于频繁
          break;
        case 'API_KEY_INVALID':
          errorMessage = 'API密钥配置有误，请联系管理员';
          statusCode = 401; // 认证失败
          break;
        case 'API_SERVICE_UNAVAILABLE':
          errorMessage = 'AI服务暂时不可用，请稍后重试';
          statusCode = 503; // 服务不可用
          break;
        case 'NETWORK_ERROR':
          errorMessage = '网络连接异常，请检查网络后重试';
          statusCode = 502; // 网关错误
          break;
        case 'API_ERROR':
          errorMessage = 'AI服务出现错误，请稍后重试';
          statusCode = 502; // 网关错误
          break;
        default:
          errorMessage = '未知错误，请稍后重试';
          statusCode = 500; // 服务器内部错误
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

