import { apiRequest } from '.'

// 登录部分
export const loginApi = async (grant_type: string, username: string, password: string) => {
  try {
    // 创建 FormData 对象并添加 OAuth 参数
    const formData = new FormData()
    formData.append('grant_type', grant_type)
    formData.append('username', username)
    formData.append('password', password)

    // 使用 apiRequest 发送请求，注意第三个参数传递原始对象而非 FormData
    const res = await apiRequest('/login', 'post', formData, false, true)

    return res
  } catch (err) {
    console.error('登录请求失败:', err)
    throw err // 将错误继续抛出，以便上层处理
  }
}

// 注册部分
export const registerApi = async (
  username: string,
  password: string,
  email: string,
  email_captcha_code: string,
  img_captcha_id: string,
  img_captcha_code: string,
) => {
  try {
    const res = await apiRequest(
      '/register',
      'post',
      {
        username,
        password,
        email,
        email_captcha_code,
        img_captcha_id,
        img_captcha_code,
      },
      false,
      true,
    )
    return res
  } catch (err) {
    console.error(err)
  }
}

// 图片验证码
export const getImgCodeApi = async () => {
  try {
    const res = await apiRequest('/captcha/image', 'get', {}, false, false)
    return res
  } catch (err) {
    console.error(err)
  }
}

// 邮箱验证码
export const getEmailCodeApi = async (email: string) => {
  try {
    const res = await apiRequest(
      '/captcha/email',
      'get',
      {
        email,
      },
      false,
      false,
    )
    return res
  } catch (err) {
    console.error(err)
  }
}
