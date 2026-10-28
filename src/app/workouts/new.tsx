import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../../api/client";
import { Body } from "../../components/ui/ui";
import { WorkoutForm } from "../../features/treinos/workout-form";
import { usePreferences } from "../../preferences";
import { useSession } from "../../session";

export default function NewWorkoutScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const client = useQueryClient();
  const { t } = usePreferences();
  const { token } = useSession();
  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) => api("/workouts", { method: "POST", token, body }),
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
      <WorkoutForm pending={create.isPending} onSave={(body) => create.mutateAsync(body).then(() => undefined)} />
    </View>
  );
}
