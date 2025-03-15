import { ref } from 'vue'
import type { Ref } from 'vue'
import { defineStore } from 'pinia'
import OpenAI from 'openai'

// 对话分区接口
interface allChat {
  isSending: boolean
  title: string
  history: OpenAI.ChatCompletionMessageParam[]
}

export const useChatStore = defineStore(
  'chat',
  () => {
    const allChats: Ref<allChat[]> = ref([
      {
        isSending: false,
        title: '默认对话',
        history: [],
      },
      {
        isSending: false,
        title: '默认对话',
        history: [],
      },
    ])
    // 添加聊天函数
    const addNewChat = () => {
      allChats.value.unshift({
        isSending: false,
        // 此处 title 需更换, 注意
        title: '新对话',
        history: [],
      })
    }
    // 改名函数
    const editChatName = (name: string, index: number) => {
      allChats.value[index].title = name
    }
    // 删除聊天函数
    const deleteChat = (index: number) => {
      allChats.value.splice(index, 1)
    }
    return { allChats, addNewChat, editChatName, deleteChat }
  },
  {
    persist: true, // 启用持久化插件
  },
)
