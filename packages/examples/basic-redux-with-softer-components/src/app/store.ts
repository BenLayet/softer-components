import { combineSlices, configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import { amountSlice } from "../features/amount/amountSlice";
import { counterSlice } from "../features/counter/counterSlice";

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(counterSlice, amountSlice);
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// Create the middleware instance and methods
const listenerMiddleware = createListenerMiddleware();

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
    });
    return store;
}

export const store = makeStore();

// Infer the type of `store`
export type AppStore = typeof store
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore["dispatch"];