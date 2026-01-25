import { Chart } from '@/client/components/ui/chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { useTranslation } from 'react-i18next'

export function MixedChartManagement() {
  const { t } = useTranslation()
  const options = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        crossStyle: {
          color: '#999'
        }
      }
    },
    grid: {
      right: '25%'
    },
    toolbox: {
      feature: {
        dataView: { show: true, readOnly: false },
        magicType: { show: true, type: ['line', 'bar'] },
        restore: { show: true },
        saveAsImage: { show: true }
      }
    },
    legend: {
      data: [t('charts.mixed.evaporation'), t('charts.mixed.precipitation'), t('charts.mixed.temperature')]
    },
    xAxis: [
      {
        type: 'category',
        data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        axisPointer: {
          type: 'shadow'
        }
      }
    ],
    yAxis: [
      {
        type: 'value',
        name: '水量',
        min: 0,
        max: 250,
        interval: 50,
        axisLabel: {
          formatter: '{value} ml'
        }
      },
      {
        type: 'value',
        name: '温度',
        min: 0,
        max: 25,
        interval: 5,
        axisLabel: {
          formatter: '{value} °C'
        }
      }
    ],
    series: [
      {
        name: t('charts.mixed.evaporation'),
        type: 'bar',
        tooltip: {
          valueFormatter: function (value: any) {
            return value + ' ml';
          }
        },
        data: [2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3]
      },
      {
        name: t('charts.mixed.precipitation'),
        type: 'bar',
        tooltip: {
          valueFormatter: function (value: any) {
            return value + ' ml';
          }
        },
        data: [2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3]
      },
      {
        name: t('charts.mixed.temperature'),
        type: 'line',
        yAxisIndex: 1,
        tooltip: {
          valueFormatter: function (value: any) {
            return value + ' °C';
          }
        },
        data: [2.0, 2.2, 3.3, 4.5, 6.3, 10.2, 20.3, 23.4, 23.0, 16.5, 12.0, 6.2]
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('charts.mixed.title')}</h2>
        <p className="text-muted-foreground">{t('charts.mixed.description')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('charts.mixed.cardTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Chart options={options} style={{ height: '500px' }} />
        </CardContent>
      </Card>
    </div>
  )
}
