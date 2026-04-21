// Initial state definition
type Page = "LIST_MANAGER" | "SIGN_IN_FORM" | "LIST";
export const initialState = {
  page: "LIST_MANAGER" as Page,
};
export type State = typeof initialState;
