import { componentDef } from "./item-row.component.config";
import { Contract } from "./item-row.component.contract";

// Exporting the component definition as a function to allow dependencies injection
export const itemRowDef = componentDef;
export type ItemRowContract = Contract;
