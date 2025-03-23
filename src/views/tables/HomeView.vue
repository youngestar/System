<script setup lang="ts">
// 封装图表引用
import Loading from '@/components/Loading.vue'
import DisasterRecovery from '@/components/DisasterRecovery.vue'
import SituationalAwareness from '@/components/SituationalAwareness.vue'
import VulnerabilityManagement from '@/components/VulnerabilityManagement.vue'
import DailyOperations from '@/components/DailyOperations.vue'
import PrivilegeRestriction from '@/components/PrivilegeRestriction.vue'
import AttackAttribution from '@/components/AttackAttribution.vue'
import BaselineAudit from '@/components/BaselineAudit.vue'
import TrafficAnalysis from '@/components/TrafficAnalysis.vue'

// element-plus 组件调用
import { ElDialog } from 'element-plus'
import { FullScreen } from '@element-plus/icons-vue'

// vue 调用
import { ref, shallowRef, type DefineComponent, type Ref } from 'vue'

// 接口: 传入 props
interface echartsStyle {
  height: string
  width?: string
}

const fullScreenVisible = ref(false)

// 弹窗显示的组件及组件样式
const showingCharts = shallowRef<DefineComponent<object, object, any> | null>()
const echartsStyle: Ref<echartsStyle> = ref({ height: '27vh' })
// 通用样式
const commonHeight: string = '60vh'
const commonWidth: string = '70vw'

// 弹窗展示图表函数
const showCharts = (charts: DefineComponent<object, object, any> | null, props: echartsStyle) => {
  showingCharts.value = charts
  fullScreenVisible.value = true
  echartsStyle.value = props
}
</script>

<template>
  <div>
    <el-dialog
      v-model="fullScreenVisible"
      :style="{ width: '70%', height: '70vh' }"
      class="echartsMessageBox"
      :showClose="false"
    >
      <div>
        <component :is="showingCharts" :height="echartsStyle.height" :width="echartsStyle?.width" />
      </div>
    </el-dialog>
  </div>
  <el-row>
    <el-col :span="7">
      <div class="container">
        <div class="container-footer">
          <!-- 漏洞维护 -->
          <VulnerabilityManagement></VulnerabilityManagement>
          <div
            @click="
              showCharts(VulnerabilityManagement, { height: commonHeight, width: commonWidth })
            "
            class="full-screen"
          >
            <el-icon><FullScreen /></el-icon>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="container-footer">
          <!-- 灾备机制 -->
          <DisasterRecovery></DisasterRecovery>
          <div
            @click="showCharts(DisasterRecovery, { height: commonHeight, width: commonWidth })"
            class="full-screen"
          >
            <el-icon style="position: relative; top: 3vh"><FullScreen /></el-icon>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="container-footer">
          <!-- 态势感知 -->
          <SituationalAwareness></SituationalAwareness>
          <div
            @click="showCharts(SituationalAwareness, { height: commonHeight, width: commonWidth })"
            class="full-screen"
          >
            <el-icon style="position: relative; top: 6vh"><FullScreen /></el-icon>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="10">
      <div id="mainTitle" style="display: flex; justify-content: space-between">
        <span>
          <Loading></Loading>
        </span>
        <span>日志记录</span>
        <span>
          <Loading></Loading>
        </span>
      </div>
      <div id="mainTop">
        <div class="mainTop-footer"></div>
        <!-- 日常运维 -->
        <DailyOperations></DailyOperations>
        <div
          @click="showCharts(DailyOperations, { height: commonHeight, width: commonWidth })"
          class="full-screen"
        >
          <el-icon><FullScreen /></el-icon>
        </div>
      </div>
      <div id="mainBottom">
        <div class="mainBottom-footer">
          <div class="mainBottom-img">
            <!-- 权限抑制 -->
            <PrivilegeRestriction></PrivilegeRestriction>
            <div
              @click="
                showCharts(PrivilegeRestriction, { height: commonHeight, width: commonWidth })
              "
              class="full-screen"
            >
              <el-icon><FullScreen /></el-icon>
            </div>
          </div>
        </div>
      </div>
    </el-col>
    <el-col :span="7">
      <div class="container">
        <div class="container-footer">
          <!-- 攻击溯源 -->
          <AttackAttribution></AttackAttribution>
        </div>
        <div
          @click="showCharts(AttackAttribution, { height: commonHeight, width: commonWidth })"
          class="full-screen"
        >
          <el-icon style="position: relative; bottom: 1vh"><FullScreen /></el-icon>
        </div>
      </div>
      <div class="container">
        <div class="container-footer">
          <!-- 基线排查 -->
          <BaselineAudit></BaselineAudit>
          <div
            @click="showCharts(BaselineAudit, { height: commonHeight, width: commonWidth })"
            class="full-screen"
          >
            <el-icon style="position: relative; top: 3vh"><FullScreen /></el-icon>
          </div>
        </div>
      </div>
      <div class="container">
        <div class="container-footer">
          <!-- 流量分析 -->
          <TrafficAnalysis></TrafficAnalysis>
          <div
            @click="showCharts(TrafficAnalysis, { height: commonHeight, width: commonWidth })"
            class="full-screen"
          >
            <el-icon style="position: relative; top: 3vh"><FullScreen /></el-icon>
          </div>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
