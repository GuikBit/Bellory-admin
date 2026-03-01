import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import { useTheme } from '../../contexts/ThemeContext'
import { Card, CardHeader, CardContent } from '../ui/Card'
import 'leaflet/dist/leaflet.css'
import './leaflet-custom.css'

export interface OrgLocation {
  cidade: string
  estado: string
  latitude: number
  longitude: number
  quantidade: number
}

// Mock data — cidades brasileiras com quantidade de organizações
const MOCK_DATA: OrgLocation[] = [
  { cidade: 'São Paulo', estado: 'SP', latitude: -23.5505, longitude: -46.6333, quantidade: 142 },
  { cidade: 'Rio de Janeiro', estado: 'RJ', latitude: -22.9068, longitude: -43.1729, quantidade: 89 },
  { cidade: 'Belo Horizonte', estado: 'MG', latitude: -19.9167, longitude: -43.9345, quantidade: 67 },
  { cidade: 'Brasília', estado: 'DF', latitude: -15.7801, longitude: -47.9292, quantidade: 45 },
  { cidade: 'Curitiba', estado: 'PR', latitude: -25.4284, longitude: -49.2733, quantidade: 53 },
  { cidade: 'Porto Alegre', estado: 'RS', latitude: -30.0346, longitude: -51.2177, quantidade: 38 },
  { cidade: 'Salvador', estado: 'BA', latitude: -12.9714, longitude: -38.5124, quantidade: 34 },
  { cidade: 'Recife', estado: 'PE', latitude: -8.0476, longitude: -34.877, quantidade: 28 },
  { cidade: 'Fortaleza', estado: 'CE', latitude: -3.7172, longitude: -38.5433, quantidade: 31 },
  { cidade: 'Manaus', estado: 'AM', latitude: -3.119, longitude: -60.0217, quantidade: 12 },
  { cidade: 'Belém', estado: 'PA', latitude: -1.4558, longitude: -48.5024, quantidade: 15 },
  { cidade: 'Goiânia', estado: 'GO', latitude: -16.6869, longitude: -49.2648, quantidade: 29 },
  { cidade: 'Campinas', estado: 'SP', latitude: -22.9099, longitude: -47.0626, quantidade: 41 },
  { cidade: 'Florianópolis', estado: 'SC', latitude: -27.5954, longitude: -48.548, quantidade: 22 },
  { cidade: 'Vitória', estado: 'ES', latitude: -20.3155, longitude: -40.3128, quantidade: 18 },
  { cidade: 'Natal', estado: 'RN', latitude: -5.7945, longitude: -35.211, quantidade: 14 },
  { cidade: 'Campo Grande', estado: 'MS', latitude: -20.4697, longitude: -54.6201, quantidade: 16 },
  { cidade: 'Cuiabá', estado: 'MT', latitude: -15.601, longitude: -56.0974, quantidade: 11 },
  { cidade: 'João Pessoa', estado: 'PB', latitude: -7.115, longitude: -34.861, quantidade: 10 },
  { cidade: 'Teresina', estado: 'PI', latitude: -5.0892, longitude: -42.8019, quantidade: 8 },
  { cidade: 'São Luís', estado: 'MA', latitude: -2.5297, longitude: -44.2825, quantidade: 9 },
  { cidade: 'Maceió', estado: 'AL', latitude: -9.6658, longitude: -35.7353, quantidade: 7 },
  { cidade: 'Aracaju', estado: 'SE', latitude: -10.9091, longitude: -37.0677, quantidade: 6 },
  { cidade: 'Ribeirão Preto', estado: 'SP', latitude: -21.1704, longitude: -47.8103, quantidade: 25 },
  { cidade: 'Uberlândia', estado: 'MG', latitude: -18.9186, longitude: -48.2772, quantidade: 19 },
  { cidade: 'Londrina', estado: 'PR', latitude: -23.3045, longitude: -51.1696, quantidade: 17 },
  { cidade: 'Porto Velho', estado: 'RO', latitude: -8.7612, longitude: -63.9004, quantidade: 5 },
  { cidade: 'Palmas', estado: 'TO', latitude: -10.1689, longitude: -48.3317, quantidade: 4 },
]

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253]

