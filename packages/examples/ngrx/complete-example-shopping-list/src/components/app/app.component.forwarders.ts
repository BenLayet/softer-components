import type { ChildrenEventForwarders, ComponentDef } from "@softer-components/types";

import type { Contract } from "./app.component.contract";

const childrenEventForwarders: ChildrenEventForwarders<Contract> = {
  listManager: {
    listeners: [
      {
        from: "listSelected",
        to: "listSelected",
      },
    ],
  },
  list: {
    commands: [
      {
        from: "listSelected",
        to: "initialize",
      },
    ],
    listeners: [{ from: "goBackClicked", to: "showAllListsRequested" }],
  },
  userMenu: {
    listeners: [
      {
        from: "goToSignInFormRequested",
        to: "goToSignInFormRequested",
      },
    ],
  },
  userContext: {
    commands: [
      {
        from: "displayed",
        to: "userRequired",
      },
    ],
    listeners: [{ from: "userChanged", to: "resetRequested" }],
  },
};

export const eventForwarders = {
  children: childrenEventForwarders,
} satisfies NonNullable<ComponentDef<Contract>["eventForwarders"]>;
