import { Children } from "./list-manager.component.children";
import { Events } from "./list-manager.component.events";
import { Values } from "./list-manager.component.selectors";

export type Contract = {
  values: Values;
  events: Events;
  children: Children;
};
