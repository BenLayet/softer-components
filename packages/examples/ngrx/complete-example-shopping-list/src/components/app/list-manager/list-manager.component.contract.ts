import type { Children } from "./list-manager.component.children";
import type { Events } from "./list-manager.component.events";
import type { Values } from "./list-manager.component.selectors";

export type Contract = {
  values: Values;
  events: Events;
  children: Children;
};
