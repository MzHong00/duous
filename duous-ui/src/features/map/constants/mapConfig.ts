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

// ─── 스토리 경로 폴리라인 ─────────────────────────────────────────────────────
// 지도 배경(도로·녹지·물)이 어떤 색이든 경로가 묻히지 않도록, 흰 밑선(casing) 위에
// 컬러 선을 겹쳐 두 겹으로 그린다 — 지도 제작에서 도로선을 분리할 때 쓰는 방식.

const LINE_WEIGHT = 5; // 기본 경로 선 굵기
const LINE_WEIGHT_SELECTED = 7; // 선택된 경로 선 굵기
const CASING_EXTRA_WEIGHT = 4; // 흰 밑선이 컬러 선보다 넓게 깔리는 정도
const LINE_OPACITY = 0.9; // 선택이 없을 때 모든 경로의 불투명도
const LINE_OPACITY_DIMMED = 0.45; // 다른 경로가 선택됐을 때의 불투명도
const CASING_OPACITY_RATIO = 0.85; // 밑선은 컬러 선보다 살짝 옅게
const CASING_Z_INDEX = 1;
const LINE_Z_INDEX = 2;
const SELECTED_Z_INDEX_BOOST = 10; // 선택된 경로를 다른 경로 위로 올린다

interface StoryLineOptionsParams {
  color: string; // 경로 색상
  isSelected: boolean; // 이 경로가 선택됐는지
  hasSelection: boolean; // 다른 경로가 선택된 상태인지 판단하기 위한 전체 선택 여부
}

/** 스토리 경로의 밑선(casing)·본선 폴리라인 옵션을 함께 만든다 */
export const getStoryLineOptions = ({
  color,
  isSelected,
  hasSelection,
}: StoryLineOptionsParams) => {
  const opacity = !hasSelection || isSelected ? LINE_OPACITY : LINE_OPACITY_DIMMED;
  const weight = isSelected ? LINE_WEIGHT_SELECTED : LINE_WEIGHT;
  const zBoost = isSelected ? SELECTED_Z_INDEX_BOOST : 0;

  return {
    casing: {
      strokeColor: COLORS.white,
      strokeOpacity: opacity * CASING_OPACITY_RATIO,
      strokeWeight: weight + CASING_EXTRA_WEIGHT,
      clickable: false,
      zIndex: CASING_Z_INDEX + zBoost,
    },
    line: {
      strokeColor: color,
      strokeOpacity: opacity,
      strokeWeight: weight,
      clickable: true,
      zIndex: LINE_Z_INDEX + zBoost,
    },
  };
};

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
