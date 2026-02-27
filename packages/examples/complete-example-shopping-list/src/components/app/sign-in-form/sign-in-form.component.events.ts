import { EventsContract } from "@softer-components/types";

import { AppError } from "../../../model/errors";

export type EventName =
  | "signInCancelled"
  | "usernameChanged"
  | "passwordChanged"
  | "demoUserClicked"
  | "signInFormSubmitted"
  | "signInFailed";

export const uiEvents = [
  "usernameChanged",
  "passwordChanged",
  "signInFormSubmitted",
  "signInCancelled",
  "demoUserClicked",
] as const satisfies EventName[];

export type Events = EventsContract<
  EventName,
  {
    usernameChanged: string;
    passwordChanged: string;
    signInFailed: AppError;
    signInSucceeded: { username: string };
    demoUserClicked: { username: string; password: string };
  },
  typeof uiEvents
>;
