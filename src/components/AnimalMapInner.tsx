"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icons
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

// Polygon style constants
const POLY_DEFAULT: L.PathOptions = {
  color: "#3b82f6",
  weight: 2,
  opacity: 0.8,
  fillColor: "#3b82f6",
  fillOpacity: 0.15,
};

const POLY_HOVER: L.PathOptions = {
  color: "#60a5fa",
  weight: 3,
  opacity: 1,
  fillColor: "#3b82f6",
  fillOpacity: 0.38,
};

// Helper: calculate bounding box of all polygons
function calcBounds(
  polygons: [number, number][][]
): L.LatLngBoundsExpression | null {
  const allCoords = polygons.flat();
  if (allCoords.length === 0) return null;

  let minLat = allCoords[0][0];
  let maxLat = allCoords[0][0];
  let minLng = allCoords[0][1];
  let maxLng = allCoords[0][1];

  for (const [lat, lng] of allCoords) {
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
}

// Inner component that calls fitBounds after mount
function FitBoundsOnLoad({
  polygons,
  fallbackCenter,
}: {
  polygons: [number, number][][];
  fallbackCenter: [number, number];
}) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (fitted.current) return;
    fitted.current = true;

    const bounds = calcBounds(polygons);
    if (bounds) {
      map.fitBounds(bounds as L.LatLngBoundsExpression, {
        padding: [24, 24],
        maxZoom: 8,
      });
    } else {
      map.setView(fallbackCenter, 5);
    }
  }, [map, polygons, fallbackCenter]);

  return null;
}

// Single polygon with hover interaction
function DistributionPolygon({
  positions,
  nameEn,
  nameZh,
  habitatEn,
  habitatZh,
}: {
  positions: [number, number][];
  nameEn: string;
  nameZh: string;
  habitatEn: string;
  habitatZh: string;
}) {
  const [hovered, setHovered] = useState(false);
  const popupRef = useRef<L.Popup | null>(null);

  return (
    <Polygon
      positions={positions}
      pathOptions={hovered ? POLY_HOVER : POLY_DEFAULT}
      eventHandlers={{
        mouseover: (e) => {
          setHovered(true);
          e.target.openPopup();
        },
        mouseout: (e) => {
          setHovered(false);
          e.target.closePopup();
        },
      }}
    >
      <Popup ref={popupRef} closeButton={false} autoPan={false}>
        <div className="text-center min-w-[140px]">
          <p className="font-bold text-sm text-slate-800">
            {nameEn} Range
          </p>
          <p className="text-xs text-slate-500 mt-0.5">
            {nameZh} 分布范围
          </p>
          <p className="text-xs text-slate-400 mt-1 italic">{habitatEn}</p>
        </div>
      </Popup>
    </Polygon>
  );
}

// Tile layer configs
// EN: CartoDB Positron — clean light basemap with English-only labels, no API key needed
// ZH: Gaode (Amap) — Chinese labels, free, no key
const TILES = {
  en: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: "abcd",
  },
  zh: {
    url: "https://webrd01.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}",
    attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
    subdomains: "1234",
  },
} as const;

// Main component props
export interface AnimalMapInnerProps {
  center: [number, number];
  habitatEn: string;
  habitatZh: string;
  animalNameEn: string;
  animalNameZh: string;
  polygons: [number, number][][];
  lang: "en" | "zh";
}

export default function AnimalMapInner({
  center,
  habitatEn,
  habitatZh,
  animalNameEn,
  animalNameZh,
  polygons,
  lang,
}: AnimalMapInnerProps) {
  const tile = TILES[lang];

  return (
    <MapContainer
      center={center}
      zoom={4}
      minZoom={2}
      maxZoom={12}
      scrollWheelZoom={true}
      className="h-full w-full rounded-2xl z-0"
      worldCopyJump={false}
      maxBounds={[[-90, -180], [90, 180]]}
      maxBoundsViscosity={1.0}
    >
      <TileLayer
        key={lang}
        attribution={tile.attribution}
        url={tile.url}
        subdomains={tile.subdomains}
      />

      {/* Auto-fit to all polygons' bounding box */}
      <FitBoundsOnLoad polygons={polygons} fallbackCenter={center} />

      {/* Distribution polygons */}
      {polygons.map((ring, idx) => (
        <DistributionPolygon
          key={idx}
          positions={ring}
          nameEn={animalNameEn}
          nameZh={animalNameZh}
          habitatEn={habitatEn}
          habitatZh={habitatZh}
        />
      ))}

      {/* Center marker */}
      <Marker position={center}>
        <Popup>
          <div className="text-center">
            <p className="font-bold text-sm">{animalNameEn}</p>
            <p className="text-slate-500 text-xs">{animalNameZh}</p>
            <p className="text-xs text-slate-400 mt-0.5 italic">
              {habitatEn} / {habitatZh}
            </p>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
