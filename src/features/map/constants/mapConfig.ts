import { COLORS } from "@/constants/theme";

import type { LocationPoint } from "@/features/stories/types/story";

export const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };
export const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울 시청 (위치 권한 거부 시 기본 중심)
export const DEFAULT_ZOOM = 14;

export const MAP_OPTIONS: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  gestureHandling: "greedy",
  styles: [
    { featureType: "transit.line", stylers: [{ visibility: "off" }] },
    { featureType: "transit.station", stylers: [{ visibility: "off" }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    {
      featureType: "administrative.land_parcel",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
};

/** LocationPoint[] → Google Maps LatLngLiteral[] 변환 */
export const toLatLngPath = (path: LocationPoint[]): google.maps.LatLngLiteral[] =>
  path.map((p) => ({ lat: p.latitude, lng: p.longitude }));

/**
 * 실시간 기록 중 경로용 점선(원형 심볼 반복) 폴리라인 옵션.
 * `google.maps.SymbolPath`는 API 로드 후에만 접근 가능하므로 렌더 시점에 호출한다.
 */
export const getRecordingPolylineOptions = (): google.maps.PolylineOptions => ({
  strokeColor: COLORS.primary,
  strokeOpacity: 0,
  strokeWeight: 6,
  icons: [
    {
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillOpacity: 1,
        fillColor: COLORS.primary,
        strokeOpacity: 0,
        scale: 3,
      },
      offset: "0",
      repeat: "15px",
    },
  ],
});
