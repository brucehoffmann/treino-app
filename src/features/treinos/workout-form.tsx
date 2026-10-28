import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Dumbbell } from "lucide-react-native";
import { primaryColor } from "../../theme/palettes";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { api, ApiError, withLocale } from "../../api/client";
import type { ExerciseItem, ExercisePage, MuscleGroup, RunTemplate, Workout } from "../../api/types";
import { Body, Button, Field } from "../../components/ui/ui";
import { usePreferences } from "../../preferences";
import { optionalDecimal, optionalInt } from "./numbers";

export type DraftSet = { key: string; reps: string; loadKg: string; durationSeconds: string };
export type DraftExercise = { key: string; exercise: ExerciseItem; sets: DraftSet[] };

type Props = {
  initial?: Workout | null;
  pending: boolean;
  onSave: (body: Record<string, unknown>) => Promise<void>;
  onDelete?: () => void;
};

export function WorkoutForm({ initial, pending, onSave, onDelete }: Props) {
  const { locale, t } = usePreferences();
  const initialType = initial?.activityType === "corrida" ? "corrida" : initial ? "academia" : null;
  const [kind, setKind] = useState<"academia" | "corrida" | null>(initialType);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [muscle, setMuscle] = useState("");
  const [cursor, setCursor] = useState<string | null>(null);
  const [pages, setPages] = useState<ExerciseItem[]>([]);
  const [picked, setPicked] = useState<DraftExercise[]>(() => draftFromWorkout(initial));
  const [templateId, setTemplateId] = useState(initial?.block?.runTemplateId ?? "");
  const [distance, setDistance] = useState(textOf(initial?.block?.distanceMeters));
  const [duration, setDuration] = useState(textOf(initial?.block?.durationSeconds));
  const [repeats, setRepeats] = useState(textOf(initial?.block?.repeats));
  const [rest, setRest] = useState(textOf(initial?.block?.restSeconds));
  const [error, setError] = useState<string | null>(null);

  const muscles = useQuery({
    queryKey: ["muscles", locale],
    queryFn: () => api<MuscleGroup[]>(withLocale("/catalog/muscle-groups", locale)),
    enabled: kind === "academia",
  });
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const search = useQuery({
    queryKey: ["exercises", locale, debouncedQuery, muscle, cursor],
    queryFn: async () => {
      const params = new URLSearchParams({ locale });
      if (debouncedQuery) params.set("q", debouncedQuery);
      if (muscle) params.set("muscleGroup", muscle);
      if (cursor) params.set("cursor", cursor);
      const page = await api<ExercisePage>(`/catalog/exercises?${params.toString()}`);
      return { ...page, requestedCursor: cursor };
    },
    enabled: kind === "academia",
  });

  useEffect(() => {
    if (!search.data || search.data.requestedCursor !== cursor) return;
    const page = search.data;
    setPages((current) => {
      if (!cursor) return page.items;
      const known = new Set(current.map((item) => item.id));
      return [...current, ...page.items.filter((item) => !known.has(item.id))];
    });
  }, [cursor, search.data]);
  const templates = useQuery({
    queryKey: ["run-templates", locale],
    queryFn: () => api<RunTemplate[]>(withLocale("/catalog/run-templates", locale)),
    enabled: kind === "corrida",
  });

  function chooseTemplate(item: RunTemplate) {
    setTemplateId(item.id);
    setDistance(textOf(item.distanceMeters));
    setDuration(textOf(item.durationSeconds));
    setRepeats(textOf(item.repeats));
    setRest(textOf(item.restSeconds));
    if (!title.trim()) setTitle(item.name);
  }

  async function save() {
    if (!title.trim() || !kind) {
      setError(t("needTitle"));
      return;
    }
    if (kind === "academia") {
      if (picked.length === 0) {
        setError(t("needExercise"));
        return;
      }
      const exercises = [];
      for (const item of picked) {
        const sets = [];
        for (const set of item.sets) {
          const reps = optionalInt(set.reps);
          const loadKg = optionalDecimal(set.loadKg);
          const durationSeconds = optionalInt(set.durationSeconds);
          if (reps === null || loadKg === null || durationSeconds === null) {
            setError(t("invalidNumber"));
            return;
          }
          sets.push({ ...(reps !== undefined ? { reps } : {}), ...(loadKg !== undefined ? { loadKg } : {}), ...(durationSeconds !== undefined ? { durationSeconds } : {}) });
        }
        exercises.push({ exerciseId: item.exercise.id, sets });
      }
      await submit({ title: title.trim(), activityType: "academia", exercises });
      return;
    }
    if (!templateId) {
      setError(t("needTemplate"));
      return;
    }
    const distanceMeters = optionalInt(distance);
    const durationSeconds = optionalInt(duration);
    const repeatCount = optionalInt(repeats);
    const restSeconds = optionalInt(rest);
    if ([distanceMeters, durationSeconds, repeatCount, restSeconds].includes(null)) {
      setError(t("invalidNumber"));
      return;
    }
    await submit({
      title: title.trim(),
      activityType: "corrida",
      runTemplateId: templateId,
      ...(distanceMeters !== undefined ? { distanceMeters } : {}),
      ...(durationSeconds !== undefined ? { durationSeconds } : {}),
      ...(repeatCount !== undefined ? { repeats: repeatCount } : {}),
      ...(restSeconds !== undefined ? { restSeconds } : {}),
    });
  }

  async function submit(body: Record<string, unknown>) {
    setError(null);
    try {
      await onSave(body);
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : t("loading"));
    }
  }

  return (
    <ScrollView contentContainerClassName="gap-4 px-5 pb-10">
      {!initial ? (
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button label={t("gym")} variant={kind === "academia" ? "primary" : "secondary"} onPress={() => setKind("academia")} />
          </View>
          <View className="flex-1">
            <Button label={t("run")} variant={kind === "corrida" ? "primary" : "secondary"} onPress={() => setKind("corrida")} />
          </View>
        </View>
      ) : null}
      {kind ? <Field value={title} onChangeText={setTitle} placeholder={t("title")} /> : null}
      {kind === "academia" ? (
        <>
          <Field
            value={query}
            onChangeText={(value) => {
              setQuery(value);
              setCursor(null);
              setPages([]);
            }}
            placeholder={t("search")}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
            <Chip label={t("allMuscles")} selected={muscle === ""} onPress={() => { setMuscle(""); setCursor(null); setPages([]); }} />
            {(muscles.data ?? []).map((item) => (
              <Chip key={item.key} label={item.name} selected={muscle === item.key} onPress={() => { setMuscle(item.key); setCursor(null); setPages([]); }} />
            ))}
          </ScrollView>
          {pages.map((item) => (
            <Pressable key={item.id} onPress={() => setPicked((current) => [...current, { key: `${item.id}-${current.length}`, exercise: item, sets: [emptySet()] }])} className="flex-row items-center gap-3 rounded-2xl bg-surface p-3">
              {item.gifUrl ? <Image source={{ uri: item.gifUrl }} style={{ width: 56, height: 56, borderRadius: 12 }} contentFit="cover" /> : <View className="h-14 w-14 items-center justify-center rounded-xl bg-elevated"><Dumbbell color={primaryColor} size={22} /></View>}
              <Body className="flex-1">{item.name}</Body>
              <Body className="text-primary">{t("addExercise")}</Body>
            </Pressable>
          ))}
          {search.data?.nextCursor ? <Button label={t("continue")} variant="secondary" onPress={() => setCursor(search.data?.nextCursor ?? null)} /> : null}
          {picked.map((item, index) => (
            <View key={item.key} className="gap-3 rounded-3xl bg-surface p-4">
              <View className="flex-row items-center justify-between">
                <Body className="flex-1 font-semibold">{item.exercise.name}</Body>
                <Pressable onPress={() => setPicked((current) => current.filter((entry) => entry.key !== item.key))}><Body className="text-danger">{t("delete")}</Body></Pressable>
              </View>
              {item.sets.map((set, setIndex) => (
                <View key={set.key} className="gap-2">
                  <Body muted>{`${t("sets")} ${setIndex + 1}`}</Body>
                  <Field value={set.reps} onChangeText={(value) => setPicked((current) => updateSet(current, index, set.key, { reps: value }))} placeholder={t("reps")} keyboardType="number-pad" />
                  <Field value={set.loadKg} onChangeText={(value) => setPicked((current) => updateSet(current, index, set.key, { loadKg: value }))} placeholder={t("load")} keyboardType="decimal-pad" />
                  <Field value={set.durationSeconds} onChangeText={(value) => setPicked((current) => updateSet(current, index, set.key, { durationSeconds: value }))} placeholder={t("seconds")} keyboardType="number-pad" />
                </View>
              ))}
              <Button label={t("addSet")} variant="secondary" onPress={() => setPicked((current) => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, sets: [...entry.sets, emptySet()] } : entry))} />
            </View>
          ))}
        </>
      ) : null}
      {kind === "corrida" ? (
        <>
          {(templates.data ?? []).map((item) => (
            <Pressable key={item.id} onPress={() => chooseTemplate(item)} className={`rounded-2xl border p-4 ${templateId === item.id ? "border-primary bg-surface" : "border-border bg-surface"}`}>
              <Body className="font-semibold">{item.name}</Body>
              <Body muted>{item.summary}</Body>
            </Pressable>
          ))}
          {templateId ? (
            <>
              <Field value={distance} onChangeText={setDistance} placeholder={t("distance")} keyboardType="number-pad" />
              <Field value={duration} onChangeText={setDuration} placeholder={t("duration")} keyboardType="number-pad" />
              <Field value={repeats} onChangeText={setRepeats} placeholder={t("repeats")} keyboardType="number-pad" />
              <Field value={rest} onChangeText={setRest} placeholder={t("rest")} keyboardType="number-pad" />
            </>
          ) : null}
        </>
      ) : null}
      {error ? <Body className="text-danger">{error}</Body> : null}
      {kind ? <Button label={pending ? t("loading") : t("save")} disabled={pending} onPress={save} /> : null}
      {onDelete ? <Button label={t("deleteWorkout")} variant="danger" onPress={onDelete} /> : null}
    </ScrollView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} className={`rounded-full px-4 py-2 ${selected ? "bg-primary" : "bg-secondary"}`}>
      <Body className={selected ? "text-on-primary" : "text-on-secondary"}>{label}</Body>
    </Pressable>
  );
}

function emptySet(): DraftSet {
  return { key: `${Date.now()}-${Math.random()}`, reps: "", loadKg: "", durationSeconds: "" };
}

function textOf(value: number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function draftFromWorkout(workout?: Workout | null): DraftExercise[] {
  if (!workout?.block?.exercises.length) return [];
  return workout.block.exercises.map((item) => ({
    key: item.id,
    exercise: { id: item.exerciseId, name: item.name, gifUrl: item.gifUrl, muscleGroups: [] },
    sets: item.sets.map((set) => ({
      key: set.id,
      reps: textOf(set.reps),
      loadKg: textOf(set.loadKg),
      durationSeconds: textOf(set.durationSeconds),
    })),
  }));
}

function updateSet(current: DraftExercise[], exerciseIndex: number, setKey: string, patch: Partial<DraftSet>) {
  return current.map((entry, index) =>
    index === exerciseIndex
      ? { ...entry, sets: entry.sets.map((set) => (set.key === setKey ? { ...set, ...patch } : set)) }
      : entry,
  );
}
