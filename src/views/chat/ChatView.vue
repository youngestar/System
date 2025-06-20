<!-- eslint-disable prefer-const -->
<script setup lang="ts">
import { Top, Plus, Edit, Delete, More, ArrowDownBold } from '@element-plus/icons-vue'
import { useChatStore, type allChat } from '@/stores/chat'
import { ref, watch, onUnmounted, nextTick, onMounted } from 'vue'
import { ElMessage, type ElInput, type ElScrollbar } from 'element-plus'
import type { Ref } from 'vue'
import OpenAI from 'openai'
import { marked } from 'marked'
import router from '@/router'
import { sendMessageSSE, type SendMessageSSEParams } from '@/api/chat'

const chatStore = useChatStore()

// 当前对话序号, 用以储存当前正在浏览的对话
const isViewingChat: Ref<number> = ref(-1)

// 标题改名相关
const interimName = ref<string>('')
// 废案: 改名时光标聚焦
// const editNameInputRef: Ref<InstanceType<typeof ElInput> | null> = ref(null)
const titleNameChanging: Ref<number> = ref(-1)
const titlePopover = ref(null)

// 滚动元素 DOM 获取
const scrollbarRef: Ref<InstanceType<typeof ElScrollbar> | null> = ref(null)

// 滚动距离检查
const scrollbarToBottom: Ref<number | null> = ref(-9999)

// 总对话储存
// 每个对话会有 title 和 history, 对话之间隔离, 通过操作可以添加新的对话
const allChats: Ref<allChat[]> = ref(chatStore.allChats)

// 历史对话储存
const chatHistory: Ref<OpenAI.ChatCompletionMessageParam[]> = ref([])

// 对话数组获取
const getChatMessages = async (chat_id: string) => {
  const res = await chatStore.getChatMessages(chat_id)
  return res
}

// 总对话切换函数
const selectChat = async (index: number) => {
  isViewingChat.value = index
  if (index >= 0) {
    // 正常导航到标题
    if (index >= 0) {
      router.replace({
        name: 'chat',
        params: {
          chatName: allChats.value[index].title,
        },
      })
      const res = await getChatMessages(allChats.value[index].id)
      chatHistory.value = res
    }
  } else {
    // 菜单导航到新对话
    router.replace({
      name: 'chat',
      params: {
        chatName: '新对话',
      },
    })
  }
}

// 添加新对话函数
const addNewChat = async () => {
  // 对话数量过多时阻止添加
  if (allChats.value.length >= 15) {
    ElMessage({
      message: '对话数量太多啦, 请删除一些吧',
    })
    return
  }
  const res = await chatStore.createChat()
  if (res) {
    allChats.value.unshift({
      isSending: false,
      ...res,
    })
    isViewingChat.value = 0
    sendChat(nowChat.value)
  }
}

// 改名外置函数
const titleNameChange = (index: number) => {
  const unchangedTitle = allChats.value[index].title
  setTimeout(() => {
    if (interimName.value.trim() === unchangedTitle) {
      titleNameChanging.value = -1
      return
    }
  }, 5000)
  interimName.value = allChats.value[isViewingChat.value].title
  titleNameChanging.value = index
  // 废案:自动聚焦函数
  // nextTick(() => {
  //   if (editNameInputRef.value) {
  //     editNameInputRef.value.focus()
  //   } else {
  //     console.error('editNameInputRef 未正确绑定到 ElInput 组件')
  //   }
  // })
}

// 输入框失去焦点时触发
const handleBlur = (index: number) => {
  titleNameChanging.value = -1
  editChatName(index)
}

// 处理滚动函数
const handleScroll = () => {
  let scrollSetTimer
  if (scrollSetTimer) clearTimeout(scrollSetTimer)
  scrollSetTimer = setTimeout(() => {
    scrollbarToBottom.value =
      scrollbarRef.value?.$el.querySelector('.el-scrollbar__wrap').scrollTop -
      scrollbarRef.value?.$el.querySelector('.el-scrollbar__wrap').scrollHeight +
      scrollbarRef.value?.$el.querySelector('.el-scrollbar__wrap').clientHeight
  }, 500)
}

// 回复滚动函数
const scrollToBottom = () => {
  const scrollContainer = scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap')
  if (scrollContainer) {
    // 使用原生 DOM API 实现滚动
    scrollContainer.scrollTo({
      top: scrollContainer.scrollHeight,
      behavior: 'smooth',
    })
  }
}

