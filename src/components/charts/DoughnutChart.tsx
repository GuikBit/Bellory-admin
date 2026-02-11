import { Doughnut } from 'react-chartjs-2'
import './ChartSetup'
import { getChartColors } from './ChartSetup'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, CardContent, CardHeader } from '../ui/Card'

interface DoughnutChartProps {
  title: string
  labels: string[]
  data: number[]
  height?: number
  colors?: string[]
}

export function DoughnutChartCard({ title, labels, data, height = 280, colors: customColors }: DoughnutChartProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const chartColors = getChartColors(isDark)

  const defaultColors = customColors || [
    chartColors.primary,
    chartColors.secondary,
    chartColors.tertiary,
    chartColors.quaternary,
    '#8B6F47',
    '#5B7BA5',
  ]

  const chartData = {
    labels,
    datasets: [
      {
        data,
        backgroundColor: defaultColors.map(c => c + 'CC'),
        hoverBackgroundColor: defaultColors,
        borderColor: isDark ? '#1A1715' : '#ffffff',
        borderWidth: 3,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '65%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: chartColors.text,
          font: { family: 'Inter', size: 12 },
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#2D2925' : '#ffffff',
        titleColor: isDark ? '#F5F0EB' : '#2a2420',
        bodyColor: isDark ? '#B8AEA4' : '#6b5d57',
        borderColor: isDark ? '#2D2925' : '#d8ccc4',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      },
    },
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{title}</h3>
      </CardHeader>
      <CardContent>
        <div style={{ height }}>
          <Doughnut data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  )
}
