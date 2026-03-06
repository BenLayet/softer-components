import {
  ChildrenConfig,
  InternalEventForwarders,
} from "@softer-components/types";

import { Contract } from "./list-manager.component.contract";

export const eventForwarders: InternalEventForwarders<Contract> = [
  {
    from: "emptyListCreated",
    to: "listSelected",
  },
];
export const childrenConfig: ChildrenConfig<Contract> = {
  lists: {
    listeners: [
      { from: "listSelected", to: "listSelected" },
      { from: "listNamesChanged", to: "listNamesChanged" },
    ],
  },
  createList: {
    commands: [
      {
        from: "listNamesChanged",
        to: "setExistingListNames",
      },
    ],
    listeners: [{ from: "createNewListSucceeded", to: "emptyListCreated" }],
  },
};
