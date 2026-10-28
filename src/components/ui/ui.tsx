import type { ReactNode } from "react";
import { Pressable, Text, TextInput, View, type PressableProps, type TextInputProps, type TextProps } from "react-native";
import { useResolvedScheme } from "../../preferences";

export function Body({ children, muted, className, ...props }: TextProps & { muted?: boolean; className?: string }) {
  return <Text {...props} className={`${muted ? "text-muted" : "text-foreground"} ${className ?? ""}`} />;
}

export function Button({
  label,
  variant = "primary",
  ...props
}: PressableProps & { label: string; variant?: "primary" | "secondary" | "danger" }) {
  const surface = variant === "primary" ? "bg-primary" : variant === "danger" ? "bg-danger" : "bg-secondary";
  const ink = variant === "secondary" ? "text-on-secondary" : "text-on-primary";
  return (
    <Pressable {...props} className={`items-center rounded-2xl px-4 py-4 ${surface} ${props.disabled ? "opacity-50" : ""}`}>
      <Text className={`text-base font-semibold ${ink}`}>{label}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps) {
  const scheme = useResolvedScheme();
  return (
    <TextInput
      {...props}
      placeholderTextColor={scheme === "dark" ? "#A3A3A3" : "#6B6B6B"}
      className="rounded-2xl border border-border bg-surface px-4 py-3 text-base text-foreground"
    />
  );
}

export function Card({ children, featured }: { children: ReactNode; featured?: boolean }) {
  return <View className={`rounded-3xl border bg-surface p-4 ${featured ? "border-primary" : "border-border"}`}>{children}</View>;
}
