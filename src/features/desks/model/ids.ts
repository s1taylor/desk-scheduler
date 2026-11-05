const RANDOM_SUFFIX_LENGTH = 8;

/** Unique id for a new booking. `crypto.randomUUID` is missing outside secure contexts, e.g. plain-http LAN URLs. */
export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  const suffix = Math.random()
    .toString(36)
    .slice(2, 2 + RANDOM_SUFFIX_LENGTH);
  return `${Date.now().toString(36)}-${suffix}`;
}
