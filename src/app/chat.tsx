import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api, ApiError, withLocale } from "../api/client";
import type { Equipment } from "../api/types";
import { Body, Button, Field } from "../components/ui/ui";
import { usePreferences } from "../preferences";
import { useSession } from "../session";

const steps = ["goal", "days", "runs", "lifts", "equipment", "account"] as const;

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { locale, t } = usePreferences();
  const { setToken } = useSession();
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState("");
  const [days, setDays] = useState(3);
  const [runs, setRuns] = useState<boolean | null>(null);
  const [lifts, setLifts] = useState<boolean | null>(null);
  const [equipmentIds, setEquipmentIds] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const equipment = useQuery({
    queryKey: ["equipments", locale],
    queryFn: () => api<Equipment[]>(withLocale("/catalog/equipments", locale)),
    enabled: steps[step] === "equipment" || steps[step] === "account",
  });

  const current = steps[step];

  function next() {
    setError(null);
    setStep((value) => Math.min(value + 1, steps.length - 1));
  }

  async function register() {
    if (password.length < 8) {
      setError(t("passwordShort"));
      return;
    }
    setPending(true);
    setError(null);
    try {
      const result = await api<{ token: string }>("/auth/register", {
        method: "POST",
        body: {
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          profile: { goal: goal.trim(), daysPerWeek: days, runs: runs === true, lifts: lifts === true, equipmentIds },
        },
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
    <View className="flex-1" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      <Pressable onPress={() => router.push("/login")} className="px-5 pt-3">
        <Body className="text-primary">{t("haveAccount")}</Body>
      </Pressable>
      <ScrollView className="flex-1" contentContainerClassName="gap-4 px-5 py-6">
        {steps.slice(0, step).map((done) => (
          <View key={done} className="gap-2">
            <Bubble text={prompt(done, t)} />
            <Bubble mine text={answer(done, { goal, days, runs, lifts, equipmentIds, equipment: equipment.data ?? [], t })} />
          </View>
        ))}
        <Bubble text={prompt(current, t)} />
        {current === "equipment" ? <Body muted>{t("equipmentHint")}</Body> : null}
        {error ? <Body className="text-danger">{error}</Body> : null}
      </ScrollView>
      <View className="gap-3 px-5 pb-4">
        {current === "goal" ? (
          <>
            <Field value={goal} onChangeText={setGoal} placeholder={t("goalPlaceholder")} />
            <Button label={t("continue")} disabled={goal.trim().length === 0} onPress={next} />
          </>
        ) : null}
        {current === "days" ? (
          <>
            <View className="flex-row items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <Pressable onPress={() => setDays((value) => Math.max(1, value - 1))}>
                <Body className="text-2xl">−</Body>
              </Pressable>
              <Body className="text-2xl font-semibold">{days}</Body>
              <Pressable onPress={() => setDays((value) => Math.min(7, value + 1))}>
                <Body className="text-2xl">+</Body>
              </Pressable>
            </View>
            <Button label={t("continue")} onPress={next} />
          </>
        ) : null}
        {current === "runs" || current === "lifts" ? (
          <View className="flex-row gap-3">
            <View className="flex-1">
              <Button
                label={t("yes")}
                onPress={() => {
                  if (current === "runs") setRuns(true);
                  else setLifts(true);
                  next();
                }}
              />
            </View>
            <View className="flex-1">
              <Button
                label={t("no")}
                variant="secondary"
                onPress={() => {
                  if (current === "runs") setRuns(false);
                  else setLifts(false);
                  next();
                }}
              />
            </View>
          </View>
        ) : null}
        {current === "equipment" ? (
          <>
            <ScrollView className="max-h-56" contentContainerClassName="flex-row flex-wrap gap-2">
              {(equipment.data ?? []).map((item) => {
                const selected = equipmentIds.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    onPress={() =>
                      setEquipmentIds((currentIds) =>
                        selected ? currentIds.filter((id) => id !== item.id) : [...currentIds, item.id],
                      )
                    }
                    className={`rounded-full px-4 py-2 ${selected ? "bg-primary" : "bg-secondary"}`}
                  >
                    <Body className={selected ? "text-on-primary" : "text-on-secondary"}>{item.name}</Body>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button label={t("continue")} disabled={equipment.isLoading} onPress={next} />
          </>
        ) : null}
        {current === "account" ? (
          <>
            <Field value={name} onChangeText={setName} placeholder={t("name")} autoCapitalize="words" />
            <Field value={email} onChangeText={setEmail} placeholder={t("email")} autoCapitalize="none" keyboardType="email-address" />
            <Field value={password} onChangeText={setPassword} placeholder={t("password")} secureTextEntry />
            <Field value={phone} onChangeText={setPhone} placeholder={t("phone")} keyboardType="phone-pad" />
            <Button
              label={pending ? t("loading") : t("register")}
              disabled={pending || name.trim().length === 0 || !email.includes("@") || password.length === 0}
              onPress={register}
            />
            <Button label={t("google")} variant="secondary" onPress={() => Alert.alert(t("socialTitle"), t("socialBody"))} />
            <Button label={t("apple")} variant="secondary" onPress={() => Alert.alert(t("socialTitle"), t("socialBody"))} />
          </>
        ) : null}
      </View>
    </View>
  );
}

function Bubble({ text, mine }: { text: string; mine?: boolean }) {
  return (
    <View className={`max-w-[85%] rounded-3xl px-4 py-3 ${mine ? "self-end bg-primary" : "self-start bg-surface"}`}>
      <Body className={mine ? "text-on-primary" : "text-foreground"}>{text}</Body>
    </View>
  );
}

function prompt(step: (typeof steps)[number], t: (key: "goalPrompt" | "daysPrompt" | "runsPrompt" | "liftsPrompt" | "equipmentPrompt" | "accountPrompt") => string) {
  if (step === "goal") return t("goalPrompt");
  if (step === "days") return t("daysPrompt");
  if (step === "runs") return t("runsPrompt");
  if (step === "lifts") return t("liftsPrompt");
  if (step === "equipment") return t("equipmentPrompt");
  return t("accountPrompt");
}

function answer(
  step: (typeof steps)[number],
  data: {
    goal: string;
    days: number;
    runs: boolean | null;
    lifts: boolean | null;
    equipmentIds: string[];
    equipment: Equipment[];
    t: (key: "yes" | "no") => string;
  },
) {
  if (step === "goal") return data.goal.trim();
  if (step === "days") return String(data.days);
  if (step === "runs") return data.runs ? data.t("yes") : data.t("no");
  if (step === "lifts") return data.lifts ? data.t("yes") : data.t("no");
  const names = data.equipment.filter((item) => data.equipmentIds.includes(item.id)).map((item) => item.name);
  return names.join(", ");
}
