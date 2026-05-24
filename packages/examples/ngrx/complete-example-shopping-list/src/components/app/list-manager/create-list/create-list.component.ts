import { componentDef } from "./create-list.component.config";
import { Contract } from "./create-list.component.contract";

// Exporting the component definition as a function to allow dependencies injection
export const createListDef = componentDef;
export type CreateListContract = Contract;