function getRadius(quantidade: number, max: number): number {
  const min = 6
  const maxR = 30
  return min + ((quantidade / max) * (maxR - min))
}

function ZoomControls() {
  const map = useMap()

  return (
    <div className="absolute top-3 right-3 z-[1000] flex flex-col gap-1">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 rounded-lg bg-white dark:bg-[#2D2925] border border-[#d8ccc4] dark:border-[#3D3530] text-[#2a2420] dark:text-[#F5F0EB] flex items-center justify-center hover:bg-[#f5f0eb] dark:hover:bg-[#3D3530] transition-colors text-lg font-medium shadow-sm"
        title="Zoom in"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 rounded-lg bg-white dark:bg-[#2D2925] border border-[#d8ccc4] dark:border-[#3D3530] text-[#2a2420] dark:text-[#F5F0EB] flex items-center justify-center hover:bg-[#f5f0eb] dark:hover:bg-[#3D3530] transition-colors text-lg font-medium shadow-sm"
        title="Zoom out"
      >
        −
      </button>
      <button
        onClick={() => map.setView(BRAZIL_CENTER, 4)}
        className="w-8 h-8 rounded-lg bg-white dark:bg-[#2D2925] border border-[#d8ccc4] dark:border-[#3D3530] text-[#2a2420] dark:text-[#F5F0EB] flex items-center justify-center hover:bg-[#f5f0eb] dark:hover:bg-[#3D3530] transition-colors text-xs font-medium shadow-sm"
        title="Resetar zoom"
      >
        ⟲
      </button>
    </div>
  )
}

interface BrazilBubbleMapProps {
  data?: OrgLocation[]
  height?: number
}

export function BrazilBubbleMapCard({ data, height = 480 }: BrazilBubbleMapProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const locations = data ?? MOCK_DATA

  const maxQuantidade = useMemo(
    () => Math.max(...locations.map(l => l.quantidade)),
    [locations]
  )

  const totalOrgs = useMemo(
    () => locations.reduce((sum, l) => sum + l.quantidade, 0),
    [locations]
  )

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'

  const bubbleColor = isDark ? '#F4A261' : '#db6f57'
  const bubbleBorder = isDark ? '#F4A261' : '#ffffff'

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
            Organizações por Região
          </h3>
          <span className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
            {totalOrgs} organizações em {locations.length} cidades
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height }} className="relative rounded-b-xl overflow-hidden">
          <MapContainer
            center={BRAZIL_CENTER}
            zoom={4}
            minZoom={3}
            maxZoom={12}
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="rounded-b-xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url={tileUrl}
            />
            <ZoomControls />
            {locations.map((loc) => (
              <CircleMarker
                key={`${loc.cidade}-${loc.estado}`}
                center={[loc.latitude, loc.longitude]}
                radius={getRadius(loc.quantidade, maxQuantidade)}
                pathOptions={{
                  fillColor: bubbleColor,
                  fillOpacity: isDark ? 0.45 : 0.6,
                  color: bubbleBorder,
                  weight: isDark ? 1 : 1.5,
                  opacity: isDark ? 0.7 : 0.9,
                }}
              >
                <Tooltip
                  direction="top"
                  offset={[0, -8]}
                  className="custom-tooltip"
                >
                  <div className="text-center">
                    <p className="font-semibold text-sm">{loc.cidade}, {loc.estado}</p>
                    <p className="text-xs mt-0.5">
                      <span className="font-bold" style={{ color: bubbleColor }}>
                        {loc.quantidade}
                      </span>{' '}
                      {loc.quantidade === 1 ? 'organização' : 'organizações'}
                    </p>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
