export const initialState = {
  listName: "",
  existingListNames: [] as string[],
  shouldShowErrors: false,
  isSaving: false,
  hasSaveFailed: false,
};
export type State = typeof initialState;
