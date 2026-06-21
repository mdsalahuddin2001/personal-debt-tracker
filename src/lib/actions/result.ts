export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export function fail(error: string): ActionResult {
  return { success: false, error };
}

export const ok: ActionResult = { success: true };
