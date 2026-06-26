import type { EventsContract } from "@softer-components/types";

import type { List } from "../../model";

export const uiEvents = ["displayed"] as const;
export const allEvents = [
  ...uiEvents,
  "listSelected",
  "showAllListsRequested",
  "goToSignInFormRequested",
  "resetRequested",
] as const;
export type Events = EventsContract<
  typeof allEvents,
  { listSelected: List; authenticated: { username: string } },
  typeof uiEvents
>;
