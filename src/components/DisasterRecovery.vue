<template>
  <p class="title" style="position: relative; top: 3vh">
    灾备机制-网络安全灾备机制中各灾备方式占比情况
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

import { onBeforeUnmount, onMounted, ref } from 'vue'
import * as echarts from 'echarts/core'
import { TooltipComponent, LegendComponent } from 'echarts/components'
import { PieChart } from 'echarts/charts'
import { LabelLayout } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 所需的组件
echarts.use([TooltipComponent, LegendComponent, PieChart, CanvasRenderer, LabelLayout])

// 创建 ref 来引用图表容器
const chartRef = ref(null)
// 用于存储 ECharts 实例
let myChart = null
// 定义 option 变量，使其在全局作用域可访问
let option = null

// 初始化图表的函数
const initChart = () => {
  // 通过 ref 获取图表容器的 DOM 元素
  const chartDom = chartRef.value
  if (chartDom) {
    // 初始化 ECharts 实例
    myChart = echarts.init(chartDom)

    // 网络安全 - 灾备机制相关数据
    const disasterRecoveryData = [
      { value: 300, name: '本地备份' },
      { value: 500, name: '异地备份' },
      { value: 200, name: '云备份' },
      { value: 100, name: '磁带库备份' },
      { value: 150, name: '混合备份' },
    ]

    // 定义 ECharts 图表的配置项
    option = {
      // 设置提示框字体样式，包含颜色和大小
      tooltip: {
        trigger: 'item',
        textStyle: {
          fontSize: 12,
        },
        extraCssText: 'width: auto; height: auto;',
      },
      // 设置图例字体样式，包含颜色、位置和大小
      legend: {
        top: '5%',
        textStyle: {
          color: '#AABBF6',
          fontSize: 14,
        },
        itemWidth: 20,
        itemHeight: 14,
        padding: [5, 10],
      },
      series: [
        {
          name: '灾备方式占比',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['50%', '70%'],
          // 调整起始和结束角度
          startAngle: 225,
          endAngle: 315,
          data: disasterRecoveryData,
          // 设置饼图标签字体样式，包含颜色和大小
          label: {
            textStyle: {
              color: '#475567',
              fontSize: 12,
            },
            // 显示标签
            show: true,
            // 标签位置
            position: 'outside',
            // 标签布局
            layout: {
              // 防止标签重叠
              hideOverlap: true,
            },
          },
          // 配置标签指引线
          labelLine: {
            show: true,
            length: 20,
            length2: 30,
            lineStyle: {
              width: 1, // 指引线宽度
            },
          },
        },
      ],
    }

    // 如果配置项存在，则应用到 ECharts 实例上
    if (option) {
      myChart.setOption(option)
    }
  }
}

// 字体等自适应函数
function adjustOption() {
  if (!option || !myChart) return
  const width = window.innerWidth
  const height = window.innerHeight

  // 根据窗口动态调节大小
  const baseSize = 1
  const scaleFactor = Math.min(width / 1920, height / 1080) // 以 1920x1080 为基准

  // 调整提示框字体大小
  option.tooltip.textStyle.fontSize = 12 * scaleFactor

  // 调整图例字体大小、标记大小和内边距
  option.legend.textStyle.fontSize = 14 * scaleFactor
  option.legend.itemWidth = 20 * scaleFactor
  option.legend.itemHeight = 14 * scaleFactor
  option.legend.padding = [5 * scaleFactor, 10 * scaleFactor]

  // 调整饼图标签字体大小
  option.series[0].label.textStyle.fontSize = 12 * scaleFactor

  // 调整提示框里的图例大小
  const tooltipLegendSize = 14 * scaleFactor
  option.tooltip.extraCssText = `
    width: auto;
    height: auto;
    .echarts-tooltip .echarts-tooltip-series-label span {
      width: ${tooltipLegendSize}px;
      height: ${tooltipLegendSize}px;
    }
  `

  // 调整饼图指引线长度
  option.series[0].labelLine.length = 20 * scaleFactor
  option.series[0].labelLine.length2 = 30 * scaleFactor

  // 调整饼图指引线宽度
  option.series[0].labelLine.lineStyle.width = 1 * scaleFactor

  // 将更新后的 option 重新应用到图表
  myChart.setOption(option)
}

// 处理窗口大小变化的函数
const resizeChart = () => {
  if (myChart) {
    myChart.resize()
    adjustOption()
  }
}

// 在组件挂载后初始化图表并监听窗口大小变化
onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
  adjustOption()
})

// 在组件销毁前，销毁 ECharts 实例，移除事件监听器，避免内存泄漏
onBeforeUnmount(() => {
  if (myChart) {
    myChart.dispose()
  }
  window.removeEventListener('resize', resizeChart)
})
</script>

<style scoped>
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
