import type { ListId } from "../../../model";

export type Error = "SAVE_FAILED";
export type ErrorMessage = string;
export type State =
  | undefined
  | {
      id: ListId;
      name: string;
      nextItemName: string;
      isSaving: boolean;
      errors: Partial<Record<Error, string>>;
    };
