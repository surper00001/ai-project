import axios from 'axios';

const QWEN_API_KEY = 'sk-30a8e6a72d6a4bda97f0ae9ca7d02fa3';
const QWEN_API_URL = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';

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
  } catch (error) {
    console.error('Qwen API Error:', error);
    throw new Error('Failed to get response from AI');
  }
}

export async function callQwenStreamAPI(
  messages: QwenMessage[], 
  onChunk: (chunk: string) => Promise<void>
): Promise<void> {
  try {
    // 先获取完整的回复
    const fullResponse = await callQwenAPI(messages);
    
    // 模拟流式输出，按词或字符发送
    const words = fullResponse.split('');
    for (let i = 0; i < words.length; i++) {
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
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  } catch (error) {
    console.error('Qwen Stream API Error:', error);
    throw new Error('Failed to get stream response from AI');
  }
}
