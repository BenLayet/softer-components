import { Events } from "./user-context.component.events";
import { Values } from "./user-context.component.selectors";

export type Contract = {
  events: Events;
  values: Values;
};
