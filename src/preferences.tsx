import { getLocales } from "expo-localization";
import { useColorScheme as useNativeWindScheme } from "nativewind";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useColorScheme as useDeviceScheme } from "react-native";
import { messages, type AppLocale, type MessageKey } from "./i18n/dictionary";
import { readValue, writeValue } from "./storage";

export type ThemeChoice = "system" | "light" | "dark";
export type LocaleChoice = "system" | AppLocale;

type Preferences = {
  ready: boolean;
  theme: ThemeChoice;
  localeChoice: LocaleChoice;
  locale: AppLocale;
  setTheme: (value: ThemeChoice) => void;
  setLocaleChoice: (value: LocaleChoice) => void;
  t: (key: MessageKey) => string;
};

const PreferencesContext = createContext<Preferences | null>(null);

export function deviceLocale(): AppLocale {
  const code = getLocales()[0]?.languageCode ?? "pt";
  return code.startsWith("en") ? "en" : "pt-BR";
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const deviceScheme = useDeviceScheme();
  const { setColorScheme } = useNativeWindScheme();
  const [ready, setReady] = useState(false);
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [localeChoice, setLocaleState] = useState<LocaleChoice>("system");

  useEffect(() => {
    Promise.all([readValue("theme"), readValue("locale")]).then(([storedTheme, storedLocale]) => {
      if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") setThemeState(storedTheme);
      if (storedLocale === "pt-BR" || storedLocale === "en" || storedLocale === "system") setLocaleState(storedLocale);
      setReady(true);
    });
  }, []);

  useEffect(() => {
    setColorScheme(theme);
  }, [setColorScheme, theme]);

  const locale = localeChoice === "system" ? deviceLocale() : localeChoice;
  const value = useMemo<Preferences>(
    () => ({
      ready,
      theme,
      localeChoice,
      locale,
      setTheme: (next) => {
        setThemeState(next);
        void writeValue("theme", next);
      },
      setLocaleChoice: (next) => {
        setLocaleState(next);
        void writeValue("locale", next);
      },
      t: (key) => messages[locale][key],
    }),
    [locale, localeChoice, ready, theme],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences() {
  const value = useContext(PreferencesContext);
  if (!value) throw new Error("Preferências fora do provider.");
  return value;
}

export function useResolvedScheme(): "light" | "dark" {
  const device = useDeviceScheme();
  const { theme } = usePreferences();
  if (theme === "system") return device === "dark" ? "dark" : "light";
  return theme;
}
