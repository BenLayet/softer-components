import type { ComponentDefConfig } from "@softer-components/types";
import type { Contract } from "./sign-in-form.component.contract";
import type { ContextsDef, Dependencies } from "./sign-in-form.component.dependencies";

export const config = ({
  contextsPath,
}: Dependencies): ComponentDefConfig<Contract, ContextsDef> => ({
  contextsPath,
});
