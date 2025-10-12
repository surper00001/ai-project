'use client';

import { CodeBlock } from '@/components/chat/CodeBlock';

export default function TestCodeBlocks() {
  const sampleCode = {
    javascript: `// JavaScript 示例代码
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// 使用 async/await
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}

// 类定义
class User {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
  
  greet() {
    return \`Hello, I'm \${this.name}\`;
  }
}`,
    
    python: `# Python 示例代码
def fibonacci(n):
    """计算斐波那契数列的第n项"""
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

# 异步函数
import asyncio
import aiohttp

async def fetch_data():
    async with aiohttp.ClientSession() as session:
        async with session.get('/api/data') as response:
            return await response.json()

# 类定义
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def greet(self):
        return f"Hello, I'm {self.name}"

# 列表推导式
squares = [x**2 for x in range(10)]
even_squares = [x**2 for x in range(10) if x % 2 == 0]`,
    
    css: `/* CSS 示例代码 */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.button {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}`,
    
    html: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>代码块测试页面</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="card">
            <h1>欢迎使用代码块组件</h1>
            <p>这是一个测试页面，展示代码块的各种功能。</p>
            
            <div class="features">
                <h2>功能特性</h2>
                <ul>
                    <li>语法高亮</li>
                    <li>一键复制</li>
                    <li>全屏查看</li>
                    <li>代码下载</li>
                    <li>展开/收起</li>
                </ul>
            </div>
            
            <button class="button" onclick="copyCode()">
                复制代码
            </button>
        </div>
    </div>
    
    <script src="script.js"></script>
</body>
</html>`,
    
    json: `{
  "name": "代码块组件",
  "version": "1.0.0",
  "description": "一个功能丰富的代码块组件",
  "features": [
    "语法高亮",
    "一键复制",
    "全屏查看",
    "代码下载",
    "展开收起"
  ],
  "supportedLanguages": {
    "javascript": "JavaScript",
    "typescript": "TypeScript",
    "python": "Python",
    "java": "Java",
    "css": "CSS",
    "html": "HTML",
    "json": "JSON",
    "xml": "XML",
    "yaml": "YAML",
    "markdown": "Markdown"
  },
  "config": {
    "showLineNumbers": true,
    "enableCopy": true,
    "enableDownload": true,
    "enableFullscreen": true,
    "maxHeight": "400px"
  }
}`
  };

  return (
    <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            代码块组件测试页面
          </h1>
          <p className="text-xl text-white/80">
            展示各种编程语言的代码块渲染效果
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* JavaScript 代码块 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">JavaScript 代码</h2>
            <CodeBlock 
              code={sampleCode.javascript} 
              language="javascript"
              filename="fibonacci.js"
            />
          </div>

          {/* Python 代码块 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">Python 代码</h2>
            <CodeBlock 
              code={sampleCode.python} 
              language="python"
              filename="fibonacci.py"
            />
          </div>

          {/* CSS 代码块 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">CSS 样式</h2>
            <CodeBlock 
              code={sampleCode.css} 
              language="css"
              filename="styles.css"
            />
          </div>

          {/* HTML 代码块 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">HTML 结构</h2>
            <CodeBlock 
              code={sampleCode.html} 
              language="html"
              filename="index.html"
            />
          </div>

          {/* JSON 代码块 */}
          <div className="space-y-4 lg:col-span-2">
            <h2 className="text-2xl font-semibold text-white">JSON 配置</h2>
            <CodeBlock 
              code={sampleCode.json} 
              language="json"
              filename="package.json"
            />
          </div>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
            <h3 className="text-2xl font-semibold text-white mb-4">
              使用说明
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-white/80">
              <div className="text-center">
                <div className="text-3xl mb-2">📋</div>
                <h4 className="font-semibold mb-1">一键复制</h4>
                <p className="text-sm">点击复制按钮快速复制代码</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🔍</div>
                <h4 className="font-semibold mb-1">全屏查看</h4>
                <p className="text-sm">全屏模式查看长代码</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💾</div>
                <h4 className="font-semibold mb-1">下载代码</h4>
                <p className="text-sm">将代码保存为文件</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🎨</div>
                <h4 className="font-semibold mb-1">语法高亮</h4>
                <p className="text-sm">支持多种编程语言</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
