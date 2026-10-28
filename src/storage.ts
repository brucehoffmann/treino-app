import * as SecureStore from "expo-secure-store";

const prefix = "treino.";

export async function readValue(key: string) {
  return SecureStore.getItemAsync(`${prefix}${key}`);
}

export async function writeValue(key: string, value: string | null) {
  const stored = `${prefix}${key}`;
  if (value === null) {
    await SecureStore.deleteItemAsync(stored);
    return;
  }
  await SecureStore.setItemAsync(stored, value);
}
