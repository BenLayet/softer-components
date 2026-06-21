import type { ComponentDefConfig } from "@softer-components/types";

import { effects } from "./lists.component.effects";
import type { ContextsDef, Dependencies } from "./lists.component.dependencies";
import type { Contract } from "./lists.component.contract";

export const config = ({
  services,
  contextsPath,
}: Dependencies): ComponentDefConfig<Contract, ContextsDef> => ({
  effects: effects(services),
  contextsPath,
});
