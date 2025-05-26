import { apiRequest } from '.'

// 获取对话列表及对话详情
const getChatListApi = async () => {
  try {
    const res = await apiRequest('/chats', 'get', {}, true)
    return res
  } catch (err) {
    console.error('获取聊天列表失败:', err)
  }
}

const getchatMessagesApi = async (chat_id: string) => {
  try {
    const res = await apiRequest(`/chat/messages`, 'get', { chat_id }, true)
    return res
  } catch (err) {
    console.error('获取聊天消息失败:', err)
  }
}

// 创建对话及发送消息
const createChatApi = async () => {
  try {
    const res = await apiRequest('/chat', 'post', {}, true)
    return res
  } catch (err) {
    console.error('创建聊天失败:', err)
  }
}

const sendMessageApi = async (chat_id: string, role: string, content: string) => {
  try {
    const res = await apiRequest('/chat/messages', 'post', { chat_id, role, content }, true)
    return res
  } catch (err) {
    console.error('发送消息失败:', err)
  }
}
