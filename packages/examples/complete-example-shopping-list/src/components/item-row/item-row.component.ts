import { ComponentDef, ExtractUiContract } from "@softer-components/types";
import { Item } from "../../model/Item.ts";
// Initial state definition
type ItemRowState = { item?: Item };

// Events type declaration
type ItemRowEvents = {
  addItemRequested: { payload: Item };
  itemRowClicked: { payload: undefined };
  removeItemRequested: { payload: Item };
};

const selectors = {
  name: (state: ItemRowState) => state.item?.name,
  quantity: (state: ItemRowState) => state.item?.quantity,
};

// Component definition
export const itemRowDef = {
  initialState,
  selectors,
  events: {
    addItemRequested: {
      payloadFactory: (item: Item) => item,
    },
    itemRowClicked: {
      payloadFactory: () => undefined,
    },
    removeItemRequested: {
      payloadFactory: (item: Item) => item,
    },
  },
  stateUpdaters: {
    addItemRequested: (state, item: Item) => ({
      ...state,
      item: item,
    }),
  },
  eventForwarders: [
    {
      from: "itemRowClicked",
      to: "removeItemRequested",
      withPayload: (state: ItemRowState) => state.item,
    },
  ],
} satisfies ComponentDef<ItemRowState, ItemRowEvents, Item>;

export type ItemRowUi = ExtractUiContract<typeof itemRowDef>;
