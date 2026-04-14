import { componentDef } from "./user-context.component.config";
import { Contract } from "./user-context.component.contract";

// Exporting the component definition as a function to allow dependencies injection
export const userContextDef = componentDef;
export type UserContextContract = Contract;
