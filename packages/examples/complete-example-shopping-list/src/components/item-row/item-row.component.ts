import { Item } from "../../model/Item.ts";
// Initial state definition
type ItemRowState = { item: Item };

// Events type declaration
type ItemRowEvents = {
  itemRowClicked: { payload: undefined };
};

const selectors = {
  name: (state: ItemRowState) => state.item.name,
};

// Component definition
export const itemRowDef = {
  constructor: (item: Item) => ({ item }),
  selectors,
};

export type ItemRowUi = {
  values: ExtractUiValues<typeof selectors>;
  events: ItemRowEvents;
};
