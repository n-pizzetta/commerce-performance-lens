import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { useTheme } from 'next-themes';
import 'leaflet/dist/leaflet.css';

// Type pour un cluster géographique
export interface GeoCluster {
  region: string;
  lat: number;
  lng: number;
  topCategory: string;
  revenue: number;
}

interface MapClustersProps {
  clusters: GeoCluster[];
}

// Palette de couleurs par catégorie (exemple)
const categoryColors: Record<string, string> = {
  Electronics: '#009739',
  Fashion: '#e83e8c',
  'Home & Kitchen': '#ffb300',
  // Ajoute d'autres catégories si besoin
};

const getColor = (category: string) => categoryColors[category] || '#8884d8';

const MapClusters: React.FC<MapClustersProps> = ({ clusters }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const maxRevenue = Math.max(...clusters.map(c => c.revenue), 1);

  const tileUrl = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

  return (
    <MapContainer
      center={[-14.2350, -51.9253]}
      zoom={4}
      style={{ height: 350, width: '100%', borderRadius: 12 }}
      scrollWheelZoom={false}
      dragging={true}
      doubleClickZoom={false}
      zoomControl={false}
    >
      <TileLayer url={tileUrl} />
      {clusters.map((cluster, idx) => (
        <CircleMarker
          key={idx}
          center={[cluster.lat, cluster.lng]}
          radius={8 + 20 * (cluster.revenue / maxRevenue)}
          pathOptions={{ color: '#222', fillColor: getColor(cluster.topCategory), fillOpacity: 0.7, weight: 1 }}
        >
          <Tooltip opacity={1} permanent={false}>
            <div style={{ minWidth: 120 }}>
              <div style={{ fontWeight: 'bold', color: '#012169' }}>{cluster.region}</div>
              <div style={{ color: getColor(cluster.topCategory) }}>{cluster.topCategory}</div>
              <div style={{ color: '#222' }}>CA : {new Intl.NumberFormat('fr-FR').format(cluster.revenue)} R$</div>
            </div>
          </Tooltip>
        </CircleMarker>
      ))}
    </MapContainer>
  );
};

export default MapClusters; 