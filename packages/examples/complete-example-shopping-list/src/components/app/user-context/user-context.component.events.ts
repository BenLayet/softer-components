import { EventsContract } from "@softer-components/types";

import { AppError } from "../../../model/errors";

export type EventName =
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
export const uiEvents = [
  "signInRequested",
  "signOutRequested",
] as const satisfies EventName[];
export type Events = EventsContract<
  EventName,
  {
    signInFailed: AppError;
    signInRequested: { username: string; password: string };
    signInSucceeded: { username: string };
    authenticated: { username: string };
  },
  typeof uiEvents
>;
