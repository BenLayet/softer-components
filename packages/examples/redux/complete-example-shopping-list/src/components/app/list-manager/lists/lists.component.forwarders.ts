import type { ContextsConfig, InternalEventForwarders } from "@softer-components/types";

import type { Contract } from "./lists.component.contract";
import { type UserContextDef, userContextSymbol } from "../../user-context/user-context.component";

export const eventForwarders: InternalEventForwarders<Contract> = [
  {
    from: "listClicked",
    to: "listSelected",
    withPayload: ({ payload: list, values }) => (values.isNotLoading() ? list : list),
  },
  {
    from: "deleteClicked",
    to: "deleteRequested",
    withPayload: ({ payload: { id }, values }) => (values.isNotLoading() ? id : id),
  },
  {
    from: "initializeRequested",
    to: "fetchRequested",
    onCondition: ({ values }) => values.isNotLoading(),
  },
  {
    from: "fetchSucceeded",
    to: "listNamesChanged",
    withPayload: ({ values }) => values.listNames(),
  },
  {
    from: "deleteSucceeded",
    to: "listNamesChanged",
    withPayload: ({ values }) => values.listNames(),
  },
];
export const contextsConfig: ContextsConfig<Contract, UserContextDef> = {
  [userContextSymbol]: {
    listeners: [
      {
        from: "userChanged",
        to: "initializeRequested",
      },
    ],
  },
};
