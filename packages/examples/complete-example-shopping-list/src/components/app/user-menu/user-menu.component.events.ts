import { EventsContract } from "@softer-components/types";

export type EventName =
  | "authenticated"
  | "signOutRequested"
  | "signOutSucceeded"
  | "signInRequested";

export const uiEvents = [
  "signOutRequested",
  "signInRequested",
] as const satisfies EventName[];

export type AppEvents = EventsContract<
  EventName,
  { authenticated: { username: string } },
  typeof uiEvents
>;
