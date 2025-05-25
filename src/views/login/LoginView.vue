<script setup lang="ts">
import { onMounted, reactive, ref, type Ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormRules, FormInstance } from 'element-plus'
import { User, Lock, Message, ChatDotRound } from '@element-plus/icons-vue'
import { getImgCodeApi, getEmailCodeApi } from '@/api/login'
import { useUserStore } from '@/stores/login'
import router from '@/router'

// 记住我选项
const rememberMe: Ref<boolean> = ref(false)
// 现在浏览页面
const nowView: Ref<'login' | 'register'> = ref('login')
// 使用 store
const userStore = useUserStore()

// 图片验证码存储
const imgCode = reactive({
  id: '',
  src: '',
})

// 获取图片验证码
// 需要防抖
const getImageCode = () => {
  getImgCodeApi()
    .then((res) => {
      imgCode.id = res.captcha_id
      imgCode.src = res.captcha_img_base64
    })
    .catch(() => {
      ElMessage({
        message: '获取验证码失败',
      })
    })
}

// 获取邮箱验证码
const getEmailCode = () => {
  getEmailCodeApi(registerForm.email)
    .then(() => {
      ElMessage.success({
        message: '验证码已发送至邮箱',
      })
    })
    .catch(() => {
      ElMessage.error({
        message: '获取验证码失败',
      })
    })
}

// 登录表单验证
const loginFormRef = ref<FormInstance>()

// 用户名验证
const validateName = (rule: any, value: string, callback: (error?: string | Error) => void) => {
  if (value === '') {
    callback('请填写用户名')
  } else if (nowView.value === 'login') {
    // if (userStore.userList.find((user) => user.userName === loginForm.name)) {
    //   callback()
    // } else {
    //   callback('没有找到此用户')
    // }
    callback()
  } else if (nowView.value === 'register') {
    callback()
  } else {
    callback('当前状态发生未知错误,请刷新并反馈')
  }
}

// 密码验证
const validatePassword = (rule: any, value: string, callback: (error?: string | Error) => void) => {
  const redex = /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).+$/
  if (value === '') {
    callback('请填写密码')
  } else if (value.length < 6) {
    callback('密码不能小于 6 位')
  } else if (!redex.test(value)) {
    callback('密码应同时包含: 数字, 大写字母, 小写字母, 标点符号')
  } else if (nowView.value === 'login') {
    // const user = userStore.userList.find((user) => user.userName === loginForm.name)
    // if (user?.password === loginForm.password) {
    //   callback()
    // } else {
    //   callback('密码错误')
    // }
    callback()
  } else if (nowView.value === 'register') {
    callback()
  } else {
    callback('当前状态发生未知错误,请刷新并反馈')
  }
}

const loginForm = reactive({
  name: '',
  password: '',
})

const loginRules = reactive<FormRules<typeof loginForm>>({
  name: [{ validator: validateName, trigger: 's' }],
  password: [{ validator: validatePassword, trigger: 'submit' }],
})

// 登录函数
const login = (formEI: FormInstance | undefined) => {
  if (!formEI) return
  formEI.validate(async (valid) => {
    if (valid) {
      // userStore.getToken()
      // ElMessage({
      //   message: '登录成功',
      //   type: 'success',
      // })
      const res = await userStore.login('password', loginForm.name, loginForm.password)
      // router.push({ name: 'home' })
    } else {
      ElMessage({
        message: '登录失败',
        type: 'error',
      })
    }
  })
}

// 注册表单验证
const registerFormRef = ref<FormInstance>()

// 密码二次填写验证
const validateCheckPassword = (
  rule: any,
  value: string,
  callback: (error?: string | Error) => void,
) => {
  if (value === '') {
    callback('请再次填写密码')
  } else if (value !== registerForm.password) {
    callback('两次填写的密码不一致')
  } else {
    callback()
  }
}

const registerForm = reactive({
  name: '',
  password: '',
  checkPassword: '',
  email: '',
  imageVerificationCode: '',
  emailVerificationCode: '',
})

const registerRules = reactive<FormRules<typeof registerForm>>({
  name: [{ validator: validateName, trigger: 'submit' }],
  password: [{ validator: validatePassword, trigger: 'submit' }],
  checkPassword: [{ validator: validateCheckPassword, trigger: 'submit' }],
  email: [{ required: true, message: '请填写邮箱', trigger: 'submit' }],
  imageVerificationCode: [{ required: true, message: '请填写图片验证码', trigger: 'submit' }],
  emailVerificationCode: [{ required: true, message: '请填写邮箱验证码', trigger: 'submit' }],
})

