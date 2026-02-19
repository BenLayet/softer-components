import {
  ChildrenConfig,
  InternalEventForwarders,
} from "@softer-components/types";

import { Contract } from "./list.component.contract";

export const eventForwarders: InternalEventForwarders<Contract> = [
  {
    from: "newItemSubmitted",
    to: "createItemOrIncrementQuantityRequested",
    withPayload: ({ values }) => values.nextItemSanitizedName(),
    onCondition: ({ values }) => values.isNextItemNameValid(),
  },
  {
    from: "createItemOrIncrementQuantityRequested",
    to: "createItemRequested",
    onCondition: ({ childrenValues: { itemRows }, payload: itemName }) =>
      Object.values(itemRows).every(
        itemRow => itemRow.values.name() !== itemName,
      ),
    withPayload: ({ payload: name, childrenValues: { itemRows } }) => ({
      item: {
        name,
        id:
          Object.keys(itemRows)
            .map(Number)
            .reduce((maxId, id) => (id > maxId ? id : maxId), -1) + 1,
      },
      quantity: 1,
    }),
  },
  {
    from: "createItemOrIncrementQuantityRequested",
    to: "incrementItemQuantityRequested",
    onCondition: ({ childrenValues: { itemRows }, payload: itemName }) =>
      Object.values(itemRows).some(
        itemRow => itemRow.values.name() === itemName,
      ),
    withPayload: ({ childrenValues: { itemRows }, payload: itemName }) =>
      Object.entries(itemRows)
        .filter(([, item]) => item.values.name() === itemName)
        .map(([key]) => key)
        .map(Number)[0],
  },
  {
    from: "createItemOrIncrementQuantityRequested",
    to: "resetNextItemNameRequested",
  },
  {
    from: "createItemRequested",
    to: "saveRequested",
  },
  {
    from: "removeItemRequested",
    to: "saveRequested",
  },
];
export const childrenConfig: ChildrenConfig<Contract> = {
  itemRows: {
    commands: [
      {
        from: "incrementItemQuantityRequested",
        to: "incrementRequested",
        toKeys: ({ payload: id }) => [`${id}`],
      },
      {
        from: "createItemRequested",
        to: "initialize",
        toKeys: ({
          payload: {
            item: { id },
          },
        }) => [`${id}`],
      },
      {
        from: "initialize",
        to: "initialize",
        withPayload: ({ childKey, payload: { listItems } }) =>
          listItems.find(
            i => i.item.id === parseInt(childKey),
          ) as import("../../../model").ListItem,
      },
    ],
    listeners: [
      {
        from: "removeItemRequested",
        to: "removeItemRequested",
        withPayload: ({ childKey }) => parseInt(childKey),
      },
      {
        from: "itemChanged",
        to: "saveRequested",
      },
    ],
  },
};
