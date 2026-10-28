import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import DraggableFlatList, { ScaleDecorator } from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, ApiError, withLocale } from "../../api/client";
import type { Workout } from "../../api/types";
import { Body, Button } from "../../components/ui/ui";
import { usePreferences } from "../../preferences";
import { useSession } from "../../session";

export default function WorkoutsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const client = useQueryClient();
  const { locale, t } = usePreferences();
  const { token, setToken } = useSession();
  const [order, setOrder] = useState<Workout[] | null>(null);
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
  const reorder = useMutation({
    mutationFn: (ids: string[]) => api(withLocale("/workouts/order", locale), { method: "PUT", token, body: { ids } }),
    onSuccess: async () => {
      setOrder(null);
      await client.invalidateQueries({ queryKey: ["workouts", token, locale] });
    },
  });
  const data = order ?? workouts.data ?? [];

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-5 py-4">
        <Pressable onPress={() => router.back()}><Body className="text-primary">{t("back")}</Body></Pressable>
        <Body className="text-xl font-semibold">{t("workouts")}</Body>
        <View className="w-12" />
      </View>
      <Body muted className="px-5 pb-3">{t("dragHint")}</Body>
      <DraggableFlatList
        data={data}
        keyExtractor={(item) => item.id}
        containerStyle={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 12, paddingBottom: 16 }}
        onDragEnd={({ data: next }) => {
          setOrder(next);
          reorder.mutate(next.map((item) => item.id));
        }}
        renderItem={({ item, drag }) => (
          <ScaleDecorator>
            <Pressable onLongPress={drag} delayLongPress={180} onPress={() => router.push(`/workouts/${item.id}`)} className={`rounded-3xl border bg-surface p-4 ${item.featured ? "border-primary" : "border-border"}`}>
              <Body className="text-lg font-semibold">{item.title}</Body>
              {item.featured ? <Body className="text-primary">{t("featured")}</Body> : null}
            </Pressable>
          </ScaleDecorator>
        )}
      />
      <View className="px-5" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button label={t("newWorkout")} onPress={() => router.push("/workouts/new")} />
      </View>
    </View>
  );
}
