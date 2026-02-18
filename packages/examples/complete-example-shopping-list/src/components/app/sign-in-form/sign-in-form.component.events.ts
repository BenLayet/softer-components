import { EventsContract } from "@softer-components/types";

import { AppError } from "../../../model/errors";

export type EventNames =
  | "signInCancelled"
  | "usernameChanged"
  | "passwordChanged"
  | "demoUserClicked"
  | "signInFormSubmitted"
  | "signInFailed";

export type Events = EventsContract<
  EventNames,
  {
    usernameChanged: string;
    passwordChanged: string;
    signInFailed: AppError;
    signInSucceeded: { username: string };
    demoUserClicked: { username: string; password: string };
  }
>;
export const uiEvents: EventNames[] = [
  "usernameChanged",
  "passwordChanged",
  "signInFormSubmitted",
  "signInCancelled",
  "demoUserClicked",
];
