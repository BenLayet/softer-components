import { componentDef } from "./app.component.config";
import { Contract } from "./app.component.contract";

// Exporting the component definition as a function to allow dependencies injection
export const appDef = componentDef;
export type AppContract = Contract;
