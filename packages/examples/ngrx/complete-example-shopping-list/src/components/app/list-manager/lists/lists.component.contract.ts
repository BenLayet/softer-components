import { UserContextContract } from "../../user-context";
import { Events } from "./lists.component.events";
import { Values } from "./lists.component.selectors";

export type Contract = {
  values: Values;
  events: Events;
  context: {
    userContext: UserContextContract;
  };
};