// 对话改名函数
const editChatName = async (index: number) => {
  const unchangedTitle = allChats.value[index].title
  if (!interimName.value.trim()) return
  allChats.value[index].title = interimName.value
  const res = await chatStore.updateChatName(allChats.value[index].id, interimName.value)
  if (!res) {
    allChats.value[index].title = unchangedTitle
  }
  // chatStore.editChatName(interimName.value, index)
}

// 对话删除函数
const deleteChat = (index: number) => {
  // 判断是否删除当前对话
  if (index == isViewingChat.value) {
    if (allChats.value[isViewingChat.value].isSending === true) {
      // 消息未发送完成, 阻止删除
      ElMessage({
        message: '当前有消息在响应哦, 请等一下吧',
      })
      return
    }
    isViewingChat.value--
  }
  chatStore.deleteChat(index)
}

// 转化获取内容为 md 格式
function renderMarkdown(markdown: string) {
  return marked(markdown)
}

// 输入框绑定
const nowChat = ref<string>('')
// 输入框按钮颜色检测
const inputButtonColor = ref('#444444')
const inputButtonBgColor = ref('rgb(199.5, 201, 204)')
watch(nowChat, (newValue) => {
  inputButtonBgColor.value = newValue === '' ? 'rgb(199.5, 201, 204)' : ''
  inputButtonColor.value = newValue === '' ? '#444444' : '#fff'
})

// 发送请求函数
async function chatWithModel(chatMessage: string): Promise<void> {
  // 自动滚动距离限制
  const autoScrollHeight = -300
  // 获取变量并固定
  const index = isViewingChat.value
  try {
    // 请求体
    const data = {
      chat_id: allChats.value[isViewingChat.value].id,
      role: 'user',
      content: chatMessage,
    }

    // 添加用户询问到对话历史
    chatHistory.value.push({
      role: data.role,
      content: data.content,
    } as OpenAI.ChatCompletionMessageParam)

    // 设置为对话中
    allChats.value[index].isSending = true

    // 滚动屏幕到底部
    await nextTick(() => scrollToBottom())

    // 回复块操作函数
    let count = 0
    let firstChunk = true
    const addSystemMessage = (content: string) => {
      if (firstChunk) {
        // 添加系统回复到对话历史
        chatHistory.value.push({
          role: 'assistant',
          content: '',
        } as OpenAI.ChatCompletionMessageParam)
        allChats.value[index].isSending = false

        firstChunk = false
      }
      chatHistory.value.at(-1)!.content += content
      // 发送时自动翻页函数
      if (scrollbarToBottom.value! >= autoScrollHeight) {
        count++
        if (count % 15 === 0) {
          scrollToBottom()
        }
      }
    }

    await sendMessageSSE(
      '/chat/messages',
      data as SendMessageSSEParams,
      addSystemMessage,
      (err) => {
        console.error(err)
      },
      () => {
        console.log('一次请求被完成')
      },
    )

    if (scrollbarToBottom.value! >= autoScrollHeight) {
      scrollToBottom()
    }
  } catch (error) {
    console.error('请求出错:', error)
  } finally {
    allChats.value[index].isSending = false
  }
}

// 换行检测函数
const handleKeyup = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    if (event.shiftKey) {
      // 插入换行符
    } else {
      sendChat(nowChat.value) // 发送消息
    }
  }
}

// 发送输入框内容
async function sendChat(chatMessage: string): Promise<void> {
  if (chatMessage.trim() === '') {
    return
  }
  chatWithModel(chatMessage.trim())
  nowChat.value = '' // 清空输入框
}

onMounted(async () => {
  const res = await chatStore.getChatList()
  allChats.value = res
})

onUnmounted(() => {})

watch(
  () => [
    scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap').scrollTop,
    scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap').clientHeight,
    scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap').scrollHeight,
  ],
  () => {
    scrollbarToBottom.value =
      scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap').scrollTop +
      scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap').scrollHeight -
      scrollbarRef.value?.$el?.querySelector('.el-scrollbar__wrap').clientHeight
  },
  { immediate: true },
)
</script>

