import { InternalEventForwarders } from "@softer-components/types";

import { Contract } from "./item-row.component.contract";

export const eventForwarders: InternalEventForwarders<Contract> = [
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
];
