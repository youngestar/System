<template>
  <div ref="chartRef" style="width: 8vw; height: 6vh; margin: 0.5vh 0"></div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, nextTick } from 'vue'
import * as echarts from 'echarts/core'
import { GraphicComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

echarts.use([GraphicComponent, CanvasRenderer])

const chartRef = ref(null)
let myChart = null
let baseWidth = 0
let baseHeight = 0

// 初始元素配置
const baseElements = new Array(7).fill(0).map((val, i) => ({
  type: 'rect',
  x: i * 20,
  shape: { x: 0, y: -40, width: 10, height: 80 },
  style: { fill: '#00DDFF' },
  keyframeAnimation: {
    duration: 1400,
    delay: 200 * i,
    loop: true,
    keyframes: [
      { percent: 0.5, scaleY: 0.3, easing: 'cubicIn' },
      { percent: 1, scaleY: 1, easing: 'cubicOut' },
    ],
  },
}))

const handleResize = () => {
  if (myChart && chartRef.value) {
    myChart.resize()
    const currentWidth = chartRef.value.offsetWidth
    const currentHeight = chartRef.value.offsetHeight
    const scaleX = currentWidth / baseWidth
    const scaleY = currentHeight / baseHeight

    const newElements = baseElements.map((element) => ({
      ...element,
      x: element.x * scaleX,
      shape: {
        x: element.shape.x * scaleX,
        y: element.shape.y * scaleY,
        width: element.shape.width * scaleX,
        height: element.shape.height * scaleY,
      },
    }))

    myChart.setOption(
      {
        graphic: {
          elements: [
            {
              type: 'group',
              left: 'center',
              top: 'center',
              children: newElements,
            },
          ],
        },
      },
      true,
    )
  }
}

onMounted(async () => {
  await nextTick() // 确保DOM更新完成
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value)

    // 以 100% 初始容器尺寸为基准
    baseWidth = 136
    baseHeight = 56

    myChart.setOption({
      graphic: {
        elements: [
          {
            type: 'group',
            left: 'center',
            top: 'center',
            children: baseElements,
          },
        ],
      },
    })
    window.addEventListener('resize', handleResize)
  }
  handleResize()
})

onBeforeUnmount(() => {
  if (myChart) myChart.dispose()
  window.removeEventListener('resize', handleResize)
})
</script>
