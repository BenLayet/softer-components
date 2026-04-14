import { EventsContract } from "@softer-components/types";

import { AppError } from "../../../model/errors";

export const uiEvents = ["signInRequested", "signOutRequested"] as const;
export const allEvents = [
  ...uiEvents,
  "signInSucceeded",
  "signOutSucceeded",
  "signInFailed",
  "authenticated",
  "unAuthenticated",
  "userChanged",
  "userRequired",
  "loadUserRequested",
] as const;
export type Events = EventsContract<
  typeof allEvents,
  {
    signInFailed: AppError;
    signInRequested: { username: string; password: string };
    signInSucceeded: { username: string };
    authenticated: { username: string };
  },
  typeof uiEvents
>;
