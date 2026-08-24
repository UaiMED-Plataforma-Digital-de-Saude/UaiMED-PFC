import React from 'react';
import MapView, { Marker, UrlTile } from 'react-native-maps';

interface MapaLocalizacaoProps {
  latitude: number;
  longitude: number;
}

// Tiles vindos direto de tile.openstreetmap.org são bloqueados em apps
// distribuídos (política de uso do OSM proíbe embutir os tiles deles num
// app sem acordo prévio — https://osm.wiki/Blocked). Usamos o MapTiler,
// que é feito para esse uso e tem free tier de 100k carregamentos/mês.
// Chave gerada em cloud.maptiler.com (gratuita, sem cartão).
const MAPTILER_KEY = 'LoaK6dZk1v4EXBddXxfZ';
const TILE_URL = `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`;

// mapType="none" esconde a camada nativa (que no Android exige chave do
// Google Maps) e usamos os tiles do MapTiler por cima.
const MapaLocalizacao: React.FC<MapaLocalizacaoProps> = ({ latitude, longitude }) => (
  <MapView
    style={{ flex: 1 }}
    mapType="none"
    scrollEnabled={false}
    zoomEnabled={false}
    pitchEnabled={false}
    rotateEnabled={false}
    initialRegion={{
      latitude, longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }}
  >
    <UrlTile urlTemplate={TILE_URL} tileSize={512} maximumZ={19} />
    <Marker coordinate={{ latitude, longitude }} />
  </MapView>
);

export default MapaLocalizacao;
