import { Chart } from '@/client/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

export function SunburstChartManagement() {
  const { t } = useTranslation()
  const data = [
    {
      name: 'Grandpa',
      children: [
        {
          name: 'Uncle Leo',
          value: 15,
          children: [
            {
              name: 'Cousin Jack',
              value: 2,
            },
            {
              name: 'Cousin Mary',
              value: 5,
              children: [
                {
                  name: 'Jackson',
                  value: 2,
                },
              ],
            },
            {
              name: 'Cousin Ben',
              value: 4,
            },
          ],
        },
        {
          name: 'Father',
          value: 10,
          children: [
            {
              name: 'Me',
              value: 5,
            },
            {
              name: 'Brother Peter',
              value: 1,
            },
          ],
        },
      ],
    },
    {
      name: 'Nancy',
      children: [
        {
          name: 'Uncle Nike',
          children: [
            {
              name: 'Cousin Betty',
              value: 1,
            },
            {
              name: 'Cousin Jenny',
              value: 2,
            },
          ],
        },
      ],
    },
  ]

  const options = {
    title: {
      text: t('charts.sunburst.chartTitle'),
    },
    series: {
      type: 'sunburst',
      data: data,
      radius: [0, '90%'],
      label: {
        rotate: 'radial',
      },
    },
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('charts.sunburst.title')}</h2>
        <p className="text-muted-foreground">{t('charts.sunburst.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('charts.sunburst.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart options={options} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  )
}
