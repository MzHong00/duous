import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { ENV } from "@/shared/constants/config";

let _client: SupabaseClient | null = null;

const getSupabase = (): SupabaseClient => {
  if (_client) return _client;

  const url = ENV.SUPABASE_URL;
  const key = ENV.SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    _client = createClient("https://placeholder.supabase.co", "placeholder-key", {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return _client;
  }

  _client = createClient(url, key, {
    auth: {
      flowType: "implicit",
      persistSession: true,
      autoRefreshToken: true,
    },
  });
  return _client;
};

// 메서드 호출 시 this가 실제 클라이언트로 바인딩되도록 Proxy에서 bind 처리
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabase();
    const value = client[prop as keyof SupabaseClient];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
