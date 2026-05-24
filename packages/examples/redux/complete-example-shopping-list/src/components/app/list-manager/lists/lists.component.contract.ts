import type { UserContextContract } from "../../user-context/user-context.component";
import type { Events } from "./lists.component.events";
import type { Values } from "./lists.component.selectors";

export type Contract = {
  values: Values;
  events: Events;
  context: {
    userContext: UserContextContract;
  };
};
