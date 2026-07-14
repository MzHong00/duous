import { Suspense } from "react";

import { AuthCallbackView } from "@/features/auth/components/AuthCallbackView";

import styles from "./page.module.scss";

const AuthCallbackPage = () => {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.spinner} />
        </div>
      }
    >
      <AuthCallbackView />
    </Suspense>
  );
};

export default AuthCallbackPage;
