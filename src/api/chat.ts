import { useUserStore } from '@/stores/login'
import { apiRequest } from '.'

export interface SendMessageSSEParams {
  chat_id: string
  role: 'user' | 'system' | 'assistant' | 'tool'
  content: string
}

// 获取对话列表及对话详情
export const getChatListApi = async () => {
  try {
    const res = await apiRequest('/chats', 'get', {}, true)
    return res
  } catch (err) {
    console.error('获取聊天列表失败:', err)
  }
}

export const getChatMessagesApi = async (chat_id: string) => {
  try {
    const res = await apiRequest(`/chat/messages`, 'get', { chat_id }, true)
    return res
  } catch (err) {
    console.error('获取聊天消息失败:', err)
  }
}

// 创建对话及发送消息
export const createChatApi = async () => {
  try {
    const res = await apiRequest('/chat', 'post', {}, true)
    return res
  } catch (err) {
    console.error('创建聊天失败:', err)
  }
}

// 流式请求对应函数
// 核心
// 改用Fetch API处理SSE流式响应
export const sendMessageSSEApi = async (
  url: string,
  data: SendMessageSSEParams,
  onMessage: (msg: string) => void,
  onError: (err: any) => void,
  onComplete: () => void,
) => {
  const userStore = useUserStore()
  const token = userStore.token

  if (!token) {
    throw new Error('Token 为空，请先登录')
  }

  try {
    const response = await fetch(`/api/v1${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP错误：${response.status}`)
    }

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    let partialData = '' // 用于拼接不完整的SSE消息

    while (true) {
      const { done, value } = await reader.read()

      if (done) {
        onComplete()
        break
      }

      const chunk = decoder.decode(value, { stream: true })
      partialData += chunk

      // 按 SSE 规范分割消息（即使缺少 event 字段，按空行分隔）
      const messages = partialData.split(/\r?\n\r?\n/)
      partialData = messages.pop() || ''

      for (const message of messages) {
        if (!message.trim()) continue

        try {
          // **关键调整：直接提取 data 内容（假设消息只有 data 字段）**
          const dataLine = message.startsWith('data:') ? message.replace(/data: /g, '') : message // 兼容无字段名的情况（如纯 JSON）

          if (dataLine === '[DONE]') {
            onComplete()
            return
          }

          // 这里可以根据后端实际字段调整
          const parsedData = dataLine

          // 提取 content 字段（根据后端实际字段调整）
          if (parsedData) {
            onMessage(parsedData)
          }
        } catch (error) {
          console.error('解析消息失败（原始数据）:', message, error)
          onError(error)
        }
      }
    }
  } catch (error) {
    console.error('SSE请求失败:', error)
    onError(error)
  }
}

export const sendMessageSSE = (
  chatId: string,
  data: SendMessageSSEParams,
  onMessage: (msg: string) => void,
  onError: (err: any) => void,
  onComplete: () => void,
): Promise<void> => {
  return new Promise((resolve, reject) => {
    sendMessageSSEApi(
      chatId,
      data,
      onMessage,
      (err) => {
        onError(err)
        reject(err)
      },
      () => {
        onComplete()
        resolve()
      },
    )
  })
}
