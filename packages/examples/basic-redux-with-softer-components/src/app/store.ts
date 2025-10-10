import {createListenerMiddleware, PayloadAction} from "@reduxjs/toolkit"
import {combineSlices, configureStore} from "@reduxjs/toolkit"
import {counterSlice} from "../features/counter/counterSlice"
import {amountSlice} from "../features/amount/amountSlice.ts";

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(counterSlice, amountSlice)
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>

// Create the middleware instance and methods
const listenerMiddleware = createListenerMiddleware()
//amountListenerOptions.forEach(options => listenerMiddleware.startListening(options));
//startEventChains(listenerMiddleware, amountSlice.name, amountComponentDef.chainedEvents);
// The store setup is wrapped in `makeStore` to allow reuse
// when setting up tests that need the same store config
export const makeStore = (preloadedState?: Partial<RootState>) => {
    const store = configureStore({
        reducer: rootReducer,
        preloadedState,
        // Add the listener middleware to the store.
        // NOTE: Since this can receive actions with functions inside,
        // it should go before the serializability check middleware
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware().prepend(listenerMiddleware.middleware),
    })
    return store
}

export const store = makeStore()

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"]

const startListening = listenerMiddleware.startListening.withTypes<RootState, AppDispatch>();
startListening(
    {
        predicate: (action): action is PayloadAction<number, "amount/setAmountRequested"> => {
            return action.type === "amount/setAmountRequested";
        },
        effect: (action: PayloadAction<number>, listenerApi) => {
            listenerApi.dispatch({type: "amount/amountUpdated", payload: action.payload});
        }
    });
startListening(
    {
        predicate: (action): action is PayloadAction<number, "amount/amountUpdated"> => {
            return action.type === "amount/amountUpdated";
        },
        effect: (action: PayloadAction<number>, listenerApi) => {
            listenerApi.dispatch({type: "counter/setNextAmountRequested", payload: action.payload});
        }
    });