import type { Children } from "./app.component.children";
import type { Events } from "./app.component.events";
import type { Values } from "./app.component.selectors";

export type Contract = {
  events: Events;
  children: Children;
  values: Values;
};
