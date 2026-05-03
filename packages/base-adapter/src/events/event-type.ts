import { statePathToString, stringToStatePath } from "../state/state-path";
import { assertIsNotUndefined } from "../utilities/assert.functions";
import {
  type SofterEvent,
  type Source,
  UNKNOWN_EVENT_SOURCE,
} from "./softer-event";

const PART_SEPARATOR = "|";
const PREFIX_INDEX = 0;
const SOURCE_INDEX = 1;
const STATE_PATH_INDEX = 2;
const EVENT_NAME_INDEX = 3;
const PARTS_COUNT = 4;

export function toEventTypeString(event: SofterEvent, prefix: string): string {
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
): Omit<SofterEvent, "payload"> {
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
