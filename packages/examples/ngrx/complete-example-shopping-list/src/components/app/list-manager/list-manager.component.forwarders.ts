import type { EventForwarders } from "@softer-components/types";

import type { Contract } from "./list-manager.component.contract";

export const eventForwarders = {
  internal: [
    {
      from: "emptyListCreated",
      to: "listSelected",
    },
  ],
  children: {
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
  },
} satisfies EventForwarders<Contract>;
