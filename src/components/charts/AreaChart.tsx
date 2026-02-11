import { Line } from 'react-chartjs-2'
import './ChartSetup'
import { getChartColors, getDefaultOptions } from './ChartSetup'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface AreaChartProps {
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: 'primary' | 'secondary'
  }[]
  height?: number
}

export function AreaChartCard({ title, labels, datasets, height = 300 }: AreaChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const colors = getChartColors(isDark)
  const options = getDefaultOptions(isDark)

  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
  }

  const data = {
    labels,
    datasets: datasets.map((ds) => {
      const color = colorMap[ds.color || 'primary']
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: (ctx: any) => {
          const canvas = ctx.chart.ctx
          const gradient = canvas.createLinearGradient(0, 0, 0, height)
          gradient.addColorStop(0, color + '40')
          gradient.addColorStop(1, color + '05')
          return gradient
        },
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointBackgroundColor: color,
        pointBorderColor: colors.background,
        pointBorderWidth: 2,
      }
    }),
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{title}</h3>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <Line data={data} options={options as any} />
        </div>
      </CardContent>
    </Card>
  )
}
