import type { ExtractComponentValuesContract } from "@softer-components/types";

import type { Events } from "./sign-in-form.component.events";
import type { selectors } from "./sign-in-form.component.selectors";

export type Contract = {
  events: Events;
  values: ExtractComponentValuesContract<typeof selectors>;
};
