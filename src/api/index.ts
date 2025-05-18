import axios from 'axios'
import { useUserStore } from '@/stores/login'
import type { AxiosRequestConfig, InternalAxiosRequestConfig, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

// 接口类型
type Method = 'get' | 'post' | 'put' | 'delete'

// api 创建
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器(注意为全局拦截器)
axios.interceptors.request.use(
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
  hasBody: boolean = false,
): Promise<unknown> => {
  const requestConfig: AxiosRequestConfig = {
    url,
    method,
  }

  // 判断是否需要 token
  if (withToken) {
    const token = userStore.token
    if (!token) {
      throw new Error('Token 为空，请先登录')
    }
    requestConfig.headers = {
      Authorization: `Bearer ${token}`,
    }
  }

  // 判断是 query 参数还是 body 参数
  if ((method === 'get' || method === 'delete') && !hasBody) {
    requestConfig.params = requestBody
  } else {
    requestConfig.data = requestBody
  }

  // 请求并返回数据
  try {
    const res = await api(requestConfig)
    if (res.data.code === 200) {
      return res
    }
    throw new Error(res.data.message)
  } catch (error) {
    console.error(error)
    throw new Error(String(error) || '未知错误')
  }
}

// 包含统一 UI 错误提示的请求函数
export const apiRequest = async (
  path: string,
  method: Method,
  requestInfo: any = {},
  withToken: boolean = false,
  hasBody: boolean = false,
): Promise<any> => {
  try {
    return await request(path, method, requestInfo, withToken, hasBody)
  } catch (e) {
    ElMessage.error(e.message || String(e))
    throw e
  }
}

export default api
