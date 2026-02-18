import { ExtractComponentValuesContract } from "@softer-components/types";

import { Events } from "./create-list.component.events";
import { selectors } from "./create-list.component.selectors";

export type Contract = {
  values: ExtractComponentValuesContract<typeof selectors>;
  events: Events;
  children: {};
};
