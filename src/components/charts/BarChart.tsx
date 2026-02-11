import { Bar } from 'react-chartjs-2'
import './ChartSetup'
import { getChartColors, getDefaultOptions } from './ChartSetup'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface BarChartProps {
  title: string
  labels: string[]
  datasets: {
    label: string
    data: number[]
    color?: 'primary' | 'secondary' | 'tertiary' | 'quaternary'
  }[]
  height?: number
  stacked?: boolean
}

export function BarChartCard({ title, labels, datasets, height = 300, stacked = false }: BarChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const colors = getChartColors(isDark)
  const baseOptions = getDefaultOptions(isDark)

  const colorMap = {
    primary: colors.primary,
    secondary: colors.secondary,
    tertiary: colors.tertiary,
    quaternary: colors.quaternary,
  }

  const data = {
    labels,
    datasets: datasets.map((ds) => {
      const color = colorMap[ds.color || 'primary']
      return {
        label: ds.label,
        data: ds.data,
        backgroundColor: color + 'CC',
        hoverBackgroundColor: color,
        borderRadius: 6,
        borderSkipped: false as const,
      }
    }),
  }

  const options = {
    ...baseOptions,
    scales: {
      ...baseOptions.scales,
      x: { ...baseOptions.scales.x, stacked },
      y: { ...baseOptions.scales.y, stacked },
    },
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{title}</h3>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <Bar data={data} options={options as any} />
        </div>
      </CardContent>
    </Card>
  )
}
