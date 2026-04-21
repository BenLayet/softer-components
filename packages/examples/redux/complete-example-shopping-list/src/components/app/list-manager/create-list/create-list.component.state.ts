export const initialState = {
  listName: "",
  existingListNames: [] as string[],
  shouldShowErrors: false,
  isSaving: false,
  hasSaveFailedError: false,
};
export type State = typeof initialState;
