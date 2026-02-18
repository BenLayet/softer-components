import { EventsContract } from "@softer-components/types";

export type eventNames =
  | "authenticated"
  | "signOutRequested"
  | "signOutSucceeded"
  | "signInRequested";
export type AppEvents = EventsContract<
  eventNames,
  { authenticated: { username: string } }
>;
