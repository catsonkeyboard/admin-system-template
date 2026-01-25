import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import * as echarts from 'echarts'

export interface ChartProps {
  options: any
  className?: string
  style?: React.CSSProperties
  theme?: string | object
  onEvents?: Record<string, Function>
}

export interface ChartRef {
  getInstance: () => echarts.ECharts | undefined
  resize: () => void
}

export const Chart = forwardRef<ChartRef, ChartProps>(
  ({ options, className, style, theme, onEvents }, ref) => {
    const chartRef = useRef<HTMLDivElement>(null)
    const chartInstance = useRef<echarts.ECharts | undefined>(undefined)

    // 初始化图表
    useEffect(() => {
      if (chartRef.current) {
        chartInstance.current = echarts.init(chartRef.current, theme)
      }
      return () => {
        chartInstance.current?.dispose()
      }
    }, [theme])

    // 更新配置
    useEffect(() => {
      chartInstance.current?.setOption(options)
    }, [options])

    // 绑定事件
    useEffect(() => {
      if (!chartInstance.current || !onEvents) return

      Object.entries(onEvents).forEach(([eventName, handler]) => {
        chartInstance.current?.on(eventName, handler as any)
      })

      return () => {
        if (!chartInstance.current || !onEvents) return
        Object.entries(onEvents).forEach(([eventName, handler]) => {
          chartInstance.current?.off(eventName, handler as any)
        })
      }
    }, [onEvents])

    // 监听窗口大小变化
    useEffect(() => {
      const handleResize = () => {
        chartInstance.current?.resize()
      }
      window.addEventListener('resize', handleResize)
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }, [])

    useImperativeHandle(ref, () => ({
      getInstance: () => chartInstance.current,
      resize: () => chartInstance.current?.resize(),
    }))

    return (
      <div
        ref={chartRef}
        className={className}
        style={{ width: '100%', height: '400px', ...style }} // 默认高度
      />
    )
  }
)
