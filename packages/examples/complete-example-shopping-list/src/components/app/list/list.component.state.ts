import { ListId } from "../../../model";

export type Error = "SAVE_FAILED";
export type ErrorMessage = string;
export type State = {
  id: ListId;
  name: string;
  nextItemName: string;
  isSaving: boolean;
  errors: { [key in Error]?: {} };
};
