import { Children } from "./app.component.children";
import { Events } from "./app.component.events";
import { Values } from "./app.component.selectors";

export type Contract = {
  events: Events;
  children: Children;
  values: Values;
};
