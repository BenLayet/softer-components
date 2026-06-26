import type { Children } from "./list.component.children";
import type { Events } from "./list.component.events";
import type { Values } from "./list.component.selectors";

export type Contract = {
  values: Values;
  events: Events;
  children: Children;
};
