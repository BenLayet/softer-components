import { ChildrenConfig } from "@softer-components/types";

import { Contract } from "./app.component.contract";

export const childrenConfig: ChildrenConfig<Contract> = {
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
    listeners: [{ from: "goBackClicked", to: "selectListRequested" }],
  },
  userMenu: {
    listeners: [
      {
        from: "signInRequested",
        to: "signInRequested",
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
