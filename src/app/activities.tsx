import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { User } from "lucide-react-native";
import { primaryColor } from "../theme/palettes";
import { api, ApiError, withLocale } from "../api/client";
import type { Workout } from "../api/types";
import { Body, Button, Card } from "../components/ui/ui";
import { usePreferences } from "../preferences";
import { useSession } from "../session";

export default function ActivitiesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { locale, t } = usePreferences();
  const { token, setToken } = useSession();
  const workouts = useQuery({
    queryKey: ["workouts", token, locale],
    queryFn: async () => {
      try {
        return await api<Workout[]>(withLocale("/workouts", locale), { token });
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) await setToken(null);
        throw error;
      }
    },
    enabled: Boolean(token),
  });
  const featured = workouts.data?.find((item) => item.featured) ?? workouts.data?.[0];

  return (
    <View className="flex-1 px-5" style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }}>
      <View className="mb-6 flex-row items-center justify-between">
        <Body className="text-3xl font-semibold">{t("activities")}</Body>
        <Pressable onPress={() => router.push("/account")} className="rounded-full bg-surface p-3">
          <User color={primaryColor} size={22} />
        </Pressable>
      </View>
      <View className="flex-1 justify-center gap-4">
        {featured ? (
          <Card featured>
            <Body muted>{t("featured")}</Body>
            <Body className="mt-2 text-2xl font-semibold">{featured.title}</Body>
            {featured.block?.runTemplateName ? <Body muted>{featured.block.runTemplateName}</Body> : null}
          </Card>
        ) : (
          <Card>
            <Body className="text-2xl font-semibold">{t("emptyTitle")}</Body>
            <Body muted className="mt-2">{t("emptyBody")}</Body>
          </Card>
        )}
        <Button label={t("openWorkouts")} onPress={() => router.push("/workouts")} />
        <Body muted>{t("historyLater")}</Body>
      </View>
    </View>
  );
}
