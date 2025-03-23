<template>
  <p class="title" style="position: relative; bottom: 1vh">权限抑制-高低风险抑制次数统计</p>
  <div
    ref="chartRef"
    :style="{ width: props.width, height: props.height }"
    style="position: relative; bottom: 2vh"
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
    height: '29vh',
    width: '100%', // 默认值（如果未传 width，则使用 '100%'）
  },
)

import { onMounted, ref, onUnmounted } from 'vue'
import * as echarts from 'echarts/core'
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
} from 'echarts/components'
import { BarChart, PictorialBarChart } from 'echarts/charts'
import { UniversalTransition } from 'echarts/features'
import { CanvasRenderer } from 'echarts/renderers'

// 注册 ECharts 组件和渲染器
echarts.use([
  TitleComponent,
  TooltipComponent,
  GridComponent,
  LegendComponent,
  BarChart,
  PictorialBarChart,
  CanvasRenderer,
  UniversalTransition,
])

const chartRef = ref(null)
let myChart // 存储 ECharts 实例
let option // 存储 ECharts 配置项

const securityData = [
  {
    name: '低风险抑制次数',
    data: [80, 70, 90, 95, 85, 92, 88],
  },
  {
    name: '高风险抑制次数',
    data: [40, 50, 40, 30, 20, 40, 50, 22, 23, 21], // 添加了新数据
  },
]

const labelSetting = {
  show: true,
  position: 'right',
  offset: [10, 0],
  fontSize: 16,
  textStyle: {
    color: '#475567', // 字体颜色设置
  },
}

// svg 路径
const svgMain =
  'path://M982.875769 216.541568L589.117398 16.853471C566.135392 5.617824 536.51414 0 506.382176 0S446.628961 5.617824 423.646954 16.853471L40.102809 216.541568c-45.453301 22.982006-45.453301 59.753216 0 82.735222l384.054857 199.688097c22.982006 11.235647 52.603258 16.853471 82.735222 16.853471 30.131963 0 59.753216-5.617824 82.735221-16.853471l394.269082-199.688097c44.431878-22.982006 44.431878-59.753216-1.021422-82.735222z m-429.508158 221.648681c-7.149957 3.574979-24.003429 8.17138-45.453301 8.17138-21.960584 0-38.303343-4.08569-45.453301-8.17138L118.752341 258.930602l343.708668-179.259648c7.660669-3.574979 24.003429-8.17138 45.453301-8.17138s38.303343 4.08569 45.453301 8.17138l353.412182 179.770359-353.412182 178.748936zM507.91431 768.620425c-36.77121 0-73.542419-7.149957-103.163672-21.960584L30.399295 552.078857c-22.982006-11.235647-33.196231-32.174808-21.960583-55.156815 11.235647-22.982006 40.346188-24.51414 63.328194-13.278492l374.351343 194.580984c32.68552 16.34276 91.417313 16.34276 124.102833 0l384.565568-194.580984c22.982006-11.235647 48.517568-12.767781 59.753216 10.214225 11.235647 22.982006 4.08569 46.985435-18.385605 58.221082l-384.054857 194.580984c-33.196231 15.321337-68.946018 22.982006-104.185094 21.960584zM507.91431 1023.976048c-36.77121 0-73.542419-7.149957-103.163672-21.960584L30.399295 806.923768c-22.982006-11.235647-33.196231-32.174808-21.960583-55.156814 11.235647-22.982006 40.346188-24.51414 63.328194-13.278493l374.351343 194.580985c32.68552 16.34276 91.417313 16.34276 124.102833 0l384.565568-194.580985c22.982006-11.235647 48.517568-12.767781 59.753216 10.214225 11.235647 22.982006 4.08569 46.985435-18.385605 58.221082l-384.054857 194.580985c-33.196231 15.321337-68.435307 22.982006-104.185094 22.471295zM442.032559 246.16282c0 30.131963 29.621252 55.156815 66.392462 55.156815s66.392462-24.51414 66.392462-55.156815-29.621252-55.156815-66.392462-55.156814c-36.260498 0-66.392462 24.51414-66.392462 55.156814z'
const svgUser =
  'path://M0.000205 113.868959v796.262082A113.663955 113.663955 0 0 0 113.868959 1023.999795h796.262082A114.073554 114.073554 0 0 0 1023.999795 910.131041V113.868959A114.073554 114.073554 0 0 0 910.131041 0.000205H113.868959A113.663955 113.663955 0 0 0 0.000205 113.868959z m682.598127 227.532709A170.598332 170.598332 0 1 1 512 170.598537a170.393532 170.393532 0 0 1 170.598332 170.803131z m-511.999795 455.065418c0-113.868754 227.532709-176.332729 341.401463-176.332729s341.401463 61.439975 341.401463 176.332729v56.934377H170.598537v-56.934377z'
