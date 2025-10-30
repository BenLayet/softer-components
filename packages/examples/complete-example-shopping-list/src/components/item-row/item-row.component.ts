import { ComponentDef } from "@softer-components/types";
import { Item } from "../../model/Item.ts";

// Initial state definition
const initialState = {
  item: { id: "", name: "-" } as Item,
};

// Events type declaration
type ItemRowEvents = {
  itemRowClicked: { payload: undefined };
  removeItemRequested: { payload: Item };
};

// Component definition
export const itemRowDef: ComponentDef<typeof initialState, ItemRowEvents> = {
  initialState,
  selectors: {
    name: state => state.item.name,
  },
  events: {
    itemRowClicked: {
      forwarders: [
        {
          to: "removeItemRequested",
          withPayload: state => state.item,
        },
      ],
    },
    removeItemRequested: {},
  },
};
