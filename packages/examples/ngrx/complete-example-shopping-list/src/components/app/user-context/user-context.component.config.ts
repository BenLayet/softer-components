import type { ComponentDefConfig } from "@softer-components/types";
import type { Contract } from "./user-context.component.contract";
import { effects } from "./user-context.component.effects";
import type { Dependencies } from "./user-context.component.dependencies";

export const config = (dependencies: Dependencies): ComponentDefConfig<Contract> => ({
  effects: effects(dependencies),
});
