import type { ExtractComponentValuesContract } from "@softer-components/types";

import type { Events } from "./create-list.component.events";
import type { selectors } from "./create-list.component.selectors";

export type Contract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: Events;
};
