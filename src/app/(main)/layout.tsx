import { BottomNav } from "@/shared/components/BottomNav";
import styles from "./layout.module.scss";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className={styles.layout}>
      <main className={styles.main}>{children}</main>
      <BottomNav />
    </div>
  );
};

export default MainLayout;
