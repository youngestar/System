<template>
  <!-- 中心大图 -->
  <div
    ref="chartRef"
    :style="{ width: props.width, height: props.height }"
    style="margin-top: 1.5vh; margin-left: 1.5vh"
  ></div>
  <div id="button">
    <el-button-group>
      <el-button
        :type="isChartSwitchingPaused ? 'primary' : ''"
        :disabled="isChartSwitchingPaused"
        @click="toggleChartSwitching"
      >
        暂停切换
      </el-button>
      <el-button
        :type="!isChartSwitchingPaused ? 'primary' : ''"
        :disabled="!isChartSwitchingPaused"
        @click="toggleChartSwitching"
      >
        正常切换
      </el-button>
    </el-button-group>
    <el-button type="primary" @click="quickSwitchChart" style="z-index: 99">快速切换</el-button>
  </div>
</template>

<script setup lang="ts">
// props 传参
const props = withDefaults(
  defineProps<{
    height: string // 必传，类型为 string
    width?: string // 可选，类型为 string
  }>(),
  {
    height: '45vh',
    width: '100%', // 默认值（如果未传 width，则使用 '100%'）
  },
)

import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts/core'
import { GridComponent } from 'echarts/components'
import { ScatterChart, BarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GridComponent, ScatterChart, BarChart, CanvasRenderer, UniversalTransition])

// 定义图表容器的 ref
const chartRef = ref(null)
let myChart = null
let intervalId = null

// 模拟网络安全 - 日常运维数据
// 散点图数据：[漏洞严重程度, 发现的漏洞数量, 漏洞修复时间（天）]
const vulnerabilityData = []
const numDataPoints = 200
const numSeverityLevels = 10
const pointsPerLevel = Math.floor(numDataPoints / numSeverityLevels)

// 生成更均匀分布的数据
for (let severity = 1; severity <= numSeverityLevels; severity++) {
  for (let i = 0; i < pointsPerLevel; i++) {
    const quantity = Math.floor(Math.random() * 20) + 5
    // 修改修复时间的生成范围为 4 到 12 天
    const repairTime = Math.floor(Math.random() * 9) + 4
    vulnerabilityData.push([severity, quantity, repairTime])
  }
}

// 处理剩余的数据点，确保总数达到 numDataPoints
const remainingPoints = numDataPoints % numSeverityLevels
for (let i = 0; i < remainingPoints; i++) {
  const severity = i + 1
  const quantity = Math.floor(Math.random() * 20) + 5
  const repairTime = Math.floor(Math.random() * 9) + 4
  vulnerabilityData.push([severity, quantity, repairTime])
}

// 柱状图数据：不同时间段不同类型安全事件的发生次数
const securityEventData = [
  {
    timePeriod: '第 1 周',
    events: [
      { name: 'DDoS 攻击', value: 30 },
      { name: '恶意软件感染', value: 25 },
      { name: '漏洞利用尝试', value: 20 },
      { name: '数据泄露', value: 15 },
      { name: '异常登录', value: 10 },
    ],
  },
  {
    timePeriod: '第 2 周',
    events: [
      { name: 'DDoS 攻击', value: 25 },
      { name: '恶意软件感染', value: 22 },
      { name: '漏洞利用尝试', value: 18 },
      { name: '数据泄露', value: 12 },
      { name: '异常登录', value: 8 },
    ],
  },
  {
    timePeriod: '第 3 周',
    events: [
      { name: 'DDoS 攻击', value: 28 },
      { name: '恶意软件感染', value: 23 },
      { name: '漏洞利用尝试', value: 19 },
      { name: '数据泄露', value: 13 },
      { name: '异常登录', value: 9 },
    ],
  },
  {
    timePeriod: '第 4 周',
    events: [
      { name: 'DDoS 攻击', value: 26 },
      { name: '恶意软件感染', value: 21 },
      { name: '漏洞利用尝试', value: 17 },
      { name: '数据泄露', value: 11 },
      { name: '异常登录', value: 7 },
    ],
  },
  {
    timePeriod: '第 5 周',
    events: [
      { name: 'DDoS 攻击', value: 32 },
      { name: '恶意软件感染', value: 24 },
      { name: '漏洞利用尝试', value: 20 },
      { name: '数据泄露', value: 14 },
      { name: '异常登录', value: 10 },
    ],
  },
]

