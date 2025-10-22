import { createComponentDef, EventForwarderDef} from "@softer-components/types";
import {Item} from "../../model/Item";

type ComponentState = Item;
// Selectors
const name = (state: ComponentState) => state.name;
const id = (state: ComponentState) => state.id;
const selectors = {name, id};

// Events
export type ItemEvents = { type: "removeItemRequested"; payload: string };
type ComponentEvents =
    | ItemEvents
    | { type: "itemClicked"; payload: string }
const uiEventTypes = ["itemClicked" as const];
// State Updaters
const itemClicked = (state: ComponentState) => ({...state});
const stateUpdaters = {itemClicked};


// Event Forwarders
const eventForwarders: EventForwarderDef<ComponentState, ComponentEvents>[] = [
    {onEvent: "itemClicked", thenDispatch: () => "removeItemRequested"},
];


// Component Definition
export const itemDef = createComponentDef({
    stateUpdaters,
    uiEventTypes,
    selectors,
    eventForwarders
});
