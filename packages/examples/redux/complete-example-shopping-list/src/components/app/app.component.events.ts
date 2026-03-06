import { EventsContract } from "@softer-components/types";

import { List } from "../../model";

export type EventName =
  | "displayed"
  | "listSelected"
  | "selectListRequested"
  | "signInRequested"
  | "resetRequested";
export const uiEvents = ["displayed"] as const satisfies EventName[];
export type Events = EventsContract<
  EventName,
  { listSelected: List; authenticated: { username: string } },
  typeof uiEvents
>;