const svgData =
  'path://M950.857143 1024H292.571429A182.857143 182.857143 0 0 1 109.714286 841.142857V182.857143A182.857143 182.857143 0 0 1 292.571429 0h658.285714a182.857143 182.857143 0 0 1 182.857143 182.857143v658.285714a182.857143 182.857143 0 0 1-182.857143 182.857143z m73.142857-804.571429a109.714286 109.714286 0 0 0-109.714286-109.714285H329.142857a109.714286 109.714286 0 0 0-109.714286 109.714285v585.142858a109.714286 109.714286 0 0 0 109.714286 109.714285h585.142857a109.714286 109.714286 0 0 0 109.714286-109.714285V219.428571zM841.142857 731.428571a36.571429 36.571429 0 0 1-36.571428-36.571428V475.428571a36.571429 36.571429 0 0 1 73.142857 0v219.428572a36.571429 36.571429 0 0 1-36.571429 36.571428z m-219.428571 0a36.571429 36.571429 0 0 1-36.571429-36.571428V329.142857a36.571429 36.571429 0 0 1 73.142857 0v365.714286a36.571429 36.571429 0 0 1-36.571428 36.571428z m-219.428572 0a36.571429 36.571429 0 0 1-36.571428-36.571428v-146.285714a36.571429 36.571429 0 0 1 73.142857 0v146.285714a36.571429 36.571429 0 0 1-36.571429 36.571428z'
const svgAPI =
  'path://M448.324587 110.754576 448.324587 56.065976c0-30.121632-21.518677-54.6886-47.84688-54.6886L240.927894 1.377376c-26.328203 0-47.84688 24.566968-47.84688 54.6886l0 54.6886L1.670915 110.754576l0 72.933186 191.432679 0 0 54.6886c0 30.121632 21.518677 54.6886 47.84688 54.6886l159.572393 0c26.328203 0 47.84688-24.566968 47.84688-54.6886L448.369746 183.687762l574.298037 0 0-72.933186L448.324587 110.754576 448.324587 110.754576zM256.891907 220.154355 256.891907 74.310562l127.621786 0L384.513693 220.154355 256.891907 220.154355 256.891907 220.154355zM448.324587 840.018699 448.324587 785.330099c0-30.053892-21.518677-54.6886-47.84688-54.6886l-159.482073 0c-26.328203 0-47.84688 24.657288-47.84688 54.6886l0 54.6886L1.670915 840.018699l0 72.933186 191.432679 0 0 54.6886c0 30.053892 21.518677 54.6886 47.84688 54.6886l159.572393 0c26.328203 0 47.84688-24.657288 47.84688-54.6886l0-54.6886 574.298037 0 0-72.933186L448.324587 840.018699 448.324587 840.018699zM256.891907 949.418479l0-145.843793 127.621786 0 0 145.843793L256.891907 949.418479 256.891907 949.418479zM831.189945 420.709327c0-30.053892-21.518677-54.6886-47.84688-54.6886l-159.572393 0c-26.328203 0-47.84688 24.657288-47.84688 54.6886l0 54.6886L1.670915 475.397927l0 72.933186 574.298037 0 0 54.6886c0 30.053892 21.518677 54.6886 47.84688 54.6886l159.572393 0c26.328203 0 47.84688-24.657288 47.84688-54.6886l0-54.6886 191.432679 0 0-72.933186-191.432679 0L831.235105 420.709327 831.189945 420.709327zM639.757266 584.775127l0-145.843793 127.621786 0 0 145.843793L639.757266 584.775127 639.757266 584.775127z'

