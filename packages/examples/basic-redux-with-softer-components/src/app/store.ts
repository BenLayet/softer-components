import {configureSofterStore} from "@softer-components/redux-adapter";
import {counterComponentDef} from "../features/counter/counterComponent.ts";

export const store = configureSofterStore(counterComponentDef); // --- IGNORE ---import { describe, it, expect } from "vitest";