import { api } from "@/convex/_generated/api";
import { useEffect } from "react";
import { useQuery } from "convex/react";
//import { useSessionQuery } from "convex-helpers/react/sessions"; - we will need this if we ever decide to enable "anon" state users

const LOCAL_STORAGE_KEY = "threads";

export function useThreadData() {
  const threadsFromConvex = useQuery(api.threads.get);

  const threadsFromLocalStorage: typeof threadsFromConvex = JSON.parse(
    localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
  );

  useEffect(() => {
    if (threadsFromConvex) {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify(threadsFromConvex)
      );
    }
  }, [threadsFromConvex]);

  return threadsFromConvex || threadsFromLocalStorage;
}
