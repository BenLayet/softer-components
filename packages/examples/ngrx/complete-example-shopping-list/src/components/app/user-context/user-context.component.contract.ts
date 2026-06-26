import type { Events } from "./user-context.component.events";
import type { Values } from "./user-context.component.selectors";

export type Contract = {
  events: Events;
  values: Values;
};
