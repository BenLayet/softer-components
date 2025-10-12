import {
  ComponentDef,
  EventForwarder,
  ExtractEventSignatures,
  StateUpdater,
} from "@softer-components/types"
import {
  amountComponentDef,
  PublicAmountEvents,
} from "../amount/amountComponent"

// State
const initialState = {
  value: 0,
  nextAmount: 1,
}
export type CounterState = typeof initialState

// Selectors
const count = (state: CounterState) => state.value
const isEven = (state: CounterState) => state.value % 2 === 0

const selectors = {
  count,
  isEven,
}

// State Updaters
const incrementRequested: StateUpdater<CounterState> = (
  state: CounterState,
) => ({ ...state, value: state.value + 1 })
const decrementRequested: StateUpdater<CounterState> = (
  state: CounterState,
) => ({ ...state, value: state.value - 1 })
const incrementByAmountRequested: StateUpdater<CounterState> = (
  state: CounterState,
): CounterState => ({
  ...state,
  value: state.value + state.nextAmount,
})
const setNextAmountRequested: StateUpdater<CounterState, number> = (
  state: CounterState,
  amount: number,
): CounterState => ({
  ...state,
  nextAmount: amount,
})
const stateUpdaters = {
  incrementRequested,
  decrementRequested,
  incrementByAmountRequested,
  setNextAmountRequested,
}

type CounterEventPayloads = ExtractEventSignatures<typeof stateUpdaters>

//Event forwarders
type CounterDependencies = {
  amount: PublicAmountEvents
}

const eventForwarder1: EventForwarder<
  CounterState,
  CounterEventPayloads,
  CounterDependencies
> = {
  onEvent: "amount/amountUpdated",
  thenDispatch: "setNextAmountRequested",
}

const eventForwarders: EventForwarder<
  CounterState,
  CounterEventPayloads,
  CounterDependencies
>[] = [eventForwarder1]

export type CounterEvents = {
  //TODO default is { payload: void, uiEvent: false }
  incrementRequested: { payload: void; uiEvent: true }
  decrementRequested: { payload: void; uiEvent: true }
  incrementByAmountRequested: { payload: void; uiEvent: true }
  setNextAmountRequested: { payload: number; uiEvent: false }
  countDownRequested: { payload: void; uiEvent: true; effectRequired: true }
  timeUp: { payload: void; uiEvent: false }
}
type CounterPayloads = {
  [key in keyof CounterEvents]: CounterEvents[key]["payload"]
}
export type CounterEffects = {
  delayedDecrementRequested: ["decrementRequested"]
  fetchDataRequested: ["fetchDataSuccess", "fetchDataFailed"]
} // TODO declare expected effects : onEvent, dispatchEvents : [], --- effect implementation is in the adapter

// Component Definition
//TODO declare public events separately from internal events
// public events for UI actions / for Effects / for event Forwarding
export const counterComponentDef: ComponentDef<
  CounterState,
  typeof selectors,
  CounterPayloads,
  CounterDependencies
> = {
  initialState,
  // state updaters
  stateUpdaters,
  uiEvents: [
    "incrementRequested",
    "decrementRequested",
    "incrementByAmountRequested",
  ],
  selectors,
  eventForwarders, //TODO separate internal / from child/ to child / child to child
  // effects: {
  //    delayedDecrementRequested: ["decrementRequested"],
  //    fetchDataRequested: ["fetchDataSuccess", "fetchDataFailed"],
  //}, // TODO declare expected effects : onEvent, dispatchEvents : [], --- effect implementation is in the adapter
  dependencies: {
    children: {
      amount: amountComponentDef,
    },
  },
}
