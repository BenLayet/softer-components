import { Events } from "./item-row.component.events";
import { Values } from "./item-row.component.selectors";

export type Contract = {
  events: Events;
  children: {};
  values: Values;
};
