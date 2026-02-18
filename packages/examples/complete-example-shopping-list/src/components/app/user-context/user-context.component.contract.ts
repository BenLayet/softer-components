import { Events } from "./user-context.component.events";
import { Values } from "./user-context.component.selectors";

export type Contract = {
  events: Events;
  children: {};
  values: Values;
};
