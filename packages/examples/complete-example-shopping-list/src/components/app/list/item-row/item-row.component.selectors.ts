import {
  ExtractComponentValuesContract,
  Selectors,
} from "@softer-components/types";

import { State } from "./item-row.component.state";

export const selectors = {
  listItem: (state: State) => state,
  item: (state: State) => state.item,
  id: (state: State) => state.item.id,
  name: (state: State) => state.item.name,
  quantity: (state: State) => state.quantity,
  isQuantityZero: (state: State) => state.quantity === 0,
} satisfies Selectors<State>;

export type Values = ExtractComponentValuesContract<typeof selectors>;
