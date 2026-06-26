import type { ComponentDefConfig } from "@softer-components/types";

import { itemRowDef } from "./item-row/item-row.component";
import type { Contract } from "./list.component.contract";
import { effects } from "./list.component.effects";
import type { Dependencies } from "./list.component.dependencies";

export const config = ({ services }: Dependencies): ComponentDefConfig<Contract> => ({
  effects: effects(services),
  childrenDefs: {
    itemRows: itemRowDef,
  },
});
