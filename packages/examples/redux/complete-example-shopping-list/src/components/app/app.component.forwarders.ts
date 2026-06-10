import type { ChildrenEventForwarders } from "@softer-components/types";

import type { Contract } from "./app.component.contract";

export const childrenConfig: ChildrenEventForwarders<Contract> = {
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
