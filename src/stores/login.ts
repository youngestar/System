import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Ref } from 'vue'
import { registerApi } from '@/api/login'

interface User {
  userName: string
  password: string
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 使用布尔值类型的 rememberMe，逻辑上更符合需求
    const rememberMe = ref<boolean>(false)

    // token 是字符串类型或 null，已经正确声明
    const token: Ref<string | null> = ref(null)

    // 将 userList 作为响应式数据，使用 Ref 包裹
    const userList: Ref<User[]> = ref([
      {
        userName: '例子',
        password: '123456',
      },
    ])

    // 添加新用户到 userList 中
    const addUser = async (
      userName: string,
      password: string,
      email: string,
      email_captcha_code: string,
      img_captcha_id: string,
      img_captcha_code: string,
    ) => {
      try {
        const res = await registerApi(
          userName,
          password,
          email,
          email_captcha_code,
          img_captcha_id,
          img_captcha_code,
        )
        console.log(111)
        return res
      } catch (error) {
        console.error('注册失败:', error)
      }
    }

    // 模拟获取 token
    const getToken = () => {
      token.value = 'token'
    }

    return { userList, addUser, token, rememberMe, getToken }
  },
  {
    persist: [
      {
        pick: ['userList', 'rememberMe'],
        storage: localStorage,
      },
      {
        pick: ['token'],
        storage: sessionStorage,
      },
    ],
  },
)
