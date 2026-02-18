import { ExtractComponentValuesContract } from "@softer-components/types";

import { UserContextContract } from "../user-context";
import { Events } from "./sign-in-form.component.events";
import { selectors } from "./sign-in-form.component.selectors";

export type Contract = {
  events: Events;
  children: {};
  context: { userContext: UserContextContract };
  values: ExtractComponentValuesContract<typeof selectors>;
};
