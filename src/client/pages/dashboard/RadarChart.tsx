import { Chart } from '@/client/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

export function RadarChartManagement() {
  const { t } = useTranslation()
  const options = {
    title: {
      text: t('charts.radar.chartTitle'),
    },
    legend: {
      data: [t('charts.radar.budget'), t('charts.radar.spending')],
    },
    radar: {
      // shape: 'circle',
      indicator: [
        { name: '销售', max: 6500 },
        { name: '管理', max: 16000 },
        { name: '信息技术', max: 30000 },
        { name: '客服', max: 38000 },
        { name: '研发', max: 52000 },
        { name: '市场', max: 25000 },
      ],
    },
    series: [
      {
        name: '预算 vs 开销',
        type: 'radar',
        data: [
          {
            value: [4200, 3000, 20000, 35000, 50000, 18000],
            name: t('charts.radar.budget'),
          },
          {
            value: [5000, 14000, 28000, 26000, 42000, 21000],
            name: t('charts.radar.spending'),
          },
        ],
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('charts.radar.title')}</h2>
        <p className="text-muted-foreground">{t('charts.radar.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('charts.radar.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart options={options} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  )
}
