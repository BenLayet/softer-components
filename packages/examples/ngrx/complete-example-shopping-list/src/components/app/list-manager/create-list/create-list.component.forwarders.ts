import type { EventForwarders } from "@softer-components/types";

import type { Contract } from "./create-list.component.contract";

export const eventForwarders = {
  internal: [
    {
      from: "createNewListSubmitted",
      to: "createNewListRequested",
      onCondition: ({ values }) => values.isListNameValid(),
      withPayload: ({ values }) => values.listName(),
    },
  ],
} satisfies EventForwarders<Contract>;
