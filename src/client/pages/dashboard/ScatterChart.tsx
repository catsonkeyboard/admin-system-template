import { Chart } from '@/client/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

export function ScatterChartManagement() {
  const { t } = useTranslation()
  const data = [
    [10.0, 8.04],
    [8.0, 6.95],
    [13.0, 7.58],
    [9.0, 8.81],
    [11.0, 8.33],
    [14.0, 9.96],
    [6.0, 7.24],
    [4.0, 4.26],
    [12.0, 10.84],
    [7.0, 4.82],
    [5.0, 5.68],
  ]

  const options = {
    title: {
      text: t('charts.scatter.chartTitle'),
    },
    xAxis: {},
    yAxis: {},
    series: [
      {
        symbolSize: 20,
        data: data,
        type: 'scatter',
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('charts.scatter.title')}</h2>
        <p className="text-muted-foreground">{t('charts.scatter.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('charts.scatter.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart options={options} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  )
}
