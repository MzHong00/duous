import { OverlayView } from "@react-google-maps/api";
import { cx } from "@/utils/cn";
import type { WorkspaceMember } from "@/features/workspace/types/workspace";
import styles from "./MemberMarker.module.scss";

interface MemberMarkerProps {
  member: WorkspaceMember;
  lat: number;
  lng: number;
  isMe: boolean;
  onClick: (memberId: string) => void;
}

/** 지도 위 멤버 아바타 마커 (Google Maps OverlayView) */
export const MemberMarker = ({ member, lat, lng, isMe, onClick }: MemberMarkerProps) => {
  return (
    <OverlayView position={{ lat, lng }} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
      <button type="button" onClick={() => onClick(member.id)} className={styles.marker}>
        <div className={cx(styles.avatar, isMe && styles.avatarMe)}>
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className={styles.image} />
          ) : (
            <span className={styles.initial}>{member.name[0]}</span>
          )}
        </div>
      </button>
    </OverlayView>
  );
};
