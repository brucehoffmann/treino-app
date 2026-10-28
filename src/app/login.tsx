import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, ApiError } from "../api/client";
import { Body, Button, Field } from "../components/ui/ui";
import { usePreferences } from "../preferences";
import { useSession } from "../session";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { t } = usePreferences();
  const { setToken } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function login() {
    setPending(true);
    setError(null);
    try {
      const result = await api<{ token: string }>("/auth/login", {
        method: "POST",
        body: { email: email.trim(), password },
      });
      await setToken(result.token);
      router.replace("/activities");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t("loading"));
    } finally {
      setPending(false);
    }
  }

  return (
    <View className="flex-1 justify-center gap-4 px-5" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Pressable onPress={() => router.back()}>
        <Body className="text-primary">{t("back")}</Body>
      </Pressable>
      <Body className="text-3xl font-semibold">{t("login")}</Body>
      <Body muted>{t("loginPrompt")}</Body>
      <Field value={email} onChangeText={setEmail} placeholder={t("email")} autoCapitalize="none" keyboardType="email-address" />
      <Field value={password} onChangeText={setPassword} placeholder={t("password")} secureTextEntry />
      {error ? <Body className="text-danger">{error}</Body> : null}
      <Button label={pending ? t("loading") : t("login")} disabled={pending || !email.includes("@") || password.length === 0} onPress={login} />
    </View>
  );
}