// 注册函数
const register = (formEI: FormInstance | undefined) => {
  if (!formEI) return
  formEI.validate((valid) => {
    if (valid) {
      userStore.addUser(
        registerForm.name,
        registerForm.password,
        registerForm.email,
        registerForm.emailVerificationCode,
        imgCode.id,
        registerForm.imageVerificationCode,
      )
      // ElMessage({
      //   type: 'success',
      //   message: '注册成功',
      // })
      // nowView.value = 'login'
    } else {
      ElMessage({
        type: 'error',
        message: '注册失败',
      })
    }
  })
}

onMounted(() => {
  // 获取图片验证码
  getImageCode()
})
</script>

<template>
  <div id="home">
    <div id="login" v-show="nowView === 'login'">
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="auto"
        id="loginForm"
        :autocomplete="rememberMe === false ? 'off' : 'true'"
        style="width: 90%"
        @submit.prevent="login(loginFormRef)"
      >
        <el-form-item prop="name">
          <el-input v-model="loginForm.name" :maxlength="12" placeholder="用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            show-password
            :maxlength="12"
            placeholder="密码"
          >
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-checkbox label="记住我" v-model="rememberMe" />
          <el-button type="primary" text @click="nowView = 'register'" style="margin-left: 200px">
            立刻注册
          </el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" style="width: 80%; margin: 0 10%" @click="login(loginFormRef)">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div id="register" v-show="nowView === 'register'">
      <el-form
        ref="registerFormRef"
        :model="registerForm"
        :rules="registerRules"
        label-width="auto"
        id="registerForm"
        @submit.prevent="register(registerFormRef)"
      >
        <el-form-item prop="name">
          <el-input v-model="registerForm.name" :maxlength="12" placeholder="用户名">
            <template #prefix>
              <el-icon>
                <User />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            show-password
            :maxlength="12"
            placeholder="密码"
          >
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="checkPassword">
          <el-input
            v-model="registerForm.checkPassword"
            type="password"
            show-password
            :maxlength="12"
            placeholder="请再次确认密码"
          >
            <template #prefix>
              <el-icon>
                <Lock />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            type="text"
            :maxlength="20"
            placeholder="请输入邮箱"
          >
            <template #prefix>
              <el-icon>
                <Message />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item prop="emailVerificationCode">
          <el-input
            v-model="registerForm.emailVerificationCode"
            :maxlength="6"
            placeholder="邮箱验证码"
            style="width: 60%"
          >
            <template #prefix>
              <el-icon>
                <ChatDotRound />
              </el-icon>
            </template>
          </el-input>
          <el-button type="primary" style="width: 100px; margin-left: 30px" @click="getEmailCode">
            发送验证码
          </el-button>
        </el-form-item>
        <el-form-item prop="imageVerificationCode">
          <el-input
            v-model="registerForm.imageVerificationCode"
            :maxlength="6"
            placeholder="图片验证码"
            style="width: 60%"
          >
            <template #prefix>
              <el-icon>
                <ChatDotRound />
              </el-icon>
            </template>
          </el-input>
          <div id="imgCodeDiv">
            <img
              :src="`data:image/png;base64,${imgCode.src}`"
              alt="加载失败, 请重试"
              id="imgCode"
              @click="getImageCode"
            />
            <p>看不清? 失效了? 点击换一张!</p>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="register(registerFormRef)"
            type="primary"
            style="width: 80%; margin: 0 10%"
          >
            注册
          </el-button>
          <span style="font-size: 14px; margin-left: 10%; color: #000">
            或者
            <el-link
              type="primary"
              @click="nowView = 'login'"
              style="position: relative; bottom: 1.5px"
            >
              现在登录!
            </el-link>
          </span>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
#home {
  height: 65vh;
  width: 100%;

  #login {
    width: 400px;
    height: 250px;
    margin: auto;
    margin-top: 300px;
    background-color: #fff;
    border-radius: 10px;

    #loginForm {
      margin: 25px;
      position: relative;
      top: 25px;
    }
  }

  #register {
    width: 400px;
    height: 425px;
    margin: auto;
    margin-top: 250px;
    background-color: #fff;
    border-radius: 10px;

    #registerForm {
      margin: 25px;
      position: relative;
      top: 25px;
    }
  }
}
#imgCodeDiv {
  #imgCode {
    position: relative;
    cursor: pointer;
    width: 120px;
    height: 50px;
    margin-left: 20px;
    + p {
      position: absolute;
      bottom: -15px;
      right: -5px;
      line-height: 1;
      font-size: 10px;
    }
  }
}
</style>
