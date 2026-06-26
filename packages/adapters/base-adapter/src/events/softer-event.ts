import { EventDef } from "@softer-components/types";

import { StatePath } from "../state/state-path";

export const INPUTTED_BY_USER = "🖱️" as const;
export const FORWARDED_INTERNALLY = "➡️" as const;
export const FORWARDED_FROM_CHILD_TO_PARENT = "⬆️" as const;
export const FORWARDED_FROM_PARENT_TO_CHILD = "⬇️" as const;
export const FORWARDED_TO_CONTEXT = "↖️" as const;
export const FORWARDED_FROM_CONTEXT = "↘️" as const;
export const DISPATCHED_BY_EFFECT = "⏳" as const;

export type SofterEventSource =
  | typeof INPUTTED_BY_USER
  | typeof FORWARDED_INTERNALLY
  | typeof FORWARDED_FROM_CHILD_TO_PARENT
  | typeof FORWARDED_FROM_PARENT_TO_CHILD
  | typeof FORWARDED_TO_CONTEXT
  | typeof FORWARDED_FROM_CONTEXT
  | typeof DISPATCHED_BY_EFFECT;

export type SofterEvent<TEvent extends EventDef = EventDef> = TEvent & {
  statePath: StatePath;
  source: SofterEventSource;
};
