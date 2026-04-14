import { Event } from "@softer-components/types";

import {
  COMPONENT_SEPARATOR,
  StatePath,
  statePathToString,
  stringToStatePath,
} from "./path";
import { assertIsNotUndefined } from "./predicate.functions";

export const INPUTTED_BY_USER = "🖱️" as const;
export const FORWARDED_INTERNALLY = "➡️" as const;
export const FORWARDED_FROM_CHILD_TO_PARENT = "⬆️" as const;
export const FORWARDED_FROM_PARENT_TO_CHILD = "⬇️" as const;
export const FORWARDED_TO_CONTEXT = "↖️" as const;
export const FORWARDED_FROM_CONTEXT = "↘️" as const;
export const DISPATCHED_BY_EFFECT = "⏳" as const;

export type Source =
  | typeof INPUTTED_BY_USER
  | typeof FORWARDED_INTERNALLY
  | typeof FORWARDED_FROM_CHILD_TO_PARENT
  | typeof FORWARDED_FROM_PARENT_TO_CHILD
  | typeof FORWARDED_TO_CONTEXT
  | typeof FORWARDED_FROM_CONTEXT
  | typeof DISPATCHED_BY_EFFECT;

export type GlobalEvent<TEvent extends Event = Event> = TEvent & {
  statePath: StatePath;
  source?: Source;
};

export function toEventTypeString(event: GlobalEvent) {
  return (
    (event.source ?? "?") +
    statePathToString(event.statePath) +
    COMPONENT_SEPARATOR +
    event.name
  );
}
export function parseEventTypeString(
  eventTypeString: string,
): Omit<GlobalEvent, "payload"> {
  const parts = eventTypeString.split(COMPONENT_SEPARATOR);
  const name = parts.pop();
  assertIsNotUndefined(name);
  const source = parts.shift() as Source | undefined;
  assertIsNotUndefined(source);
  //TODO change type Event => EventDef + GlobalEvent => Event that includes type as string
  const statePath = stringToStatePath(
    parts.map(part => `${COMPONENT_SEPARATOR}${part}`).join(""),
  );
  return { source, statePath, name };
}
