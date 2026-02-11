import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
)

export function getChartColors(isDark: boolean) {
  return {
    text: isDark ? '#B8AEA4' : '#6b5d57',
    grid: isDark ? '#2D2925' : '#d8ccc4',
    primary: isDark ? '#E07A62' : '#db6f57',
    secondary: isDark ? '#6B8F82' : '#4f6f64',
    tertiary: isDark ? '#A8524A' : '#8b3d35',
    quaternary: isDark ? '#B8AEA4' : '#6b5d57',
    background: isDark ? '#1A1715' : '#ffffff',
  }
}

export function getDefaultOptions(isDark: boolean) {
  const colors = getChartColors(isDark)
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: colors.text,
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
        titleFont: { family: 'Inter', weight: '600' as const },
        bodyFont: { family: 'Inter' },
      },
    },
    scales: {
      x: {
        grid: { color: colors.grid + '40', drawBorder: false },
        ticks: { color: colors.text, font: { family: 'Inter', size: 11 } },
        border: { display: false },
      },
      y: {
        grid: { color: colors.grid + '40', drawBorder: false },
        ticks: { color: colors.text, font: { family: 'Inter', size: 11 } },
        border: { display: false },
      },
    },
  }
}
