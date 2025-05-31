import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import { getChatListApi, createChatApi, getChatMessagesApi } from '@/api/chat'

// 对话分区接口
export interface allChat {
  isSending: boolean
  owner_id: string
  updated_at: string
  title: string
  id: string
  created_at: string
}
export const useChatStore = defineStore(
  'chat',
  () => {
    const allChats: Ref<allChat[]> = ref([
      {
        isSending: false,
        owner_id: '0',
        updated_at: '0',
        title: '默认对话',
        id: '0',
        created_at: '0',
      },
    ])

    // 添加聊天函数
    // const addNewChat = async () => {
    //   allChats.value.unshift({
    //     isSending: false,
    //     // 此处 title 需更换, 注意
    //     title: '新对话',
    //     history: [],
    //   })
    // }

    // 改名函数
    const editChatName = (name: string, index: number) => {
      allChats.value[index].title = name
    }

    // 删除聊天函数
    const deleteChat = (index: number) => {
      allChats.value.splice(index, 1)
    }

    // 前后端交互函数

    // 获取聊天列表
    const getChatList = async () => {
      const res = await getChatListApi()
      return res.map((item: { isSending: boolean }) => ({ ...item, isSending: false }))
    }

    // 获取聊天消息
    const getChatMessages = async (chat_id: string) => {
      const res = await getChatMessagesApi(chat_id)
      return res
    }

    // 创建聊天
    const createChat = async () => {
      const res = await createChatApi()
      return res
    }

    return {
      allChats,
      // addNewChat,
      editChatName,
      deleteChat,
      getChatList,
      getChatMessages,
      createChat,
    }
  },
  {
    persist: true, // 启用持久化插件
  },
)
