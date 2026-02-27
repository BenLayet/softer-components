import { componentDef } from "./create-list.component.config";
import { Contract } from "./create-list.component.contract";
import { View } from "./create-list.component.view";

// Exporting the component definition as a function to allow dependencies injection
export const createListDef = componentDef;
export type CreateListContract = Contract;
export const CreateList = View;
