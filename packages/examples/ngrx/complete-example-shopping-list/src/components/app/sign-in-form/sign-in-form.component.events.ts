import { EventsContract } from "@softer-components/types";

import { AppError } from "../../../model/errors";

export const uiEvents = [
  "usernameChanged",
  "passwordChanged",
  "signInFormSubmitted",
  "signInCancelled",
  "demoUserClicked",
] as const;
export const allEvents = [
  ...uiEvents,
  "signInFailed",
  "signInSucceeded",
] as const;
export type Events = EventsContract<
  typeof allEvents,
  {
    usernameChanged: string;
    passwordChanged: string;
    signInFailed: AppError;
    signInSucceeded: { username: string };
    demoUserClicked: { username: string; password: string };
  },
  typeof uiEvents
>;
