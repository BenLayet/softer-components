import { createBaseSelectors } from "@softer-components/base-adapter";
import { ExtractComponentValuesContract } from "@softer-components/types";

import { initialState } from "./user-context.component.state";

export const selectors = createBaseSelectors(initialState);
export type Values = ExtractComponentValuesContract<typeof selectors>;
