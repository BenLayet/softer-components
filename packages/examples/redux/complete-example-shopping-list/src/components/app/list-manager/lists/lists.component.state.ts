import { List } from "../../../../model";

export const initialState = {
  lists: [] as List[],
  isLoading: false,
  errors: {} as { [error in "FETCH_ERROR" | "DELETE_ERROR"]?: {} },
};
export type State = typeof initialState;
