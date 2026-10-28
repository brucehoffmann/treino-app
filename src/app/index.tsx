import { Redirect } from "expo-router";
import { useSession } from "../session";

export default function Index() {
  const { ready, token } = useSession();
  if (!ready) return null;
  return <Redirect href={token ? "/activities" : "/chat"} />;
}
