import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

/**
 * 处理CORS预检请求
 * 当浏览器发送跨域请求时，会先发送OPTIONS请求来检查是否允许跨域
 * 这里设置允许的跨域策略，包括允许的源、方法和请求头
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // 允许所有域名跨域访问
      'Access-Control-Allow-Methods': 'POST, OPTIONS', // 允许的HTTP方法
      'Access-Control-Allow-Headers': 'Content-Type', // 允许的请求头
    },
  });
}

/**
 * 用户注册API处理函数
 * 接收用户注册信息，验证数据，创建新用户账户
 * @param request - 包含用户注册信息的HTTP请求
 * @returns 注册结果响应
 */
export async function POST(request: NextRequest) {
  try {
    // 记录API调用日志，用于调试和监控
    console.log('=== Register API Called ===');
    console.log('Request URL:', request.url);
    console.log('Request method:', request.method);
    console.log('Request headers:', Object.fromEntries(request.headers.entries()));
    
    // 从请求体中解析用户注册数据
    const { name, email, password } = await request.json();
    console.log('Received data:', { name, email, password: password ? '[HIDDEN]' : 'undefined' });

    // 验证必填字段
    // 检查用户名、邮箱和密码是否都已提供
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { 
          status: 400, // 客户端错误状态码
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 检查邮箱是否已被注册
    // 使用Prisma查询数据库，查找是否存在相同邮箱的用户
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    // 如果邮箱已存在，返回错误信息
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { 
          status: 400,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    // 对密码进行哈希加密
    // 使用bcrypt库，盐值轮数为12，提供足够的安全性
    const hashedPassword = await bcrypt.hash(password, 12);

    // 在数据库中创建新用户记录
    // 将用户信息保存到数据库，包括加密后的密码
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    // 从返回的用户对象中移除密码字段
    // 使用解构赋值和重命名来排除敏感信息
    const { password: _password, ...userWithoutPassword } = user;

    // 返回成功响应，包含创建成功的消息和用户信息（不含密码）
    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: userWithoutPassword 
      },
      { 
        status: 201, // 创建成功状态码
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    // 捕获并记录所有未预期的错误
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 } // 服务器内部错误状态码
    );
  }
}