<template>
  <el-row>
    <!-- 对话菜单 -->
    <el-col id="mainLeft" :span="4">
      <!-- 对话操作菜单 -->
      <el-menu
        active-text-color="#4c6bfb"
        background-color="#f3f4f6"
        text-color="#444444"
        v-model="isViewingChat"
        default-active="-1"
        @select="selectChat"
        style="height: calc(100vh - 16px)"
      >
        <el-menu-item index="-1">
          <div type="primary" id="addChatButton">
            <span style="margin-left: 10px">
              <el-icon style="position: relative; bottom: 0.2vh; left: 2.5px">
                <Plus />
              </el-icon>
              添加新对话
            </span>
          </div>
        </el-menu-item>
        <el-menu-item v-for="(item, index) in allChats" :key="index" :index="index + ''">
          <el-icon>
            <img src="@/assets/message.svg" alt="message" width="17px" style="margin-right: 5px" />
          </el-icon>
          <span v-if="titleNameChanging === index">
            <el-input
              class="input"
              style="width: 90%; margin-right: 10%"
              v-model="interimName"
              @keyup.enter="editChatName(index)"
              @blur="handleBlur(index)"
              autofocus
            >
            </el-input>
          </span>
          <span v-else>{{ item.title }}</span>
          <div id="moreButton" style="position: absolute; right: 15px">
            <el-popover
              ref="titlePopover"
              popper-class="popover"
              placement="right-end"
              :width="200"
              trigger="click"
            >
              <template #reference>
                <el-icon><More /></el-icon>
              </template>
              <div>
                <!-- 注意阻止冒泡 -->
                <el-button
                  link
                  style="
                    width: 100%;
                    height: 30px;
                    color: #3c3c44;
                    font-size: 14px;
                    position: relative;
                    top: 10px;
                  "
                  @click.stop="titleNameChange(index)"
                >
                  <el-icon style="margin-right: 10px">
                    <Edit />
                  </el-icon>
                  重命名
                </el-button>
                <!-- 注意阻止冒泡 -->
                <el-button
                  type="danger"
                  link
                  @click.stop="deleteChat(index)"
                  style="
                    width: 100%;
                    height: 30px;
                    font-size: 14px;
                    position: relative;
                    right: 18.5px;
                    top: 10px;
                  "
                >
                  <el-icon style="margin-right: 10px">
                    <Delete />
                  </el-icon>
                  删除
                </el-button>
              </div>
            </el-popover>
          </div>
        </el-menu-item>
      </el-menu>
    </el-col>
    <el-col id="mainRight" :span="20">
      <!-- 整体回复页 -->
      <div v-if="Number(isViewingChat) >= 0">
        <!-- 顶部标题 -->
        <div id="topTitle">
          {{ allChats[isViewingChat].title }}
        </div>
        <el-scrollbar ref="scrollbarRef" height="80vh" always @scroll="handleScroll">
          <!-- 对话内容展示 -->
          <div id="chatContent" style="white-space: pre-wrap" ref="lastChatDOMRef">
            <div v-for="(item, index) in chatHistory" :key="index">
              <div v-if="item.role === 'user'" class="user">
                {{ item.content }}
              </div>
              <div
                v-else-if="item.role !== 'system'"
                v-html="
                  renderMarkdown(
                    (item.content as string) === ''
                      ? '没有理解您的要求, 请您再说一次'
                      : '' + item.content,
                  )
                "
                class="assistant"
              ></div>
            </div>
            <div v-show="allChats[isViewingChat].isSending" class="assistant">
              <el-icon id="loading">
                <img src="@/assets/loading.svg" alt="loading" width="25px" />
              </el-icon>
            </div>
          </div>
        </el-scrollbar>
        <!-- 对话输入框-平常 -->
        <el-form-item id="mainInput">
          <el-input
            class="input"
            v-model="nowChat"
            :autosize="{ minRows: 3, maxRows: 10 }"
            size="large"
            type="textarea"
            placeholder="给 天穹安防GPT 发送消息"
            style="position: relative; font-size: 1.8vh"
            resize="none"
            @keyup.enter="handleKeyup"
          >
          </el-input>
          <el-button
            type="primary"
            :color="inputButtonBgColor"
            style="position: absolute; right: 1.5vh; bottom: 1.5vh"
            circle
            @click="sendChat(nowChat)"
          >
            <el-icon :size="22" :color="inputButtonColor">
              <Top></Top>
            </el-icon>
          </el-button>
          <el-button
            v-show="scrollbarToBottom! <= -200"
            circle
            size="large"
            style="position: absolute; right: 20px; top: -50px"
            @click="scrollToBottom"
          >
            <el-icon><ArrowDownBold /></el-icon>
          </el-button>
        </el-form-item>
      </div>
      <!-- 新对话页 -->
      <el-form-item id="addNewPage" v-else>
        <div style="width: 100%; text-align: center; position: relative; bottom: 10px">
          <h1>
            <img
              src="@/assets/logo2.jpg"
              alt="logo"
              style="
                width: 5vh;
                height: 5vh;
                border-radius: 100%;
                position: relative;
                top: 1.5vh;
                right: 0.5vh;
              "
            />
            天穹安防GPT
          </h1>
          <span>我是你的小助手,可以完成各种任务,请把你的任务交给我吧~</span>
        </div>
        <!-- 对话输入框-新对话 -->
        <el-input
          class="input"
          v-model="nowChat"
          :autosize="{ minRows: 5, maxRows: 8 }"
          size="large"
          type="textarea"
          placeholder="给 天穹安防GPT 发送消息"
          style="position: relative; font-size: 1.8vh"
          resize="none"
          @keyup.enter="addNewChat"
        >
        </el-input>
        <el-button
          type="primary"
          :color="inputButtonBgColor"
          style="position: absolute; right: 1.5vh; bottom: 1.5vh"
          circle
          @click="sendChat(nowChat)"
        >
          <el-icon :size="22" :color="inputButtonColor">
            <Top></Top>
          </el-icon>
        </el-button>
      </el-form-item>
    </el-col>
  </el-row>
