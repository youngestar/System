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
export const getImgCode = async () => {
  const res = await apiRequest('/captcha/image', 'get', {}, false, false)
  console.log(res)
  return res
}
