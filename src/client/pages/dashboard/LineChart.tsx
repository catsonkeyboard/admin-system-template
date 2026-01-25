import { Chart } from '@/client/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

export function LineChartManagement() {
  const { t } = useTranslation()
  const options = {
    title: {
      text: t('charts.line.title'),
    },
    tooltip: {
      trigger: 'axis',
    },
    legend: {
      data: ['电子产品', '服装', '家居'], // These could be translated too but for demo purpose keep as is or map them
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
      boundaryGap: false,
      data: ['一月', '二月', '三月', '四月', '五月', '六月', '七月'],
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '电子产品',
        type: 'line',
        stack: 'Total',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true,
      },
      {
        name: '服装',
        type: 'line',
        stack: 'Total',
        data: [220, 182, 191, 234, 290, 330, 310],
        smooth: true,
      },
      {
        name: '家居',
        type: 'line',
        stack: 'Total',
        data: [150, 232, 201, 154, 190, 330, 410],
        smooth: true,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('charts.line.title')}</h2>
        <p className="text-muted-foreground">{t('charts.line.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('charts.line.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart options={options} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  )
}
