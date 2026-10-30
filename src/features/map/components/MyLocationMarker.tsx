import { memo } from "react";
import { OverlayView } from "@react-google-maps/api";
import Image from "next/image";

import { AVATAR_SIZE } from "@/constants/style";
import { getInitials } from "@/utils/format";

import styles from "./MyLocationMarker.module.scss";

interface MyLocationMarkerProps {
  name: string; // 마커에 표시할 내 이름
  avatar?: string; // 내 프로필 이미지 URL
  lat: number; // 위도
  lng: number; // 경도
}

// recordingPath 갱신 등 지도 전체 리렌더 시에도, 위치가 그대로면 OverlayView 재생성을 건너뛴다
const MyLocationMarkerComponent = ({ name, avatar, lat, lng }: MyLocationMarkerProps) => {
  return (
    <OverlayView position={{ lat, lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <div className={styles.marker}>
        <div className={styles.avatar}>
          {avatar ? (
            <Image
              src={avatar}
              alt={name}
              width={AVATAR_SIZE.lg}
              height={AVATAR_SIZE.lg}
              className={styles.image}
            />
          ) : (
            <span className={styles.initial}>{getInitials(name)}</span>
          )}
        </div>
      </div>
    </OverlayView>
  );
};

/** 지도 위 내 위치 아바타 마커 (Google Maps OverlayView) */
export const MyLocationMarker = memo(MyLocationMarkerComponent);
MyLocationMarker.displayName = "MyLocationMarker";
