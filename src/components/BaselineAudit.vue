<template>
  <p class="title" style="position: relative; top: 3vh">
    基线排查-网络安全基线排查各类问题占比对比
  </p>
  <div ref="chartRef" :style="{ width: props.width, height: props.height }"></div>
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
import { DatasetComponent, TransformComponent } from 'echarts/components'
// 引入饼图图表
import { PieChart } from 'echarts/charts'
// 引入标签布局功能
import { LabelLayout } from 'echarts/features'
// 引入 Canvas 渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([DatasetComponent, TransformComponent, PieChart, CanvasRenderer, LabelLayout])

// 使用 ref 创建一个响应式的 DOM 引用
const chartRef = ref(null)
let myChart = null
let option = null

// 初始化图表的函数
const initChart = () => {
  // 获取图表容器的 DOM 元素
  const chartDom = chartRef.value
  // 初始化 ECharts 实例
  myChart = echarts.init(chartDom)

  // 网络安全 - 基线排查数据
  const securityData = [
    ['SecurityIssue', 'Count', 'Year'],
    ['漏洞', 50, 2021],
    ['恶意软件', 30, 2021],
    ['违规访问', 20, 2021],
    ['配置错误', 10, 2021],
    ['漏洞', 60, 2022],
    ['恶意软件', 40, 2022],
    ['违规访问', 25, 2022],
    ['配置错误', 15, 2022],
    ['漏洞', 70, 2023],
    ['恶意软件', 50, 2023],
    ['违规访问', 30, 2023],
    ['配置错误', 20, 2023],
  ]

  // 配置图表选项
  option = {
    title: {
      textStyle: {
        fontSize: 18,
      },
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        fontSize: 14,
      },
      extraCssText: 'width: auto; height: auto;',
    },
    dataset: [
      {
        source: securityData,
      },
      {
        transform: {
          type: 'filter',
          config: { dimension: 'Year', value: 2021 },
        },
      },
      {
        transform: {
          type: 'filter',
          config: { dimension: 'Year', value: 2022 },
        },
      },
      {
        transform: {
          type: 'filter',
          config: { dimension: 'Year', value: 2023 },
        },
      },
    ],
    series: [
      {
        type: 'pie',
        radius: ['0%', '10%'],
        center: ['50%', '25%'],
        datasetIndex: 1,
        label: {
          formatter: '{b}: {d}%',
          textStyle: {
            fontSize: 10,
            color: '#475567',
          },
        },
        labelLine: {
          length: 10,
          length2: 10,
          lineStyle: {
            width: 1,
          },
        },
      },
      {
        type: 'pie',
        radius: ['0%', '10%'],
        center: ['50%', '50%'],
        datasetIndex: 2,
        label: {
          formatter: '{b}: {d}%',
          textStyle: {
            fontSize: 10,
            color: '#475567',
          },
        },
        labelLine: {
          length: 10,
          length2: 10,
          lineStyle: {
            width: 1,
          },
        },
      },
      {
        type: 'pie',
        radius: ['0%', '10%'],
        center: ['50%', '75%'],
        datasetIndex: 3,
        label: {
          formatter: '{b}: {d}%',
          textStyle: {
            fontSize: 10,
            color: '#475567',
          },
        },
        labelLine: {
          length: 10,
          length2: 10,
          lineStyle: {
            width: 1,
          },
        },
      },
    ],
    media: [
      {
        query: { minAspectRatio: 1 },
        option: {
          series: [
            { center: ['25%', '50%'] },
            { center: ['50%', '50%'] },
            { center: ['75%', '50%'] },
          ],
        },
      },
      {
        option: {
          series: [
            { center: ['50%', '25%'] },
            { center: ['50%', '50%'] },
            { center: ['50%', '75%'] },
          ],
        },
      },
    ],
  }

  // 应用配置项
  myChart.setOption(option)
}

// 调整图表配置以适应窗口大小的函数
const adjustChartOptions = () => {
  if (!option || !myChart) return

  const scaleFactor = Math.min(window.innerWidth / 1920, window.innerHeight / 1080)
  const minFontSize = 6
  const minLineWidth = 0.5

  // 调整标题字体大小
  option.title.textStyle.fontSize = Math.max(minFontSize, 18 * scaleFactor)

  // 调整提示框字体大小
  option.tooltip.textStyle.fontSize = Math.max(minFontSize, 14 * scaleFactor)
  const tooltipLegendSize = Math.max(minFontSize, 10 * scaleFactor)
  option.tooltip.extraCssText = `
      width: auto;
      height: auto;
      .echarts-tooltip .echarts-tooltip-series-label span {
        width: ${tooltipLegendSize}px;
        height: ${tooltipLegendSize}px;
      }
    `

  // 调整饼图标签字体大小、半径、指引线长度和宽度
  option.series.forEach((series) => {
    series.label.textStyle.fontSize = Math.max(minFontSize, 10 * scaleFactor)
    // 调整饼图的半径大小
    series.radius = ['0%', `${Math.min(40, 40 * scaleFactor)}%`]
    series.labelLine.length = Math.max(5, 10 * scaleFactor)
    series.labelLine.length2 = Math.max(5, 10 * scaleFactor)
    series.labelLine.lineStyle.width = Math.max(minLineWidth, 1 * scaleFactor)
  })

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
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
