/**
 * Softer Components - A TypeScript component types library
 * 
 * State-manager-agnostic and reusable component definitions with full type safety.
 * Zero runtime dependencies, maximum composability.
 */

// Core types and utilities
export {
  Event,
  EventCreator,
  Reducer,
  Selector,
  EventChain,
  EventHandling,
  EventMiddleware,
  ComponentDef,
  ComponentState,
  ComponentEvent,
  ComponentSelectors,
  EventCreators,
  createEventChain,
  createEventCreators,
  composeReducers,
  createMemoizedSelector,
} from './types';

// Redux adapter
export {
  ReduxAction,
  ReduxStore,
  ReduxAdapterConfig,
  EventChainAction,
  EnhancedReduxStore,
  isEventChainAction,
  createReduxReducer,
  createReduxSelectors,
  createEventChainActionCreator,
  enhanceStoreWithComponents,
  createComponentLoggingMiddleware,
  createEventValidationMiddleware,
} from './reduxAdapter';

// Example counter component
export {
  CounterState,
  CounterEventMap,
  CounterEvent,
  CounterComponentDef,
  CounterSelectors,
  CounterEventCreators,
  initialCounterState,
  counterEvents,
  counterReducer,
  counterSelectors,
  counterComponent,
  counterEventChains,
  counterUtils,
} from './exampleCounter';