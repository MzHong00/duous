"use client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/shared/lib/supabase";
import { authActions } from "@/features/auth/stores/useAuthStore";
import { authQueries } from "@/features/auth/queries/authQueries";

export const SessionProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session) {
        authActions.setAuth(session.access_token, session.refresh_token ?? undefined);
        queryClient.invalidateQueries({ queryKey: authQueries.user().queryKey });
      }

      if (event === "SIGNED_OUT") {
        authActions.clearAuth();
        queryClient.removeQueries({ queryKey: authQueries.user().queryKey });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  return <>{children}</>;
};
