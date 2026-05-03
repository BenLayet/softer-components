import { EventDef } from "@softer-components/types";

import { StatePath, statePathToString, stringToStatePath } from "./path";
import { assertIsNotUndefined } from "./predicate.functions";

export const INPUTTED_BY_USER = "🖱️" as const;
export const FORWARDED_INTERNALLY = "➡️" as const;
export const FORWARDED_FROM_CHILD_TO_PARENT = "⬆️" as const;
export const FORWARDED_FROM_PARENT_TO_CHILD = "⬇️" as const;
export const FORWARDED_TO_CONTEXT = "↖️" as const;
export const FORWARDED_FROM_CONTEXT = "↘️" as const;
export const DISPATCHED_BY_EFFECT = "⏳" as const;
export const UNKNOWN_EVENT_SOURCE = "?" as const;

export type Source =
  | typeof INPUTTED_BY_USER
  | typeof FORWARDED_INTERNALLY
  | typeof FORWARDED_FROM_CHILD_TO_PARENT
  | typeof FORWARDED_FROM_PARENT_TO_CHILD
  | typeof FORWARDED_TO_CONTEXT
  | typeof FORWARDED_FROM_CONTEXT
  | typeof DISPATCHED_BY_EFFECT
  | typeof UNKNOWN_EVENT_SOURCE;

export type GlobalEvent<TEvent extends EventDef = EventDef> = TEvent & {
  statePath: StatePath;
  source?: Source; //TODO make Source non optional
};

const PART_SEPARATOR = "|";
const PREFIX_INDEX = 0;
const SOURCE_INDEX = 1;
const STATE_PATH_INDEX = 2;
const EVENT_NAME_INDEX = 3;
const PARTS_COUNT = 4;

export function toEventTypeString(event: GlobalEvent, prefix: string): string {
  const parts: string[] = [];
  parts[PREFIX_INDEX] = prefix;
  parts[SOURCE_INDEX] = event.source ?? UNKNOWN_EVENT_SOURCE;
  parts[STATE_PATH_INDEX] = statePathToString(event.statePath);
  parts[EVENT_NAME_INDEX] = event.name;
  return parts.join(PART_SEPARATOR);
}
export function parseEventTypeString(
  eventTypeString: string,
  prefix: string,
): Omit<GlobalEvent, "payload"> {
  const parts = eventTypeString.substring(prefix.length).split(PART_SEPARATOR);
  if (parts.length !== PARTS_COUNT) {
    throw new Error(
      `${eventTypeString} could not be parsed, expecting ${PARTS_COUNT} separated by ${PART_SEPARATOR}`,
    );
  }
  const name = parts[EVENT_NAME_INDEX];
  assertIsNotUndefined(name);
  const source = parts[SOURCE_INDEX] as Source | undefined;
  assertIsNotUndefined(source);
  const statePathStr = parts[STATE_PATH_INDEX];
  assertIsNotUndefined(statePathStr);
  const statePath = stringToStatePath(statePathStr);
  return { source, statePath, name };
}
