import {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { Children } from "./list-manager.component.children";

export const selectors = {
  listCount: (_, children) => children.lists.values.listCount(),
  hasAnyList: (_, children) => children.lists.values.listCount() > 0,
} satisfies Selectors<undefined, Children>;
export type Values = ExtractComponentValuesContract<typeof selectors>;
