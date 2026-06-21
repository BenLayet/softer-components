import type { ComponentDefConfig } from "@softer-components/types";

import type { Contract } from "./create-list.component.contract";
import { effects } from "./create-list.component.effects";
import type { Dependencies } from "./create-list.component.dependencies";

export const config = ({ services }: Dependencies): ComponentDefConfig<Contract> => ({
  effects: effects(services),
});
