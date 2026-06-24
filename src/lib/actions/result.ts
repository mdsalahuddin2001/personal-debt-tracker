export type ActionResult =
  | { success: true }
  | { success: false; error: string };

export function fail(error: string): ActionResult {
  return { success: false, error };
}

export const ok: ActionResult = { success: true };

/** Like ActionResult, but carries a payload on success. */
export type DataResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export function okData<T>(data: T): DataResult<T> {
  return { success: true, data };
}

export function failData<T>(error: string): DataResult<T> {
  return { success: false, error };
}
