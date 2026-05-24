import { Children } from "./list.component.children";
import { Events } from "./list.component.events";
import { Values } from "./list.component.selectors";

export type Contract = {
  values: Values;
  events: Events;
  children: Children;
};
