<template>
  <p class="title" style="position: relative; top: 3vh">流量分析-不同安全等级设备各协议流量分析</p>
  <div
    ref="chartRef"
    :style="{ width: props.width, height: props.height }"
    style="position: relative; top: 2vh"
  ></div>
</template>

<script setup lang="ts">
// props 传参
const props = withDefaults(
  defineProps<{
    height: string // 必传，类型为 string
    width?: string // 可选，类型为 string
  }>(),
  {
    height: '30vh',
    width: '100%', // 默认值（如果未传 width，则使用 '100%'）
  },
)

import { ref, onMounted, onBeforeUnmount } from 'vue'
// 按需引入 echarts 核心模块
import * as echarts from 'echarts/core'
// 引入需要的组件
import {
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
} from 'echarts/components'
// 引入折线图图表
import { LineChart } from 'echarts/charts'
// 引入过渡效果
import { UniversalTransition } from 'echarts/features'
// 引入 Canvas 渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  TitleComponent,
  ToolboxComponent,
  TooltipComponent,
  GridComponent,
  LineChart,
  CanvasRenderer,
  UniversalTransition,
])

// 使用 ref 创建一个响应式的 DOM 引用
const chartRef = ref(null)
let myChart = null
let option = null

const names = ['TCP 协议', 'UDP 协议', 'ICMP 协议', 'FTP 协议', 'HTTP 协议']
const levels = ['高', '较高', '中', '较低', '低', '无明确等级']

const trafficData = [
  [1500, 800, 200, 100, 300],
  [1200, 700, 180, 80, 250],
  [900, 600, 150, 60, 200],
  [600, 500, 120, 40, 150],
  [300, 400, 100, 20, 100],
  [600, 850, 210, 30, 420],
]

// 生成系列列表
const generateSeriesList = () => {
  const seriesList = []
  for (let i = 0; i < names.length; i++) {
    const data = []
    for (let j = 0; j < levels.length; j++) {
      data.push(trafficData[j][i])
    }
    const series = {
      name: names[i],
      symbolSize: 8,
      type: 'line',
      smooth: true,
      emphasis: {
        focus: 'series',
      },
      endLabel: {
        show: false,
        formatter: '{a}',
        distance: 20,
        textStyle: {
          color: '#3C9DFF', // 设置折线末端标签字体颜色
        },
      },
      lineStyle: {
        width: 4,
      },
      data,
    }
    seriesList.push(series)
  }
  return seriesList
}

// 初始化图表的函数
const initChart = () => {
  // 获取图表容器的 DOM 元素
  const chartDom = chartRef.value
  // 初始化 ECharts 实例
  myChart = echarts.init(chartDom)
  // 配置图表选项
  option = {
    title: {
      // text: '不同安全等级设备各协议流量分析'
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        fontSize: 12,
      },
      extraCssText: 'width: auto; height: auto;',
    },
    grid: {
      left: '3%',
      right: '15%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    toolbox: {
      feature: {
        saveAsImage: {},
      },
    },
    xAxis: {
      type: 'category',
      splitLine: {
        show: true,
        lineStyle: {
          width: 1,
        },
      },
      axisLine: {
        lineStyle: {
          width: 1,
        },
      },
      axisLabel: {
        margin: 30,
        fontSize: 14,
        interval: '0', // 自动调整标签显示间隔
        textStyle: {
          color: '#475567', // X 轴标签字体颜色设置
        },
      },
      boundaryGap: false,
      data: levels,
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          width: 1,
        },
      },
      splitLine: {
        lineStyle: {
          width: 1,
        },
      },
      axisLabel: {
        margin: 30,
        fontSize: 16,
        formatter: '{value}',
        textStyle: {
          color: '#475567', // Y 轴标签字体颜色设置
        },
      },
      min: 0,
    },
    legend: {
      textStyle: {
        color: '#3C9DFF',
        fontSize: 14,
      },
      itemWidth: 20,
      itemHeight: 14,
    },
    series: generateSeriesList(),
  }
  // 应用配置项
  myChart.setOption(option)
}

// 调整图表配置以适应窗口大小的函数
const adjustChartOptions = () => {
  if (!option || !myChart) return

  const scaleFactor = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
  const minFontSize = 8

  // 调整提示框字体大小
  option.tooltip.textStyle.fontSize = Math.max(minFontSize, 12 * scaleFactor)
  const tooltipLegendSize = Math.max(minFontSize, 14 * scaleFactor)
  option.tooltip.extraCssText = `
        width: auto;
        height: auto;
        .echarts-tooltip .echarts-tooltip-series-label span {
            width: ${tooltipLegendSize}px;
            height: ${tooltipLegendSize}px;
        }
    `

  // 调整 X 轴标签字体大小
  option.xAxis.axisLabel.fontSize = Math.max(minFontSize, 14 * scaleFactor)

  // 调整 Y 轴标签字体大小
  option.yAxis.axisLabel.fontSize = Math.max(minFontSize, 16 * scaleFactor)

  // 调整图例字体大小和标记大小
  option.legend.textStyle.fontSize = Math.max(minFontSize, 14 * scaleFactor)
  option.legend.itemWidth = Math.max(minFontSize, 20 * scaleFactor)
  option.legend.itemHeight = Math.max(minFontSize, 14 * scaleFactor)

  // 调整折线图的线宽和标记大小
  option.series.forEach((series) => {
    series.symbolSize = Math.max(4, 8 * scaleFactor)
    series.lineStyle.width = Math.max(2, 4 * scaleFactor)
  })

  // 调整 X 轴坐标线和分割线宽度
  option.xAxis.axisLine.lineStyle.width = Math.max(1, 1 * scaleFactor)
  option.xAxis.splitLine.lineStyle.width = Math.max(1, 1 * scaleFactor)

  // 调整 Y 轴坐标线和分割线宽度
  option.yAxis.axisLine.lineStyle.width = Math.max(1, 1 * scaleFactor)
  option.yAxis.splitLine.lineStyle.width = Math.max(1, 1 * scaleFactor)

  // 更新图表配置
  myChart.setOption(option)
}

// 处理窗口大小变化的函数
const handleWindowResize = () => {
  if (myChart) {
    myChart.resize()
    adjustChartOptions()
  }
}

// 在组件挂载后初始化图表并监听窗口大小变化
onMounted(() => {
  initChart()
  window.addEventListener('resize', handleWindowResize)
  adjustChartOptions()
})

// 在组件卸载前销毁图表实例并移除事件监听器
onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<style scoped>
/* 可以在这里添加组件的样式 */
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
