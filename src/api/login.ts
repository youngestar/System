import { apiRequest } from '.'

// 注册部分
export const registerApi = async (
  username: string,
  password: string,
  email: string,
  email_captcha_code: string,
  img_captcha_id: string,
  img_captcha_code: string,
) => {
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
}

// 图片验证码
export const getImgCodeApi = async () => {
  const res = await apiRequest('/captcha/image', 'get', {}, false, false)
  return res
}

// 邮箱验证码
export const getEmailCodeApi = async (email: string) => {
  const res = await apiRequest(
    '/captcha/email',
    'get',
    {
      email,
    },
    false,
    false,
  )
  console.log(res)
  return res
}