// 散点图配置
const scatterOption = {
  animation: true,
  animationDuration: 1500,
  animationEasing: 'cubicOut',
  title: {
    text: '日常运维-漏洞严重程度、数量与修复时间分布',
    textStyle: {
      color: '#56667c',
    },
  },
  tooltip: {
    trigger: 'item',
    formatter: function (params) {
      return `漏洞严重程度: ${params.data[0]}<br>发现的漏洞数量: ${params.data[1]}<br>漏洞修复时间: ${params.data[2]} 天`
    },
    textStyle: {},
  },
  grid: {
    left: '5%',
    right: '13%',
    bottom: '15%',
    top: '18%',
    containLabel: true,
  },
  xAxis: {
    type: 'value',
    name: '严重程度',
    scale: true,
    max: 10,
    axisLabel: {
      color: '#475567',
    },
    nameTextStyle: {
      color: '#475567',
    },
    axisLine: {
      lineStyle: {
        width: 1,
      },
    },
    axisTick: {
      length: 5,
    },
    splitLine: {
      lineStyle: {
        width: 1,
      },
    },
  },
  yAxis: {
    type: 'value',
    name: '发现的漏洞数量',
    scale: true,
    axisLabel: {
      color: '#475567',
    },
    nameTextStyle: {
      color: '#475567',
    },
    axisLine: {
      lineStyle: {
        width: 1,
      },
    },
    axisTick: {
      length: 5,
    },
    splitLine: {
      lineStyle: {
        width: 1,
      },
    },
  },
  visualMap: {
    min: 4,
    max: 12,
    dimension: 2,
    orient: 'horizontal',
    left: 'center',
    bottom: 10,
    text: ['修复时间长', '修复时间短'],
    inRange: {
      color: ['#80FFA5', '#00DDFF', '#FF0087'],
    },
    calculable: true,
    textStyle: {
      color: '#3C9DFF',
    },
  },
  series: [
    {
      type: 'scatter',
      id: 'vulnerability',
      dataGroupId: 'vulnerability',
      symbolSize: function (data) {
        return data[2] * 2
      },
      itemStyle: {
        color: function (params) {
          const severity = params.data[0]
          if (severity === 1) return '#80FFA5'
          if (severity === 2) return '#00DDFF'
          if (severity === 3) return '#37A2FF'
          if (severity === 4) return '#FFBF00'
          return '#FF0087'
        },
      },
      universalTransition: {
        enabled: true,
        delay: function (idx, count) {
          return Math.random() * 500
        },
        duration: 1500,
      },
      data: vulnerabilityData,
    },
  ],
}

// 柱状图配置
const barOption = {
  animation: true,
  animationDuration: 1500,
  animationEasing: 'cubicOut',
  title: {
    text: '日常运维-不同时间段不同类型安全事件发生次数',
    textStyle: {
      color: '#56667c',
    },
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow',
    },
    textStyle: {},
  },
  legend: {
    data: securityEventData[0].events.map((item) => item.name),
    textStyle: {
      color: '#3C9DFF',
    },
    top: '8%',
    itemWidth: 20,
    itemHeight: 14,
    padding: [5, 10],
  },
  grid: {
    left: '2%',
    right: '4%',
    bottom: '3%',
    top: '20%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    data: securityEventData.map((item) => item.timePeriod),
    axisLabel: {
      color: '#475567',
    },
    nameTextStyle: {
      color: '#475567',
    },
    axisLine: {
      lineStyle: {
        width: 1,
      },
    },
    axisTick: {
      length: 5,
    },
    splitLine: {
      lineStyle: {
        width: 1,
      },
    },
  },
  yAxis: {
    type: 'value',
    name: '发生次数',
    axisLabel: {
      color: '#475567',
    },
    nameTextStyle: {
      color: '#475567',
    },
    axisLine: {
      lineStyle: {
        width: 1,
      },
    },
    axisTick: {
      length: 5,
    },
    splitLine: {
      lineStyle: {
        width: 1,
      },
    },
  },
  series: securityEventData[0].events.map((event, index) => {
    const colors = ['#80FFA5', '#00DDFF', '#37A2FF', '#FFBF00', '#FF0087']
    return {
      name: event.name,
      type: 'bar',
      stack: 'total',
      itemStyle: {
        color: colors[index],
      },
      data: securityEventData.map((item) => item.events[index].value),
      universalTransition: {
        enabled: true,
        delay: function (idx, count) {
          return Math.random() * 500
        },
        duration: 1500,
      },
    }
  }),
}

