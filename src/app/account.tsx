import { useMutation } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { Alert, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";
import { Body, Button } from "../components/ui/ui";
import { usePreferences, type LocaleChoice, type ThemeChoice } from "../preferences";
import { useSession } from "../session";

export default function AccountScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t, theme, localeChoice, setTheme, setLocaleChoice } = usePreferences();
  const { token, setToken } = useSession();
  const remove = useMutation({
    mutationFn: () => api("/me", { method: "DELETE", token }),
    onSuccess: async () => {
      await setToken(null);
      router.replace("/chat");
    },
  });

  return (
    <View className="flex-1 gap-6 px-5" style={{ paddingTop: insets.top + 12 }}>
      <Pressable onPress={() => router.back()}><Body className="text-primary">{t("back")}</Body></Pressable>
      <Body className="text-3xl font-semibold">{t("account")}</Body>
      <Choice title={t("theme")} value={theme} options={[["system", t("system")], ["light", t("light")], ["dark", t("dark")]]} onChange={(value) => setTheme(value as ThemeChoice)} />
      <Choice title={t("language")} value={localeChoice} options={[["system", t("system")], ["pt-BR", t("portuguese")], ["en", t("english")]]} onChange={(value) => setLocaleChoice(value as LocaleChoice)} />
      <Button label={t("logout")} variant="secondary" onPress={() => setToken(null)} />
      <Button
        label={t("deleteAccount")}
        variant="danger"
        disabled={remove.isPending}
        onPress={() =>
          Alert.alert(t("deleteAccount"), t("deleteAccountBody"), [
            { text: t("cancel"), style: "cancel" },
            { text: t("delete"), style: "destructive", onPress: () => remove.mutate() },
          ])
        }
      />
    </View>
  );
}

function Choice({ title, value, options, onChange }: { title: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return (
    <View className="gap-3">
      <Body className="font-semibold">{title}</Body>
      <View className="flex-row flex-wrap gap-2">
        {options.map(([key, label]) => (
          <Pressable key={key} onPress={() => onChange(key)} className={`rounded-full px-4 py-2 ${value === key ? "bg-primary" : "bg-secondary"}`}>
            <Body className={value === key ? "text-on-primary" : "text-on-secondary"}>{label}</Body>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
