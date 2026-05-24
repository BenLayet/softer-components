import type { ExtractComponentValuesContract } from "@softer-components/types";

import type { UserContextContract } from "../user-context/user-context.component";
import type { Events } from "./sign-in-form.component.events";
import type { selectors } from "./sign-in-form.component.selectors";

export type Contract = {
  events: Events;
  context: { userContext: UserContextContract };
  values: ExtractComponentValuesContract<typeof selectors>;
};
