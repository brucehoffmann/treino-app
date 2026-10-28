import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { readValue, writeValue } from "./storage";

type Session = {
  ready: boolean;
  token: string | null;
  setToken: (value: string | null) => Promise<void>;
};

const SessionContext = createContext<Session | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    readValue("token").then((stored) => {
      setTokenState(stored);
      setReady(true);
    });
  }, []);

  const value = useMemo<Session>(
    () => ({
      ready,
      token,
      setToken: async (next) => {
        setTokenState(next);
        await writeValue("token", next);
      },
    }),
    [ready, token],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Sessão fora do provider.");
  return value;
}
