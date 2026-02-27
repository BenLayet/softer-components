import { ExtractComponentValuesContract } from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

import { initialState } from "./user-context.component.state";

export const selectors = createBaseSelectors(initialState);
export type Values = ExtractComponentValuesContract<typeof selectors>;
