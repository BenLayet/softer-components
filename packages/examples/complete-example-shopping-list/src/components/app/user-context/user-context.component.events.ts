import { EventsContract } from "@softer-components/types";

import { AppError } from "../../../model/errors";

export type eventNames =
  | "signOutRequested"
  | "signOutSucceeded"
  | "signInRequested"
  | "signInSucceeded"
  | "signInFailed"
  | "authenticated"
  | "unAuthenticated"
  | "userChanged"
  | "userRequired"
  | "loadUserRequested";

export type Events = EventsContract<
  eventNames,
  {
    signInFailed: AppError;
    signInRequested: { username: string; password: string };
    signInSucceeded: { username: string };
    authenticated: { username: string };
  }
>;
