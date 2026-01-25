import { Chart } from '@/client/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

export function BarChartManagement() {
  const { t } = useTranslation()
  const options = {
    title: {
      text: t('charts.bar.chartTitle'),
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    legend: {
      bottom: 0,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: ['销售部', '市场部', '技术部', '客服部', '财务部', '人事部'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: t('charts.bar.legend.target'),
        type: 'bar',
        data: [320, 332, 301, 334, 390, 330],
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
        }
      },
      {
        name: t('charts.bar.legend.actual'),
        type: 'bar',
        data: [220, 182, 191, 234, 290, 330],
        itemStyle: {
          borderRadius: [5, 5, 0, 0],
        }
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('charts.bar.title')}</h2>
        <p className="text-muted-foreground">{t('charts.bar.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('charts.bar.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart options={options} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  )
}
