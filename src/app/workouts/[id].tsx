import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, withLocale } from "../../api/client";
import type { Workout } from "../../api/types";
import { Body } from "../../components/ui/ui";
import { WorkoutForm } from "../../features/treinos/workout-form";
import { usePreferences } from "../../preferences";
import { useSession } from "../../session";

export default function EditWorkoutScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const client = useQueryClient();
  const { locale, t } = usePreferences();
  const { token } = useSession();
  const workout = useQuery({
    queryKey: ["workout", id, token, locale],
    queryFn: () => api<Workout>(withLocale(`/workouts/${id}`, locale), { token }),
    enabled: Boolean(id && token),
  });
  const save = useMutation({
    mutationFn: (body: Record<string, unknown>) => api(`/workouts/${id}`, { method: "PATCH", token, body }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["workouts"] });
      router.back();
    },
  });
  const remove = useMutation({
    mutationFn: () => api(`/workouts/${id}`, { method: "DELETE", token }),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["workouts"] });
      router.back();
    },
  });

  return (
    <View className="flex-1" style={{ paddingTop: insets.top }}>
      <View className="px-5 py-4">
        <Pressable onPress={() => router.back()}><Body className="text-primary">{t("back")}</Body></Pressable>
      </View>
      {workout.data ? (
        <WorkoutForm
          initial={workout.data}
          pending={save.isPending || remove.isPending}
          onSave={(body) => {
            const { activityType: _activityType, ...patch } = body;
            return save.mutateAsync(patch).then(() => undefined);
          }}
          onDelete={() =>
            Alert.alert(t("deleteWorkout"), t("deleteWorkoutBody"), [
              { text: t("cancel"), style: "cancel" },
              { text: t("delete"), style: "destructive", onPress: () => remove.mutate() },
            ])
          }
        />
      ) : null}
    </View>
  );
}
