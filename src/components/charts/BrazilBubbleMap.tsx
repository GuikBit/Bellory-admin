import { useMemo, useState, useCallback, useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap, useMapEvents } from 'react-leaflet'
import Supercluster from 'supercluster'
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

interface OrgProperties {
  cidade: string
  estado: string
  quantidade: number
}

type OrgPoint = Supercluster.PointFeature<OrgProperties>
type ClusterOrPoint = Supercluster.ClusterFeature<OrgProperties> | OrgPoint

const BRAZIL_CENTER: [number, number] = [-14.235, -51.9253]

function getClusterRadius(pointCount: number, maxCount: number, zoom: number): number {
  const minR = 8
  const maxR = 40
  const ratio = Math.min(pointCount / Math.max(maxCount, 1), 1)
  const zoomFactor = Math.max(1 - (zoom - 4) * 0.06, 0.3)
  return minR + ratio * (maxR - minR) * zoomFactor
}

function getPointRadius(quantidade: number, maxQuantidade: number): number {
  const minR = 5
  const maxR = 18
  return minR + (quantidade / Math.max(maxQuantidade, 1)) * (maxR - minR)
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

interface ClusterLayerProps {
  locations: OrgLocation[]
  isDark: boolean
  bubbleColor: string
  bubbleBorder: string
}

function ClusterLayer({ locations, isDark, bubbleColor, bubbleBorder }: ClusterLayerProps) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  const [bounds, setBounds] = useState(map.getBounds())

  const updateState = useCallback(() => {
    setZoom(map.getZoom())
    setBounds(map.getBounds())
  }, [map])

  useEffect(() => {
    updateState()
  }, [updateState])

  useMapEvents({
    zoomend: updateState,
    moveend: updateState,
  })

  const points: OrgPoint[] = useMemo(() =>
    locations.map((loc) => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [loc.longitude, loc.latitude],
      },
      properties: {
        cidade: loc.cidade,
        estado: loc.estado,
        quantidade: loc.quantidade,
      },
    })),
    [locations]
  )

  const index = useMemo(() => {
    const sc = new Supercluster<OrgProperties>({
      radius: 60,
      maxZoom: 16,
      minZoom: 0,
      reduce: (accumulated, props) => {
        accumulated.quantidade += props.quantidade
      },
      map: (props) => ({
        cidade: props.cidade,
        estado: props.estado,
        quantidade: props.quantidade,
      }),
    })
    sc.load(points)
    return sc
  }, [points])

  const clusters: ClusterOrPoint[] = useMemo(() => {
    const b = bounds
    return index.getClusters(
      [b.getWest(), b.getSouth(), b.getEast(), b.getNorth()],
      Math.floor(zoom)
    ) as ClusterOrPoint[]
  }, [index, bounds, zoom])

  const maxClusterCount = useMemo(() => {
    let max = 1
    for (const c of clusters) {
      const count = 'cluster' in c.properties && c.properties.cluster
        ? (c.properties as Supercluster.ClusterProperties).point_count
        : c.properties.quantidade
      if (count > max) max = count
    }
    return max
  }, [clusters])

  const maxPointQuantidade = useMemo(
    () => Math.max(...locations.map(l => l.quantidade), 1),
    [locations]
  )

  const handleClusterClick = useCallback((clusterId: number, lat: number, lng: number) => {
    const expansionZoom = Math.min(index.getClusterExpansionZoom(clusterId), 16)
    map.flyTo([lat, lng], expansionZoom, { duration: 0.5 })
  }, [index, map])

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates
        const isCluster = 'cluster' in feature.properties && feature.properties.cluster

        if (isCluster) {
          const clusterProps = feature.properties as Supercluster.ClusterProperties & OrgProperties
          const pointCount = clusterProps.point_count
          const totalQuantidade = clusterProps.quantidade
          const radius = getClusterRadius(totalQuantidade, maxClusterCount, zoom)

          return (
            <CircleMarker
              key={`cluster-${clusterProps.cluster_id}`}
              center={[lat, lng]}
              radius={radius}
              pathOptions={{
                fillColor: bubbleColor,
                fillOpacity: isDark ? 0.4 : 0.5,
                color: bubbleBorder,
                weight: isDark ? 1 : 1.5,
                opacity: isDark ? 0.6 : 0.8,
              }}
              eventHandlers={{
                click: () => handleClusterClick(clusterProps.cluster_id, lat, lng),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -8]}
                className="custom-tooltip"
              >
                <div className="text-center">
                  <p className="font-semibold text-sm">
                    {pointCount} {pointCount === 1 ? 'local' : 'locais'}
                  </p>
                  <p className="text-xs mt-0.5">
                    <span className="font-bold" style={{ color: bubbleColor }}>
                      {totalQuantidade}
                    </span>{' '}
                    {totalQuantidade === 1 ? 'organização' : 'organizações'}
                  </p>
                  <p className="text-[10px] mt-0.5 opacity-70">Clique para expandir</p>
                </div>
              </Tooltip>
            </CircleMarker>
          )
        }

        const props = feature.properties as OrgProperties
        const radius = getPointRadius(props.quantidade, maxPointQuantidade)

        return (
          <CircleMarker
            key={`point-${props.cidade}-${props.estado}-${lat}-${lng}`}
            center={[lat, lng]}
            radius={radius}
            pathOptions={{
              fillColor: bubbleColor,
              fillOpacity: isDark ? 0.5 : 0.65,
              color: bubbleBorder,
              weight: isDark ? 1 : 1.5,
              opacity: isDark ? 0.8 : 0.9,
            }}
          >
            <Tooltip
              direction="top"
              offset={[0, -8]}
              className="custom-tooltip"
            >
              <div className="text-center">
                <p className="font-semibold text-sm">{props.cidade}, {props.estado}</p>
                <p className="text-xs mt-0.5">
                  <span className="font-bold" style={{ color: bubbleColor }}>
                    {props.quantidade}
                  </span>{' '}
                  {props.quantidade === 1 ? 'organização' : 'organizações'}
                </p>
              </div>
            </Tooltip>
          </CircleMarker>
        )
      })}
    </>
  )
}

interface BrazilBubbleMapProps {
  data?: OrgLocation[]
  height?: number
}

export function BrazilBubbleMapCard({ data, height = 480 }: BrazilBubbleMapProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const locations = data || []

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
            {locations.length} Locais
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ height }} className="relative rounded-b-xl overflow-hidden">
          <MapContainer
            center={BRAZIL_CENTER}
            zoom={4}
            minZoom={3}
            maxZoom={18}
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
            <ClusterLayer
              locations={locations}
              isDark={isDark}
              bubbleColor={bubbleColor}
              bubbleBorder={bubbleBorder}
            />
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  )
}
