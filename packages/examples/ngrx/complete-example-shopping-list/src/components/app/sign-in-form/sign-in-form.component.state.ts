import { AppError } from "../../../model/errors";

export const initialState = {
  username: "",
  password: "",
  errors: [] as AppError[],
};
export type State = typeof initialState;
