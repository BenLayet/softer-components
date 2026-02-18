import { ComponentDef } from "@softer-components/types";

import { itemRowDef } from "./item-row";
import { Contract } from "./list.component.contract";
import { EffectsDependencies, effects } from "./list.component.effects";
import { uiEvents } from "./list.component.events";
import { eventForwarders } from "./list.component.forwarders";
import { selectors } from "./list.component.selectors";
import { State } from "./list.component.state";
import { childrenUpdaters, stateUpdaters } from "./list.component.updaters";

export type Dependencies = EffectsDependencies;

const componentDef = (
  dependencies: Dependencies,
): ComponentDef<Contract, State> => {
  return {
    selectors,
    uiEvents,
    stateUpdaters,
    childrenUpdaters,
    eventForwarders,
    childrenComponentDefs: {
      itemRows: itemRowDef(),
    },
    initialChildren: { itemRows: [] },
    childrenConfig: {
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
    },
    effects: effects(dependencies),
  };
};

export { componentDef };
