import { componentDef } from "./item-row.component.config";
import { Contract } from "./item-row.component.contract";
import { View } from "./item-row.component.view";

// Exporting the component definition as a function to allow dependencies injection
export const itemRowDef = componentDef;
export type ItemRowContract = Contract;
export const ItemRow = View;
