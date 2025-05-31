import axios from 'axios'
import { useUserStore } from '@/stores/login'
import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'
import { EventSourcePolyfill } from 'event-source-polyfill'

// 接口类型
type Method = 'get' | 'post' | 'put' | 'delete'

// api 创建
export const api = axios.create({
  baseURL: '/api/v1',
  timeout: 60000,
})

// 请求拦截器(注意为全局拦截器)
api.interceptors.request.use(
  (response: InternalAxiosRequestConfig) => {
    return response // 成功直接返回响应
  },
  (error: AxiosError) => {
    // 请求超时处理
    if (error.code === 'ECONNABORTED' && error.message?.includes('timeout')) {
      return Promise.reject('请求超时，请稍后重试')
    }

    // 网络断开或服务无响应
    if (!error.response) {
      return Promise.reject('网络异常')
    }

    // 提取状态及错误信息
    const status = error.response.status
    const message = error.response.data?.message || '未能提取到错误信息'
    return Promise.reject(`${status} ${message}`)
  },
)

export const request = async (
  url: string,
  method: Method,
  requestBody: unknown = {},
  withToken: boolean = false,
): Promise<unknown> => {
  const requestConfig: AxiosRequestConfig = {
    url,
    method,
  }

  // 判断是否需要 token
  if (withToken) {
    // 转移调研位置确保 Store 已经挂载
    const userStore = useUserStore()
    const token = userStore.token
    if (!token) {
      throw new Error('Token 为空，请先登录')
    }
    requestConfig.headers = {
      Authorization: `Bearer ${token}`,
    }
  }

  // 判断是 query 参数还是 body 参数
  if (method === 'get' || method === 'delete') {
    requestConfig.params = requestBody
  } else {
    requestConfig.data = requestBody
  }

  // 请求并返回数据
  try {
    const res = await api(requestConfig)
    if (res.status === 200) {
      return res.data.data
    }
  } catch (error) {
    // 给出原生错误及扔出包装后错误
    console.error('Axios 错误:', error?.response?.status, error?.response?.data)
    if (error?.response?.data?.detail) throw new Error(String(error?.response?.data?.detail))
    else throw new Error('未知错误, 请联系管理员')
  }
}

// 包含统一 UI 错误提示的请求函数
export const apiRequest = async (
  path: string,
  method: Method,
  requestInfo: any = {},
  withToken: boolean = false,
): Promise<any> => {
  try {
    return await request(path, method, requestInfo, withToken)
  } catch (e) {
    ElMessage.error(e.message || String(e))
    throw e
  }
}
