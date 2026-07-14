import styles from "./ChatPartnerEmpty.module.scss";

/** 워크스페이스에 파트너가 없을 때 채팅 화면에 표시하는 빈 상태 */
export const ChatPartnerEmpty = () => (
  <div className={styles.wrap}>
    <span className={styles.emojiCircle} aria-hidden="true">
      💌
    </span>
    <p className={styles.title}>아직 파트너가 없어요</p>
    <p className={styles.subtitle}>
      파트너를 초대하면
      <br />
      둘만의 대화가 여기서 시작돼요
    </p>
  </div>
);
