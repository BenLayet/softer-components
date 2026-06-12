import type {
  ChildrenEventForwarders,
  ComponentDef,
  InternalEventForwarders,
} from "@softer-components/types";

import type { Contract } from "./list-manager.component.contract";

const internalEventForwarders: InternalEventForwarders<Contract> = [
  {
    from: "emptyListCreated",
    to: "listSelected",
  },
];
const childrenEventForwarders: ChildrenEventForwarders<Contract> = {
  lists: {
    listeners: [
      { from: "listSelected", to: "listSelected" },
      { from: "listNamesChanged", to: "listNamesChanged" },
    ],
    commands: [
      {
        from: "emptyListCreated",
        to: "emptyListCreated",
      },
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

export const eventForwarders = {
  internal: internalEventForwarders,
  children: childrenEventForwarders,
} satisfies NonNullable<ComponentDef<Contract>["eventForwarders"]>;
