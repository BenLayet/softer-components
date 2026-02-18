import { AppEvents } from "./user-menu.component.events";
import { Context, Values } from "./user-menu.component.selectors";

export type Contract = {
  events: AppEvents;
  children: {};
  values: Values;
  context: Context;
};
