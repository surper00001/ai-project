import axios from 'axios';

/**
 * 千问AI API配置和接口
 * 
 * 这个文件包含了与阿里云千问AI服务交互的所有配置和函数
 * 主要功能：
 * 1. 配置API密钥和端点URL
 * 2. 定义消息和响应的TypeScript接口
 * 3. 实现普通API调用和流式API调用
 * 4. 提供完整的错误处理和分类
 */

// 千问API配置
// 从环境变量获取API密钥，如果没有设置则使用默认值（仅用于开发测试）
const QWEN_API_KEY = process.env.QWEN_API_KEY || 'sk-30a8e6a72d6a4bda97f0ae9ca7d02fa3';
// 千问API的端点URL，支持通过环境变量自定义
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

/**
 * 千问AI消息接口
 * 定义发送给千问API的消息格式
 */
export interface QwenMessage {
  role: 'user' | 'assistant' | 'system'; // 消息角色：用户、助手或系统
  content: string; // 消息内容
}

/**
 * 千问AI响应接口
 * 定义从千问API返回的响应格式
 */
export interface QwenResponse {
  output: {
    text: string; // AI生成的文本内容
    finish_reason: string; // 完成原因（如"stop"表示正常结束）
  };
  usage: {
    input_tokens: number; // 输入token数量
    output_tokens: number; // 输出token数量
    total_tokens: number; // 总token数量
  };
}

/**
 * 调用千问AI API获取回复
 * 
 * 发送消息历史给千问AI，获取完整的AI回复
 * 包含完整的错误处理和分类，便于上层调用者处理不同类型的错误
 * 
 * @param messages - 消息历史数组，包含用户和AI的对话记录
 * @returns Promise<string> - AI生成的回复文本
 * @throws 抛出特定类型的错误，便于错误处理和用户提示
 */
export async function callQwenAPI(messages: QwenMessage[]): Promise<string> {
  try {
    // 发送POST请求到千问API
    const response = await axios.post(
      QWEN_API_URL,
      {
        model: 'qwen-turbo', // 使用千问Turbo模型，平衡性能和成本
        input: {
          messages: messages // 传入完整的对话历史
        },
        parameters: {
          temperature: 0.7, // 控制回复的随机性，0.7提供平衡的创造性和一致性
          max_tokens: 2000, // 限制最大回复长度，控制成本
          top_p: 0.8 // 核采样参数，控制词汇选择的多样性
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`, // API认证头
          'Content-Type': 'application/json' // 内容类型
        }
      }
    );

    // 返回AI生成的文本内容
    return response.data.output.text;
  } catch (error: unknown) {
    console.error('Qwen API Error:', error);
    
    // 处理不同类型的API错误
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { status: number; data: { error?: string } } };
      const status = axiosError.response.status; // HTTP状态码
      const errorData = axiosError.response.data; // 错误响应数据
      
      // Token用完或配额不足
      // 检查状态码和错误信息中的关键词
      if (status === 429 || status === 402 || 
          (errorData?.error && (
            errorData.error.includes('quota') || 
            errorData.error.includes('token') ||
            errorData.error.includes('limit') ||
            errorData.error.includes('insufficient')
          ))) {
        throw new Error('API_QUOTA_EXCEEDED');
      }
      
      // API密钥无效或权限不足
      if (status === 401 || status === 403) {
        throw new Error('API_KEY_INVALID');
      }
      
      // 服务器端错误，服务不可用
      if (status >= 500) {
        throw new Error('API_SERVICE_UNAVAILABLE');
      }
      
      // 其他API错误
      throw new Error('API_ERROR');
    }
    
    // 网络连接错误
    if (error && typeof error === 'object' && 'code' in error) {
      const networkError = error as { code: string };
      if (networkError.code === 'ECONNREFUSED' || networkError.code === 'ENOTFOUND' || networkError.code === 'ETIMEDOUT') {
        throw new Error('NETWORK_ERROR');
      }
    }
    
    // 默认未知错误
    throw new Error('UNKNOWN_ERROR');
  }
}

/**
 * 调用千问AI流式API
 * 
 * 由于千问API本身不支持真正的流式输出，这里通过模拟实现流式效果
 * 先获取完整回复，然后按字符逐步发送，提供类似ChatGPT的打字机效果
 * 
 * @param messages - 消息历史数组，包含用户和AI的对话记录
 * @param onChunk - 回调函数，每发送一个字符时调用
 * @param isInterrupted - 可选的中断检查函数，用于检测用户是否取消了请求
 * @returns Promise<void>
 * @throws 抛出特定类型的错误，包括用户中断错误
 */
export async function callQwenStreamAPI(
  messages: QwenMessage[], 
  onChunk: (chunk: string) => Promise<void>,
  isInterrupted?: () => boolean
): Promise<void> {
  try {
    // 先获取完整的AI回复
    const fullResponse = await callQwenAPI(messages);
    
    // 将回复按字符分割，模拟流式输出
    const words = fullResponse.split('');
    for (let i = 0; i < words.length; i++) {
      // 检查是否被用户中断
      if (isInterrupted && isInterrupted()) {
        throw new Error('Interrupted by user');
      }
      
      // 发送当前字符
      await onChunk(words[i]);
      
      // 根据字符类型调整延迟时间，模拟真实的打字速度
      const char = words[i];
      let delay = 50; // 默认延迟50ms
      
      // 标点符号后的停顿时间
      if (char === '。' || char === '！' || char === '？' || char === '\n') {
        delay = 200; // 句号、感叹号、问号、换行后停顿更久
      } else if (char === '，' || char === '；' || char === '：') {
        delay = 100; // 逗号、分号、冒号后稍作停顿
      } else if (char === ' ') {
        delay = 20; // 空格延迟较短
      } else if (/[a-zA-Z0-9]/.test(char)) {
        delay = 40; // 英文字母和数字稍快
      } else {
        delay = 60; // 中文字符正常速度
      }
      
      // 使用可中断的延迟函数
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delay);
        
        // 如果提供了中断检查函数，定期检查是否被中断
        if (isInterrupted) {
          const checkInterval = setInterval(() => {
            if (isInterrupted()) {
              clearTimeout(timeoutId);
              clearInterval(checkInterval);
              reject(new Error('Interrupted by user'));
            }
          }, 10); // 每10ms检查一次中断状态
            
          // 延迟结束后清理定时器
          setTimeout(() => {
            clearInterval(checkInterval);
          }, delay);
        }
      });
    }
  } catch (error) {
    // 如果是用户中断错误，直接重新抛出
    if (error instanceof Error && error.message === 'Interrupted by user') {
      throw error;
    }
    
    console.error('Qwen Stream API Error:', error);
    
    // 重新抛出已知的API错误，让上层处理
    if (error instanceof Error && (
      error.message === 'API_QUOTA_EXCEEDED' ||
      error.message === 'API_KEY_INVALID' ||
      error.message === 'API_SERVICE_UNAVAILABLE' ||
      error.message === 'NETWORK_ERROR' ||
      error.message === 'API_ERROR' ||
      error.message === 'UNKNOWN_ERROR'
    )) {
      throw error;
    }
    
    // 其他未知错误统一处理
    throw new Error('UNKNOWN_ERROR');
  }
}
