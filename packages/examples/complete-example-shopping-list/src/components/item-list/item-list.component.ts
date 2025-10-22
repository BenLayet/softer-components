import {
    createComponentDef,
    EventForwarderDef,
    ExtractDependencyEvent
} from "@softer-components/types";
import {Item} from "../../model/Item";
import {itemDef, ItemEvents} from "../item/item.component";

// State
const initialState = {
    items: [] as Item[],
};
type ComponentState = typeof initialState;

// Selectors
const items = (state: ComponentState) => state.items;

const selectors = {
    items,
};

// Events
export type ItemListEvents =
    | { type: "addItemRequested"; payload: string }
    | { type: "removeItemRequested"; payload: string };

type ComponentEvents = ItemListEvents | { type: "itemClicked"; payload: Item };
const uiEventTypes = ["itemClicked" as const];

// State Updaters
const addItemRequested = (state: ComponentState, payload: string) => ({
    ...state,
    items: [...state.items, {id: Date.now().toString(), name: payload}],
});
const removeItemRequested = (state: ComponentState, payload: string) => ({
    ...state,
    items: state.items.filter(item => item.id !== payload),
});
const stateUpdaters = {
    addItemRequested,
    removeItemRequested,
};

type ChildrenEvents = {
    items: ItemEvents
};

// Event Forwarders
const eventForwarders: EventForwarderDef<ComponentState, ExtractDependencyEvent<ChildrenEvents>, ComponentEvents>[] = [
    {onEvent: "items/removeItemRequested", thenDispatch: () => "removeItemRequested"},
];

// Component Definition
export const itemListDef = createComponentDef<ChildrenEvents, ComponentEvents, ComponentState>({
    initialState,
    stateUpdaters,
    uiEventTypes,
    selectors,
    eventForwarders,
    children: {
        items: {
            ...itemDef,
            isCollection: true,
            count: (state) => state.items.length,
            childKey: (state, index) => state.items[index]["id"],
            initialStateFactory: (state, id) => state.items.find(i => i.id == id)
        }
    },
});