function makeOption(type, symbol) {
  return {
    title: {
      // text: '网络安全 - 权限抑制统计'
    },
    legend: {
      // 增加图例到 4 项
      data: [
        '系统核心权限抑制',
        '用户自定义权限抑制',
        '敏感数据访问权限抑制',
        '外部接口调用权限抑制',
      ],
      // 设置图例字体颜色
      textStyle: {
        color: '#3C9DFF',
        fontSize: 14,
      },
      itemWidth: 20, // 图例标记的宽度
      itemHeight: 14, // 图例标记的高度
    },
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
    grid: {
      left: '5%',
      right: '4%',
      bottom: '2%',
      top: '8%',
      containLabel: true,
    },
    yAxis: {
      data: securityData.map((item) => item.name),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        margin: 30,
        fontSize: 14,
        color: '#475567',
      },
      axisPointer: {
        label: {
          show: true,
          margin: 30,
          fontSize: 14,
        },
      },
    },
    xAxis: {
      splitLine: { show: false },
      axisLabel: {
        show: false,
        fontSize: 12,
        color: '#fff',
      },
      axisTick: { show: false },
      axisLine: { show: false },
    },
    animationDurationUpdate: 500,
    // 全局颜色主题配置
    color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FF0087'],
    series: [
      {
        name: '系统核心权限抑制',
        id: 'bar1',
        type: type,
        label: labelSetting,
        symbolRepeat: true,
        symbolSize: ['80%', '60%'],
        // 减小不同类别之间的间距
        barCategoryGap: '10%',
        barGap: '5%',
        universalTransition: {
          enabled: true,
          delay: (idx, total) => (idx / total) * 1000,
        },
        data: [
          {
            value: securityData[0].data.slice(0, 3).reduce((acc, val) => acc + val, 0),
            symbol: svgMain,
          },
          {
            value: securityData[1].data.slice(0, 3).reduce((acc, val) => acc + val, 0),
            symbol: svgMain,
          },
        ],
      },
      {
        name: '用户自定义权限抑制',
        id: 'bar2',
        type: type,
        // 减小同类别不同系列之间的间距
        barGap: '5%',
        label: labelSetting,
        symbolRepeat: true,
        symbolSize: ['80%', '60%'],
        universalTransition: {
          enabled: true,
          delay: (idx, total) => (idx / total) * 1000,
        },
        data: [
          {
            value: securityData[0].data.slice(0, 5).reduce((acc, val) => acc + val, 0),
            symbol: svgUser,
          },
          {
            value: securityData[1].data.slice(0, 5).reduce((acc, val) => acc + val, 0),
            symbol: svgUser,
          },
        ],
      },
      {
        name: '敏感数据访问权限抑制',
        id: 'bar3',
        type: type,
        barGap: '5%',
        label: labelSetting,
        symbolRepeat: true,
        symbolSize: ['80%', '60%'],
        universalTransition: {
          enabled: true,
          delay: (idx, total) => (idx / total) * 1000,
        },
        data: [
          {
            value: securityData[0].data.slice(3).reduce((acc, val) => acc + val, 0),
            symbol: svgData,
          },
          {
            value: securityData[1].data.slice(3).reduce((acc, val) => acc + val, 0),
            symbol: svgData,
          },
        ],
      },
      {
        name: '外部接口调用权限抑制',
        id: 'bar4',
        type: type,
        barGap: '5%',
        label: labelSetting,
        symbolRepeat: true,
        symbolSize: ['80%', '60%'],
        universalTransition: {
          enabled: true,
          delay: (idx, total) => (idx / total) * 1000,
        },
        data: [
          {
            value: securityData[0].data.slice(5).reduce((acc, val) => acc + val, 0),
            symbol: svgAPI,
          },
          {
            value: securityData[1].data.slice(5).reduce((acc, val) => acc + val, 0),
            symbol: svgAPI,
          },
        ],
      },
    ],
  }
}

const options = [
  makeOption('pictorialBar'),
  makeOption('bar'),
  makeOption('pictorialBar', 'diamond'),
]

let optionIndex = 0
let intervalId

// 字体等自适应函数
function adjustOption() {
  if (!option || !myChart) return
  const width = window.innerWidth
  const height = window.innerHeight

  // 根据窗口动态调节大小
  const baseSize = 1
  const scaleFactor = Math.min(width / 1920, height / 1080) // 以 1920x1080 为基准

  // 调整图例字体大小
  option.legend.textStyle.fontSize = 14 * scaleFactor

  // 调整图例标记大小
  option.legend.itemWidth = 20 * scaleFactor
  option.legend.itemHeight = 14 * scaleFactor

  // 调整提示框字体大小
  option.tooltip.textStyle.fontSize = 12 * scaleFactor

  // 调整提示框坐标轴指示器标签字体大小
  option.yAxis.axisPointer.label.fontSize = 14 * scaleFactor

  // 调整 x 轴标签字体大小
  option.xAxis.axisLabel.fontSize = 12 * scaleFactor

  // 调整 y 轴标签字体大小
  option.yAxis.axisLabel.fontSize = 14 * scaleFactor

  // 调整数据标签字体大小
  option.series.forEach((series) => {
    series.label.textStyle.fontSize = 16 * scaleFactor
  })

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

// 切换图表配置并重新应用自适应调整
function switchOption() {
  optionIndex = (optionIndex + 1) % options.length
  option = options[optionIndex]
  myChart.setOption(option)
  adjustOption() // 重新应用自适应调整
}

onMounted(() => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value)
    option = options[optionIndex]
    myChart.setOption(option)

    intervalId = setInterval(switchOption, 2500)

    // 监听窗口大小变化
    window.addEventListener('resize', resizeChart)
    adjustOption()
  }
})

onUnmounted(() => {
  if (intervalId) {
    clearInterval(intervalId)
  }
  // 移除窗口大小变化监听器
  window.removeEventListener('resize', resizeChart)
  if (myChart) {
    myChart.dispose()
  }
})
</script>

<style scoped>
/* 可以在这里添加样式 */
.title {
  font-size: 1.6vh;
  margin-left: 1em;
  margin-top: 1em;
}
</style>
