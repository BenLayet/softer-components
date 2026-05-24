import type { InternalEventForwarders } from "@softer-components/types";

import type { Contract } from "./create-list.component.contract";

export const eventForwarders: InternalEventForwarders<Contract> = [
  {
    from: "createNewListSubmitted",
    to: "createNewListRequested",
    onCondition: ({ values }) => values.isListNameValid(),
    withPayload: ({ values }) => values.listName(),
  },
];
