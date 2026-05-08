export const PISTON_LANGS = [
  { id: "python", label: "Python", version: "*" },
  { id: "javascript", label: "JavaScript", version: "*" },
] as const;

export type PistonLanguageId = (typeof PISTON_LANGS)[number]["id"];

/** Monaco model language id (must match Monaco built-in languages). */
export function pistonLanguageToMonaco(id: PistonLanguageId): string {
  switch (id) {
    case "python":
      return "python";
    case "javascript":
      return "javascript";
    default:
      return "typescript";
  }
}