.el-col {
  width: 100%;
  height: 95vh;
  /* border: 1px solid #56667C; */
}

#mainTitle {
  position: relative;
  width: 96%;
  height: 7vh;
  margin: auto;
  padding: 0 2%;
  text-align: center;
  font-size: 5vh;
  border-bottom: 0.1em solid #02a6b5;
}

#mainTop {
  position: relative;
  width: 96%;
  margin: 0.5vh auto;
  height: 58%;
  margin-top: 1.5%;
  /* 背景黑色卡片 */
  background-color: rgba(242, 245, 255, 0.1);
  border: 1px solid rgba(56, 209, 163, 0.17);

  /* 背景图片设置 */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(/src/assets/2_gif_2.gif);
    background-size: cover;
    opacity: 0.3;
    /* 设置透明度，取值范围 0 - 1，0 为完全透明，1 为完全不透明 */
    z-index: -1;
    /* 确保伪元素在内容下方 */
  }

  .mainTop-footer {
    position: absolute;
    width: 100%;
    height: 100%;

    &::before {
      position: absolute;
      top: 0;
      left: 0;
      content: '';
      width: 2.5vw;
      height: 2.5vh;
      border-top: 0.4vh solid #02a6b5;
      border-left: 0.4vh solid #02a6b5;
    }

    &::after {
      position: absolute;
      bottom: 0;
      right: 0;
      content: '';
      width: 2.5vw;
      height: 2.5vh;
      border-bottom: 0.4vh solid #02a6b5;
      border-right: 0.4vh solid #02a6b5;
    }
  }
}

#mainBottom {
  position: relative;
  width: 96%;
  height: 33.3%;
  margin: 1vh auto;
  background-color: rgba(242, 245, 255, 0.1);
  border: 1px solid rgba(56, 209, 163, 0.17);

  &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 1.5vw;
    height: 1.5vh;
    border-top: 0.3vh solid #02a6b5;
    border-left: 0.3vh solid #02a6b5;
    content: '';
  }

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    width: 1.5vw;
    height: 1.5vh;
    border-top: 0.3vh solid #02a6b5;
    border-right: 0.3vh solid #02a6b5;
    content: '';
  }

  .mainBottom-img::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url(/src/assets/2_gif_3.gif);
    background-size: cover;
    opacity: 0.4;
    /* 设置透明度，取值范围 0 - 1，0 为完全透明，1 为完全不透明 */
    z-index: -1;
    /* 确保伪元素在内容下方 */
  }

  .mainBottom-footer {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .mainBottom-footer::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 1.5vw;
    height: 1.5vh;
    border-bottom: 0.3vh solid #02a6b5;
    border-left: 0.3vh solid #02a6b5;
  }

  .mainBottom-footer::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 1.5vw;
    height: 1.5vh;
    border-bottom: 0.3vh solid #02a6b5;
    border-right: 0.3vh solid #02a6b5;
  }
}

.container {
  position: relative;
  width: 100%;
  height: 33%;
  margin-top: 1.5%;
  background-color: rgba(242, 245, 255, 0.5);
  border: 1px solid rgba(56, 209, 163, 0.17);
  border-radius: 2vh;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.3);
  /* &::before {
    position: absolute;
    top: 0;
    left: 0;
    width: 2vh;
    height: 2vh;
    border-top: 0.25vh solid #02a6b5;
    border-left: 0.25vh solid #02a6b5;
    content: '';
    border-radius: 2vh;
  }

  &::after {
    position: absolute;
    top: 0;
    right: 0;
    width: 2vh;
    height: 2vh;
    border-top: 0.25vh solid #02a6b5;
    border-right: 0.25vh solid #02a6b5;
    content: '';
    border-radius: 2vh;
  } */
}

.container-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  /* border-radius:; */
  /* &::before {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 2vh;
    height: 2vh;
    border-bottom: 0.25vh solid #02a6b5;
    border-left: 0.25vh solid #02a6b5;
    content: '';
    border-radius: 2vh;
  }

  &::after {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 2vh;
    height: 2vh;
    border-bottom: 0.25vh solid #02a6b5;
    border-right: 0.25vh solid #02a6b5;
    content: '';
    border-radius: 2vh;
  } */
}

.full-screen {
  position: absolute;
  top: 2vh;
  right: 2vh;
  font-size: 2vh;
  transition: color 0.75s;
  &:hover {
    cursor: pointer;
    color: #00bfff;
  }
}

:v-deep .echartsMessageBox {
  background-color: #000 !important;
}
</style>

<style>
body {
  width: 100%;
  height: 100%;
  background-image: url(/src/assets/2_bg_2.jpg);
  background-size: cover;
  color: #56667c;
}

.echartsMessageBox {
  background-image: url(/src/assets/2_gif_2.gif);
  background-size: cover;
  border: 2px solid #02a6b5;
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: #000 !important;
    opacity: 0.3;
  }
  p {
    color: #56667c;
    font-weight: bold;
  }
}

/* 废案: 边角样式
 .echartsMessageBoxIn {
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    width: 3vh;
    height: 3vh;
    border-top: 0.25vh solid #02a6b5;
    border-left: 0.25vh solid #02a6b5;
    content: '';
  }
} */
</style>
