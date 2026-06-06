import { componentDef } from "./user-context.component.config";
import type { Contract } from "./user-context.component.contract";
import type { StatePathString } from "@softer-components/types";

// Exporting the component definition as a function to allow dependencies injection
export const userContextDef = componentDef;
export type UserContextContract = Contract;
export const userContextSymbol = Symbol("userContext");
export type UserContextPath = { [userContextSymbol]: StatePathString<UserContextContract> };
export type UserContextDef = { [userContextSymbol]: UserContextContract };
