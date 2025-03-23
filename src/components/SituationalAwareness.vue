<template>
  <p class="title" style="position: relative; top: 6vh">
    态势感知-不同安全事件的发生频次与风险等级
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
    height: '33vh',
    width: '100%', // 默认值（如果未传 width，则使用 '100%'）
  },
)

import { onMounted, onBeforeUnmount, ref } from 'vue'
import * as echarts from 'echarts'

// 创建一个 ref 来引用图表容器
const chartRef = ref(null)
// 用于存储 ECharts 实例
let myChart = null
// 定义 option 变量，使其在全局作用域可访问
let option = null

// 定义初始化图表的函数
const initChart = () => {
  // 获取图表容器的 DOM 元素
  const chartDom = chartRef.value
  if (chartDom) {
    // 初始化 ECharts 实例
    myChart = echarts.init(chartDom)

    // 网络安全 - 态势感知相关数据
    const securityData = [
      ['score', 'amount', 'security_event'],
      [85, 200, 'DDoS 攻击'],
      [70, 150, '恶意软件感染'],
      [60, 120, '漏洞利用尝试'],
      [40, 80, '异常登录行为'],
      [20, 50, '数据泄露事件'],
    ]

    // 定义 ECharts 配置项
    option = {
      // 设置标题字体颜色和大小
      title: {
        // text: '态势感知',
        textStyle: {
          color: '#FF0000',
          fontSize: 16,
        },
      },
      dataset: {
        source: securityData,
      },
      grid: {
        left: '3%',
        right: '10%',
        bottom: '20%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        name: '次数',
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
            width: 1,
          },
        },
        axisTick: {
          length: 5,
        },
      },
      yAxis: {
        type: 'category',
        axisLabel: {
          textStyle: {
            color: '#475567',
            fontSize: 12,
          },
        },
        axisLine: {
          lineStyle: {
            width: 1,
          },
        },
        axisTick: {
          length: 5,
        },
      },
      visualMap: {
        orient: 'horizontal',
        left: 'center',
        min: 10,
        max: 100,
        text: ['高风险', '低风险'],
        textStyle: {
          color: '#3C9DFF',
          fontSize: 12,
        },
        // Map the score column to color
        dimension: 0,
        inRange: {
          color: ['#80FFA5', '#00DDFF', '#FF0087'],
        },
        itemWidth: 200,
        itemHeight: 14,
        calculable: true, // 开启可计算模式，让参考条能根据内容自适应
        bottom: 10, // 调整视觉映射组件的位置
        width: '60%', // 设置视觉映射组件的初始宽度
      },
      tooltip: {
        textStyle: {
          fontSize: 12,
        },
        extraCssText: 'width: auto; height: auto;',
      },
      series: [
        {
          type: 'bar',
          encode: {
            // Map the "amount" column to X axis.
            x: 'amount',
            // Map the "security_event" column to Y axis
            y: 'security_event',
          },
          barWidth: 20,
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

  // 调整标题字体大小
  option.title.textStyle.fontSize = 16 * scaleFactor

  // 调整 x 轴名称字体大小
  option.xAxis.nameTextStyle.fontSize = 12 * scaleFactor
  // 调整 x 轴标签字体大小
  option.xAxis.axisLabel.textStyle.fontSize = 12 * scaleFactor
  // 调整 x 轴线宽度
  option.xAxis.axisLine.lineStyle.width = 3 * scaleFactor
  // 调整 x 轴刻度长度
  option.xAxis.axisTick.length = 5 * scaleFactor

  // 调整 y 轴标签字体大小
  option.yAxis.axisLabel.textStyle.fontSize = 12 * scaleFactor
  // 调整 y 轴线宽度
  option.yAxis.axisLine.lineStyle.width = 3 * scaleFactor
  // 调整 y 轴刻度长度
  option.yAxis.axisTick.length = 5 * scaleFactor

  // 调整视觉映射文字字体大小
  option.visualMap.textStyle.fontSize = Math.max(8, 12 * scaleFactor) // 确保字体大小不小于 8
  // 调整视觉映射标记大小
  option.visualMap.itemWidth = 20 * scaleFactor
  // 修正 visualMap.itemHeight 的缩放比例，避免过大
  option.visualMap.itemHeight = 140 * scaleFactor
  // 调整视觉映射组件的位置
  option.visualMap.bottom = 10 * scaleFactor
  // 调整视觉映射组件的宽度
  option.visualMap.width = `${Math.max(20, 60 * scaleFactor)}%` // 确保宽度不小于 20%

  // 调整提示框字体大小
  option.tooltip.textStyle.fontSize = 12 * scaleFactor
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

  // 调整柱状图宽度
  option.series[0].barWidth = 20 * scaleFactor

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

// 在组件销毁前移除事件监听器并销毁 ECharts 实例
onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  if (myChart) {
    myChart.dispose()
  }
})
</script>

<style scoped>
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
