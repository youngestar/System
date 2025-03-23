<template>
  <p class="title" style="position: relative; top: 3vh">
    攻击溯源-各攻击类型下多种溯源方式的成果对比
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

// 图表配置部分
import { ref, onMounted, onBeforeUnmount } from 'vue'
// 按需引入 echarts 核心模块
import * as echarts from 'echarts/core'
// 引入需要的组件
import {
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
} from 'echarts/components'
// 引入柱状图图表
import { BarChart } from 'echarts/charts'
// 引入 Canvas 渲染器
import { CanvasRenderer } from 'echarts/renderers'

// 注册必须的组件
echarts.use([
  TooltipComponent,
  GridComponent,
  LegendComponent,
  MarkLineComponent,
  BarChart,
  CanvasRenderer,
])

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
  option = {
    // 设置提示框字体颜色和大小
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      textStyle: {
        fontSize: 12,
      },
      extraCssText: 'width: auto; height: auto;',
    },
    // 设置图例字体颜色、大小和位置
    // legend: {
    //     top: '5%',
    //     textStyle: {
    //         color: '#3C9DFF',
    //         fontSize: 12
    //     },
    //     itemWidth: 15,
    //     itemHeight: 15
    // },
    grid: {
      left: '5%',
      right: '4%',
      bottom: '2%',
      top: '15%',
      containLabel: true,
    },
    // 设置 X 轴标签字体颜色和大小
    xAxis: [
      {
        type: 'category',
        // 假设为一周内不同攻击类型溯源成功的天数分布
        data: ['DDoS攻击', 'SQL注入', '网络钓鱼', '恶意软件', 'XSS攻击', '漏洞利用', '其他'],
        axisLabel: {
          textStyle: {
            color: '#475567',
            fontSize: 12,
          },
          rotate: window.innerWidth < 600 ? 45 : 0,
        },
        axisLine: {
          lineStyle: {
            color: '#475567',
            width: 1,
          },
        },
        axisTick: {
          lineStyle: {
            color: '#475567',
            width: 1,
          },
        },
      },
    ],
    // 设置 Y 轴标签和名称字体颜色和大小
    yAxis: [
      {
        type: 'value',
        // 假设y轴为溯源成功次数
        name: '溯源成功次数',
        nameTextStyle: {
          color: '#475567',
          fontSize: 12,
        },
        axisLabel: {
          textStyle: {
            color: '#475567',
            fontSize: 12,
          },
        },
        axisLine: {
          lineStyle: {
            color: '#475567',
            width: 1,
          },
        },
        axisTick: {
          lineStyle: {
            color: '#475567',
            width: 1,
          },
        },
      },
    ],
    series: [
      {
        // 直接溯源成功，比如通过直接获取到攻击者IP且无代理等情况
        name: '直接溯源',
        type: 'bar',
        emphasis: {
          focus: 'series',
        },
        data: [120, 80, 90, 100, 70, 110, 60],
      },
      {
        // 通过日志分析辅助溯源成功
        name: '日志溯源',
        type: 'bar',
        stack: '辅助溯源',
        emphasis: {
          focus: 'series',
        },
        data: [150, 130, 120, 140, 110, 135, 100],
      },
      {
        // 通过流量分析辅助溯源成功
        name: '流量溯源',
        type: 'bar',
        stack: '辅助溯源',
        emphasis: {
          focus: 'series',
        },
        data: [130, 110, 105, 125, 95, 120, 85],
      },
      {
        // 通过恶意样本分析辅助溯源成功
        name: '样本溯源',
        type: 'bar',
        stack: '辅助溯源',
        emphasis: {
          focus: 'series',
        },
        data: [100, 90, 85, 105, 75, 95, 65],
      },
      {
        // 总的溯源尝试次数，包含成功和未成功的，通过各种手段综合统计
        name: '总溯源尝试',
        type: 'bar',
        data: [350, 300, 280, 320, 250, 330, 220],
        emphasis: {
          focus: 'series',
        },
        markLine: {
          lineStyle: {
            type: 'dashed',
            width: 1,
          },
          data: [[{ type: 'min' }, { type: 'max' }]],
        },
      },
      {
        // 在总溯源尝试中，通过IP地址溯源的情况
        name: 'IP溯源',
        type: 'bar',
        barWidth: 5,
        stack: '总溯源尝试',
        emphasis: {
          focus: 'series',
        },
        data: [180, 150, 140, 160, 120, 170, 100],
      },
      {
        // 在总溯源尝试中，通过域名溯源的情况
        name: '域名溯源',
        type: 'bar',
        stack: '总溯源尝试',
        emphasis: {
          focus: 'series',
        },
        data: [80, 70, 65, 75, 55, 70, 45],
      },
      {
        // 在总溯源尝试中，通过工具特征溯源的情况
        name: '工具溯源',
        type: 'bar',
        stack: '总溯源尝试',
        emphasis: {
          focus: 'series',
        },
        data: [60, 50, 48, 55, 40, 52, 35],
      },
      {
        // 在总溯源尝试中，通过其他杂项方式溯源的情况，比如社会工程学信息等
        name: '其他方式溯源',
        type: 'bar',
        stack: '总溯源尝试',
        emphasis: {
          focus: 'series',
        },
        data: [30, 30, 27, 30, 25, 38, 40],
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
  const minFontSize = 8

  // 调整提示框字体大小
  option.tooltip.textStyle.fontSize = Math.max(minFontSize, 12 * scaleFactor)
  const tooltipLegendSize = Math.max(minFontSize, 15 * scaleFactor)
  option.tooltip.extraCssText = `
        width: auto;
        height: auto;
        .echarts-tooltip .echarts-tooltip-series-label span {
            width: ${tooltipLegendSize}px;
            height: ${tooltipLegendSize}px;
        }
    `

  // 调整图例字体大小和标记大小
  // option.legend.textStyle.fontSize = Math.max(minFontSize, 12 * scaleFactor);
  // option.legend.itemWidth = Math.max(minFontSize, 15 * scaleFactor);
  // option.legend.itemHeight = Math.max(minFontSize, 15 * scaleFactor);

  // 调整 X 轴标签旋转角度和字体大小
  option.xAxis[0].axisLabel.rotate = window.innerWidth < 600 ? 45 : 0
  option.xAxis[0].axisLabel.textStyle.fontSize = Math.max(minFontSize, 12 * scaleFactor)
  option.xAxis[0].axisLine.lineStyle.width = Math.max(0.5, 1 * scaleFactor)
  option.xAxis[0].axisTick.lineStyle.width = Math.max(0.5, 1 * scaleFactor)

  // 调整 Y 轴名称和标签字体大小
  option.yAxis[0].nameTextStyle.fontSize = Math.max(minFontSize, 12 * scaleFactor)
  option.yAxis[0].axisLabel.textStyle.fontSize = Math.max(minFontSize, 12 * scaleFactor)
  option.yAxis[0].axisLine.lineStyle.width = Math.max(0.5, 1 * scaleFactor)
  option.yAxis[0].axisTick.lineStyle.width = Math.max(0.5, 1 * scaleFactor)

  // 调整标记线宽度
  option.series[4].markLine.lineStyle.width = Math.max(0.5, 1 * scaleFactor)

  // 调整柱状图宽度
  option.series.forEach((series) => {
    if (series.barWidth) {
      series.barWidth = Math.max(2, 5 * scaleFactor)
    }
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
/* 可以在这里添加组件的样式 */
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
