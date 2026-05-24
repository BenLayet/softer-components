import type { AppEvents } from "./user-menu.component.events";
import type { Context, Values } from "./user-menu.component.selectors";

export type Contract = {
  events: AppEvents;
  values: Values;
  context: Context;
};
