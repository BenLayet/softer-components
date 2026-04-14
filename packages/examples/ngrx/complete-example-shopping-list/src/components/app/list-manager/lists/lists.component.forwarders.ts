import {
  ContextsConfig,
  InternalEventForwarders,
} from "@softer-components/types";

import { Contract } from "./lists.component.contract";

export const eventForwarders: InternalEventForwarders<Contract> = [
  {
    from: "listClicked",
    to: "listSelected",
    withPayload: ({ payload: list, values }) =>
      values.isNotLoading() ? list : list,
  },
  {
    from: "deleteClicked",
    to: "deleteRequested",
    withPayload: ({ payload: { id }, values }) =>
      values.isNotLoading() ? id : id,
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
export const contextsConfig: ContextsConfig<Contract> = {
  userContext: {
    listeners: [
      {
        from: "userChanged",
        to: "initializeRequested",
      },
    ],
  },
};
