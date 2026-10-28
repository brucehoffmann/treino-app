export function optionalInt(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

export function optionalDecimal(value: string) {
  const trimmed = value.trim().replace(",", ".");
  if (!trimmed) return undefined;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) return null;
  return Number(trimmed);
}