let currentOption = scatterOption
const isChartSwitchingPaused = ref(false)
// 记录原始的 symbolSize 函数
const originalScatterSymbolSize = scatterOption.series[0].symbolSize

// 初始化图表函数
const initChart = () => {
  const chartDom = chartRef.value
  if (chartDom) {
    myChart = echarts.init(chartDom)
    myChart.setOption(currentOption, true)
    // 启动定时器
    startInterval()
    adjustOption()
  }
}

// 启动定时器的函数
const startInterval = () => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  intervalId = setInterval(() => {
    if (!isChartSwitchingPaused.value) {
      currentOption = currentOption === scatterOption ? barOption : scatterOption
      myChart.setOption(currentOption, true)
      adjustOption()
    }
  }, 5000)
}

// 切换图表切换状态的函数
const toggleChartSwitching = () => {
  isChartSwitchingPaused.value = !isChartSwitchingPaused.value
  if (!isChartSwitchingPaused.value) {
    startInterval()
  } else {
    clearInterval(intervalId)
  }
}

// 快速切换图表的函数
const quickSwitchChart = () => {
  currentOption = currentOption === scatterOption ? barOption : scatterOption
  myChart.setOption(currentOption, true)
  // 重置计时器
  startInterval()
  adjustOption()
}

// 字体等自适应函数
function adjustOption() {
  if (!currentOption || !myChart) return
  const width = window.innerWidth
  const height = window.innerHeight
  const scaleFactor = Math.min(width / 1920, height / 1080)

  // 调整标题字体大小
  if (currentOption.title) {
    currentOption.title.textStyle.fontSize = 18 * scaleFactor
  }

  // 调整提示框字体大小
  if (currentOption.tooltip) {
    currentOption.tooltip.textStyle.fontSize = 14 * scaleFactor
  }

  // 调整图例字体大小、尺寸和内边距
  if (currentOption.legend) {
    currentOption.legend.textStyle.fontSize = 14 * scaleFactor
    currentOption.legend.itemWidth = 20 * scaleFactor
    currentOption.legend.itemHeight = 14 * scaleFactor
    currentOption.legend.padding = [5 * scaleFactor, 10 * scaleFactor]
  }

  // 调整 x 轴和 y 轴标签及名称字体大小、轴线宽度、刻度长度、分割线宽度
  const adjustAxis = (axis) => {
    if (axis) {
      const axes = Array.isArray(axis) ? axis : [axis]
      axes.forEach((ax) => {
        ax.axisLabel.fontSize = 14 * scaleFactor
        ax.nameTextStyle.fontSize = 14 * scaleFactor
        ax.axisLine.lineStyle.width = 2 * scaleFactor
        ax.axisTick.length = 5 * scaleFactor
        ax.splitLine.lineStyle.width = 2 * scaleFactor
      })
    }
  }
  adjustAxis(currentOption.xAxis)
  adjustAxis(currentOption.yAxis)

  // 调整视觉映射组件字体大小和位置
  if (currentOption.visualMap) {
    currentOption.visualMap.textStyle.fontSize = 14 * scaleFactor
    currentOption.visualMap.bottom = 10 * scaleFactor
    currentOption.visualMap.itemWidth = 20 * scaleFactor
    currentOption.visualMap.itemHeight = 140 * scaleFactor
  }

  // 调整散点图散点大小
  if (
    currentOption.series &&
    currentOption.series[0] &&
    currentOption.series[0].type === 'scatter'
  ) {
    currentOption.series[0].symbolSize = function (data) {
      return originalScatterSymbolSize(data) * scaleFactor
    }
  }

  // 将更新后的 option 重新应用到图表
  myChart.setOption(currentOption)
}

// 处理窗口大小变化的函数
const resizeChart = () => {
  if (myChart) {
    myChart.resize()
    adjustOption()
  }
}

// 挂载生命周期钩子函数
onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

// 卸载生命周期钩子函数
onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
  }
  if (intervalId) {
    clearInterval(intervalId)
  }
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
#button {
  display: flex;
  justify-content: space-between;
  margin: 1vh 2vw;
  .el-button {
    width: 10vh;
    height: 3vh;
    font-size: 1.5vh;
  }
}
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
