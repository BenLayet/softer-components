import { createComponentDef, EventForwarderDef} from "@softer-components/types";

// State
const initialState = {
  itemName: "",
};
type ComponentState = typeof initialState;

// Selectors
const itemName = (state: ComponentState) => state.itemName;

const selectors = {
  itemName,
};

export type NewItemFormEvents =
  | { type: "newItemSubmitted"; payload: string };

// Events
type ComponentEvents =
  | { type: "itemNameChanged"; payload: string }
  | { type: "formSubmitted"; payload: void }
  | NewItemFormEvents;
const uiEventTypes = ["itemNameChanged" as const, "formSubmitted" as const];

// State Updaters
const itemNameChanged = (state: ComponentState, payload: string) => ({
  ...state,
  itemName: payload,
});
const newItemSubmitted = (state: ComponentState) => ({
  ...state,
  itemName: "",
});
const stateUpdaters = {
  itemNameChanged,
  newItemSubmitted,
};

// Event Forwarders
const eventForwarders: EventForwarderDef<ComponentState, ComponentEvents>[] = [
  {
    onEvent: "formSubmitted",
    thenDispatch: () => "newItemSubmitted",
    withPayload: (state: ComponentState) => state.itemName,
  },
];
  

// Component Definition
export const newItemFormDef= createComponentDef<{},  ComponentEvents, ComponentState>({
  initialState,
  stateUpdaters,
  uiEventTypes,
  selectors,
  eventForwarders
});
