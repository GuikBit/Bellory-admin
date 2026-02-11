import { Line } from 'react-chartjs-2'
import './ChartSetup'
import { getChartColors, getDefaultOptions } from './ChartSetup'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface LineChartProps {
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: 'primary' | 'secondary' | 'tertiary'
  }[]
  height?: number
}

export function LineChartCard({ title, labels, datasets, height = 300 }: LineChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const colors = getChartColors(isDark)
  const options = getDefaultOptions(isDark)

  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
  }

  const data = {
    labels,
    datasets: datasets.map((ds) => {
      const color = colorMap[ds.color || 'primary']
      return {
        label: ds.label,
        data: ds.data,
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 6,
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
