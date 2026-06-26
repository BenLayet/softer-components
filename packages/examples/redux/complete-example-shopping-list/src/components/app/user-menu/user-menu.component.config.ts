import type { ComponentDefConfig } from "@softer-components/types";

import type { Contract } from "./user-menu.component.contract";
import type { ContextsDef, Dependencies } from "./user-menu.component.dependencies";

export const config = ({
  contextsPath,
}: Dependencies): ComponentDefConfig<Contract, ContextsDef> => ({
  contextsPath,
});
