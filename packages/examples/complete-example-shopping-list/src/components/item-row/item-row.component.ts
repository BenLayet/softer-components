import { componentDefBuilder } from "@softer-components/types";
import { Item } from "../../model/Item.ts";

export const itemRowDef = componentDefBuilder
  .initialState({ item: { id: "", name: "-" } }) // TODO tolerate empty initial state for children
  .selectors({
    name: state => state.item.name,
  })
  .events<{ itemRowClicked: undefined; removeItemRequested: Item }>({
    itemRowClicked: {
      forwarders: [
        {
          to: "removeItemRequested",
          withPayload: state => state.item,
        },
      ],
    },
    removeItemRequested: {},
  })
  .build();
