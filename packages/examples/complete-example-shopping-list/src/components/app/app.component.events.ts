import { EventsContract } from "@softer-components/types";

import { List } from "../../model";

export type EventNames =
  | "displayed"
  | "listSelected"
  | "selectListRequested"
  | "signInRequested"
  | "resetRequested";
export type Events = EventsContract<
  EventNames,
  { listSelected: List; authenticated: { username: string } }
>;
export const uiEvents: EventNames[] = ["displayed"];
