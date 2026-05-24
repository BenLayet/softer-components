import type { List } from "../../../../model";

export const initialState = {
  lists: [] as List[],
  isLoading: false,
  errors: {} as Partial<Record<"FETCH_ERROR" | "DELETE_ERROR", {}>>,
};
export type State = typeof initialState;
