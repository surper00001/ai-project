import axios from 'axios';

const QWEN_API_KEY = process.env.QWEN_API_KEY || 'sk-30a8e6a72d6a4bda97f0ae9ca7d02fa3';
const QWEN_API_URL = process.env.QWEN_API_URL || 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

export interface QwenMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface QwenResponse {
  output: {
    text: string;
    finish_reason: string;
  };
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export async function callQwenAPI(messages: QwenMessage[]): Promise<string> {
  try {
    const response = await axios.post(
      QWEN_API_URL,
      {
        model: 'qwen-turbo',
        input: {
          messages: messages
        },
        parameters: {
          temperature: 0.7,
          max_tokens: 2000,
          top_p: 0.8
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${QWEN_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data.output.text;
  } catch (error: any) {
    console.error('Qwen API Error:', error);
    
    // 处理不同类型的API错误
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      
      // Token用完或配额不足
      if (status === 429 || status === 402 || 
          (errorData?.error && (
            errorData.error.includes('quota') || 
            errorData.error.includes('token') ||
            errorData.error.includes('limit') ||
            errorData.error.includes('insufficient')
          ))) {
        throw new Error('API_QUOTA_EXCEEDED');
      }
      
      // API密钥无效
      if (status === 401 || status === 403) {
        throw new Error('API_KEY_INVALID');
      }
      
      // 服务不可用
      if (status >= 500) {
        throw new Error('API_SERVICE_UNAVAILABLE');
      }
      
      // 其他API错误
      throw new Error('API_ERROR');
    }
    
    // 网络错误
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      throw new Error('NETWORK_ERROR');
    }
    
    // 默认错误
    throw new Error('UNKNOWN_ERROR');
  }
}

export async function callQwenStreamAPI(
  messages: QwenMessage[], 
  onChunk: (chunk: string) => Promise<void>,
  isInterrupted?: () => boolean
): Promise<void> {
  try {
    // 先获取完整的回复
    const fullResponse = await callQwenAPI(messages);
    
    // 模拟流式输出，按词或字符发送
    const words = fullResponse.split('');
    for (let i = 0; i < words.length; i++) {
      // 检查是否被中断
      if (isInterrupted && isInterrupted()) {
        throw new Error('Interrupted by user');
      }
      
      await onChunk(words[i]);
      
      // 根据字符类型调整延迟
      const char = words[i];
      let delay = 50; // 默认延迟
      
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
      
      // 使用可中断的延迟
      await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(resolve, delay);
        
        // 如果提供了中断检查函数，定期检查
        if (isInterrupted) {
          const checkInterval = setInterval(() => {
            if (isInterrupted()) {
              clearTimeout(timeoutId);
              clearInterval(checkInterval);
              reject(new Error('Interrupted by user'));
            }
          }, 10); // 每10ms检查一次
          
          // 清理定时器
          setTimeout(() => {
            clearInterval(checkInterval);
          }, delay);
        }
      });
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'Interrupted by user') {
      throw error; // 重新抛出中断错误
    }
    console.error('Qwen Stream API Error:', error);
    
    // 重新抛出API错误，让上层处理
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
    
    throw new Error('UNKNOWN_ERROR');
  }
}