</template>

<style scoped>
body {
  margin: 0;
}

body {
  overflow: hidden;
  padding: 0;

  #mainLeft {
    height: 100%;
    background-color: #fff;
  }

  #mainRight {
    position: relative;
    height: 100%;

    #topTitle {
      height: 4vh;
      margin: 0 auto;
      color: #56667c;
      text-align: center;
      line-height: 4vh;
      font-size: 1.8vh;
      font-weight: bold;
      /* box-shadow: 2px 3px 20px 20px #0c1223;
      z-index: 100; */
    }

    /* background-color: pink; */
    #chatContent {
      max-height: 100vh;
      width: 60%;
      margin: 0 auto;
      background-color: blue;

      .user {
        float: right;
        clear: both;
        width: auto;
        max-width: 60%;
        line-height: 2vh;
        margin: 2vh 0;
        padding: 1.5vh;
        background-color: #f3f4f6;
        border-radius: 1.2vh;
        color: #56667c;
      }

      .assistant {
        position: relative;
        width: auto;
        width: 100%;
        padding: 1.5vh;
        margin: 2vh 0;
        /* background-color: #fff; */
        color: #56667c;
        float: left;

        &::before {
          content: '';
          position: absolute;
          left: -6vh;
          width: 5vh;
          height: 5vh;
          border-radius: 100%;
          background-image: url(@/assets/logo2.jpg);
          background-size: cover;
        }
      }
    }
    /* 通用文本域样式 */
    .input :deep(.el-textarea__inner) {
      height: 200px;
      background-color: #f3f4f6;
      color: #444444;
      border-radius: 20px;
    }

    #mainInput {
      position: absolute;
      bottom: -10vh;
      width: 60%;
      margin: 0 20%;
    }

    #addNewPage {
      width: 50%;
      position: absolute;
      top: 35vh;
      margin: 0 25%;
    }
  }
}

#addChatButton {
  width: 93%;
  height: 40px;
  margin-top: 10px;
  margin-bottom: 10px;
  background-color: #4c6bfb;
  border-radius: 15px;
  font-size: 16px;
  font-weight: bold;
  color: #fff;
  line-height: 40px;

  &:hover {
    background-color: #758cf4;
    /* color: #4c6bfb; */
    cursor: pointer;
  }
}

#loading {
  position: relative;
  top: 1vh;
  font-size: 2.5vh;
  animation: loading 2s linear infinite;
}

@keyframes loading {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>

<style>
/* 弹窗样式自定义 */
.el-popover.popover {
  width: 50px !important;
  min-width: none;
  height: 80px;
  background-color: #fff;
  border: none;
  padding: 0;
}

.popover .popover__arrow::after {
  border-top-color: #000 !important;
}
</style>
