import { apiRequest } from '.'

// 注册部分
export const register = async (
  username: string,
  password: string,
  email: string,
  emailCode: string,
  imgId: string,
  imgCode: string,
) => {
  const res = await apiRequest(
    '/register',
    'post',
    {
      username,
      password,
      email,
      emailCode,
      imgId,
      imgCode,
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
