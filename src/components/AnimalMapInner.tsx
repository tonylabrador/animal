"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

// Keep the marker local so Chinese map mode never depends on an external icon CDN.
const defaultIcon = L.divIcon({
  className: "wild-map-marker",
  html: "<span></span>",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -25],
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
  fallbackZoom,
}: {
  polygons: [number, number][][];
  fallbackCenter: [number, number];
  fallbackZoom: number;
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
      map.setView(fallbackCenter, fallbackZoom);
    }
  }, [map, polygons, fallbackCenter, fallbackZoom]);

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

interface TileProvider {
  id: string;
  label: { en: string; zh: string };
  url: string;
  attribution: string;
  subdomains?: string;
}

// Chinese mode tries two domestic Gaode delivery routes before the international
// fallback. This handles a CDN/DNS route failure without switching immediately to
// a source that may be less reliable from mainland China.
const TILE_PROVIDERS: Record<"en" | "zh", readonly TileProvider[]> = {
  en: [
    {
      id: "carto-voyager",
      label: { en: "CARTO basemap", zh: "CARTO 底图" },
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
    },
    {
      id: "osm-standard",
      label: { en: "OpenStreetMap backup", zh: "OpenStreetMap 备用底图" },
      url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    },
  ],
  zh: [
    {
      id: "gaode-webrd",
      label: { en: "Amap China route", zh: "高德地图国内线路" },
      url: "https://webrd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=7",
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
      subdomains: "1234",
    },
    {
      id: "gaode-wprd",
      label: { en: "Amap backup route", zh: "高德地图备用线路" },
      url: "https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&lang=zh_cn&size=1&scale=1&style=7",
      attribution: '&copy; <a href="https://www.amap.com/">高德地图</a>',
      subdomains: "1234",
    },
    {
      id: "carto-zh-fallback",
      label: { en: "International fallback", zh: "国际备用底图" },
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
    },
  ],
};

interface ProviderStatus {
  label: string;
  fallback: boolean;
  unavailable: boolean;
}

function ResilientTileLayer({
  lang,
  onStatus,
}: {
  lang: "en" | "zh";
  onStatus: (status: ProviderStatus) => void;
}) {
  const [providerIndex, setProviderIndex] = useState(0);
  const tileErrors = useRef(0);
  const providers = TILE_PROVIDERS[lang];
  const provider = providers[providerIndex];

  useEffect(() => {
    onStatus({
      label: provider.label[lang],
      fallback: providerIndex > 0,
      unavailable: false,
    });
  }, [lang, onStatus, provider, providerIndex]);

  return (
    <TileLayer
      key={`${lang}-${provider.id}`}
      attribution={provider.attribution}
      url={provider.url}
      subdomains={provider.subdomains}
      eventHandlers={{
        load: () => {
          tileErrors.current = 0;
          onStatus({
            label: provider.label[lang],
            fallback: providerIndex > 0,
            unavailable: false,
          });
        },
        tileerror: () => {
          tileErrors.current += 1;
          if (tileErrors.current < 2) return;
          tileErrors.current = 0;
          if (providerIndex < providers.length - 1) {
            // Every TileLayer instance may emit many tile errors at once. Use the
            // current layer's fixed next index so one outage cannot skip a backup.
            setProviderIndex(providerIndex + 1);
          } else {
            onStatus({
              label: provider.label[lang],
              fallback: providerIndex > 0,
              unavailable: true,
            });
          }
        },
      }}
    />
  );
}

// Main component props
export interface AnimalMapInnerProps {
  center: [number, number];
  zoom: number;
  habitatEn: string;
  habitatZh: string;
  animalNameEn: string;
  animalNameZh: string;
  polygons: [number, number][][];
  rangeDisplayMode?: "verified-polygon" | "legacy-polygon-retained" | "representative-point";
  lang: "en" | "zh";
}

export default function AnimalMapInner({
  center,
  zoom,
  habitatEn,
  habitatZh,
  animalNameEn,
  animalNameZh,
  polygons,
  rangeDisplayMode,
  lang,
}: AnimalMapInnerProps) {
  const [providerStatus, setProviderStatus] = useState<ProviderStatus>({
    label: TILE_PROVIDERS[lang][0].label[lang],
    fallback: false,
    unavailable: false,
  });
  const handleProviderStatus = useCallback((status: ProviderStatus) => {
    setProviderStatus(status);
  }, []);
  const hasPolygon = polygons.length > 0;
  const isVerifiedRange = hasPolygon && rangeDisplayMode === "verified-polygon";

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={2}
        maxZoom={12}
        scrollWheelZoom={true}
        className="h-full w-full rounded-2xl z-0"
        worldCopyJump={false}
        maxBounds={[[-90, -180], [90, 180]]}
        maxBoundsViscosity={1.0}
      >
        <ResilientTileLayer key={lang} lang={lang} onStatus={handleProviderStatus} />

        {/* Auto-fit to all polygons' bounding box */}
        <FitBoundsOnLoad
          polygons={polygons}
          fallbackCenter={center}
          fallbackZoom={zoom}
        />

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
              <p className="mt-1 text-[11px] font-semibold text-amber-600">
                {isVerifiedRange
                  ? (lang === "en" ? "Center of verified range" : "已核实范围的中心点")
                  : hasPolygon
                    ? (lang === "en" ? "Center of retained approximate range" : "原有近似范围的中心点")
                    : (lang === "en" ? "Representative location — not the full range" : "代表性位置，并非完整分布范围")}
              </p>
              <p className="text-xs text-slate-400 mt-0.5 italic">
                {lang === "en" ? habitatEn : habitatZh}
              </p>
            </div>
          </Popup>
        </Marker>
      </MapContainer>

      <div
        data-testid="map-provider-status"
        className={`pointer-events-none absolute right-3 top-3 z-[1000] rounded-full border px-3 py-1.5 text-[11px] font-semibold shadow-sm backdrop-blur ${
          providerStatus.unavailable
            ? "border-red-200 bg-red-50/95 text-red-700"
            : providerStatus.fallback
              ? "border-amber-200 bg-amber-50/95 text-amber-700"
              : "border-slate-200 bg-white/90 text-slate-600"
        }`}
      >
        {providerStatus.unavailable
          ? (lang === "en" ? "Basemap unavailable; range overlay remains visible" : "底图暂不可用；分布标记仍可查看")
          : providerStatus.label}
      </div>
    </div>
  );
}
