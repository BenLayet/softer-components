import type { EventForwarders } from "@softer-components/types";

import type { Contract } from "./item-row.component.contract";

export const eventForwarders = {
  internal: [
    {
      from: "decrementRequested",
      to: "removeItemRequested",
      onCondition: ({ values }) => values.isQuantityZero(),
    },
    {
      from: "incrementRequested",
      to: "itemChanged",
    },
    { from: "decrementRequested", to: "itemChanged" },
  ],
} satisfies EventForwarders<Contract>;
