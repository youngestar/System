<script setup lang="ts">
import { Operation, Menu, Document, Switch, Opportunity } from '@element-plus/icons-vue'
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore } from '../../stores/chat'
import { useUserStore } from '../../stores/login'

// 使用 store
const chatStore = useChatStore()
const userStore = useUserStore()

// 路由配置
const router = useRouter()
const route = useRoute()
const turnTo = async (name: string): Promise<void> => {
  try {
    // chat 路由跳转到第一条对话
    if (name === 'chat') {
      router.push({
        name,
        params: {
          chatName: '新对话',
        },
      })
    } else {
      router.push({
        name,
      })
    }
    nowActive.value = name
    drawer.value = false
  } catch (error: unknown) {
    console.error(error)
  }
}

// 抽屉
const drawer = ref(false)
const nowActive = ref('home')
</script>

<template>
  <el-button
    color="#00DDFF"
    type="primary"
    large
    id="menuButton"
    @click="drawer = true"
    v-show="userStore.token"
  >
    <el-icon size="2.5vh">
      <Menu />
    </el-icon>
  </el-button>
  <el-drawer
    id="drawer"
    v-model="drawer"
    title="I am the title"
    :direction="'ltr'"
    style="background-color: #f3f4f6"
  >
    <template #header>
      <h4 style="color: #4c6bfb">
        <el-icon style="position: relative; top: 2px">
          <Operation />
        </el-icon>
        请选择界面
      </h4>
    </template>
    <template #default>
      <el-menu
        id="main-menu"
        active-text-color="#4c6bfb"
        background-color="#f3f4f6"
        :default-active="nowActive"
        text-color="#444444"
        @select="turnTo"
      >
        <!-- <el-menu-item index="login">
          <el-icon>
            <User />
          </el-icon>
          <span>登录页面</span>
        </el-menu-item> -->
        <el-menu-item index="home">
          <el-icon>
            <Document />
          </el-icon>
          <span>日志记录</span>
        </el-menu-item>
        <el-menu-item index="chat">
          <el-icon><Opportunity /></el-icon>
          <span>智能对话</span>
        </el-menu-item>
        <!-- <el-menu-item index="submit">
          <el-icon>
            <Switch />
          </el-icon>
          <span>数据更替</span>
        </el-menu-item> -->
        <el-menu-item index="dataChange">
          <el-icon>
            <Switch />
          </el-icon>
          <span>添加防护</span>
        </el-menu-item>
        <!-- <el-menu-item index="background">
          <el-icon
            ><svg
              t="1740745130767"
              class="icon"
              viewBox="0 0 1024 1024"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              p-id="1955"
              width="200"
              height="200"
            >
              <path
                d="M128.299 128C92.788 128 64 156.788 64 192.299v639.4C64 867.212 92.788 896 128.299 896H895.7c35.512 0 64.3-28.788 64.3-64.299V192.299C960 156.788 931.212 128 895.701 128H128.299zM128 588.313l178.162-178.162c24.795-24.795 64.996-24.795 89.792 0L817.803 832H128V588.313z m768 231.375L666.385 590.073l64.718-64.718c25.153-25.152 65.933-25.152 91.085 0L896 599.167v220.521zM694.65 471.299l-73.519 73.519L432.653 356.34c-45.064-45.064-118.127-45.064-163.19 0L128 497.803V192h768v316.657l-37.358-37.358c-45.286-45.285-118.707-45.285-163.992 0z"
                p-id="1956"
              ></path>
            </svg>
          </el-icon>
          <span>背景修改</span>
        </el-menu-item> -->
      </el-menu>
    </template>
  </el-drawer>
  <router-view></router-view>
</template>

<style scoped>
#menuButton {
  position: absolute;
  top: 0;
  right: 2%;
  width: 6vh;
  height: 4vh;
  margin-top: -2.1%;
  z-index: 100;
  /* outline: 2px solid #02a6b5; */
  transition:
    box-shadow 0.5s,
    margin-top 0.5s;
  border-radius: 0 0 0vh 0vh;

  &:hover {
    box-shadow: 0 0px 6px 1.5px rgba(255, 255, 255, 0.8);
    margin-top: 0;
  }

  &::after {
    content: 'Menu';
    position: absolute;
    top: 3.9vh;
    height: 2.1vh;
    width: 6vh;
    background-color: #00ddff;
    border-radius: 0vh 0 1vh 1vh;
    font-size: 1.8vh;
  }
}

.el-drawer {
  background-color: pink;
  &::before {
    content: '111';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: black;
  }
}
</style>

<style>
/* 通用样式 */
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}

#main-menu .el-menu-item:hover {
  background-color: #f3f4f6 !important; /* 设置悬停背景色 */
}
</style>
