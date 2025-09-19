/**
 * Redux adapter for integrating ComponentDef with Redux.
 * This adapter enables using the generic component types with Redux
 * while maintaining type safety and supporting event chains.
 */

import {
  ComponentDef,
  Event,
  EventChain,
  EventMiddleware,
  Reducer,
  Selector,
} from './types';

/**
 * Redux-compatible action interface.
 * Extends the generic Event interface to be compatible with Redux.
 */
export interface ReduxAction<TPayload = any> extends Event<TPayload> {
  readonly type: string;
  readonly payload: TPayload;
}

/**
 * Redux store interface that matches the minimal requirements
 * for integrating with our component system.
 */
export interface ReduxStore<TState = any> {
  getState(): TState;
  dispatch(action: ReduxAction): ReduxAction;
  subscribe(listener: () => void): () => void;
}

/**
 * Configuration options for the Redux adapter.
 */
export interface ReduxAdapterConfig {
  readonly enableEventChains?: boolean;
  readonly chainActionType?: string;
  readonly middleware?: readonly EventMiddleware[];
}

/**
 * Default configuration for the Redux adapter.
 */
const DEFAULT_CONFIG: ReduxAdapterConfig = {
  enableEventChains: true,
  chainActionType: '@@COMPONENT/EVENT_CHAIN',
  middleware: [],
};

/**
 * Special Redux action type for event chains.
 */
export interface EventChainAction extends ReduxAction<EventChain> {
  readonly type: string;
  readonly payload: EventChain;
}

/**
 * Type guard to check if an action is an event chain action.
 * 
 * @param action - The action to check
 * @param chainActionType - The action type used for event chains
 */
export function isEventChainAction(
  action: ReduxAction,
  chainActionType: string = DEFAULT_CONFIG.chainActionType!
): action is EventChainAction {
  return action.type === chainActionType;
}

/**
 * Converts a ComponentDef reducer to a Redux-compatible reducer.
 * Handles both individual events and event chains.
 * 
 * @param componentDef - The component definition to adapt
 * @param config - Configuration options for the adapter
 */
export function createReduxReducer<TState, TEvent extends Event>(
  componentDef: ComponentDef<TState, TEvent>,
  config: ReduxAdapterConfig = {}
): Reducer<TState, ReduxAction> {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  return (state: TState = componentDef.initialState, action: ReduxAction): TState => {
    // Handle event chains if enabled
    if (finalConfig.enableEventChains && isEventChainAction(action, finalConfig.chainActionType)) {
      return processEventChain(state, action.payload as EventChain<TEvent>, componentDef.reducer, finalConfig);
    }
    
    // Handle individual events
    if (componentDef.eventHandling.supportedEvents.includes(action.type)) {
      const processedAction = applyMiddleware(action as any, finalConfig.middleware || []);
      return componentDef.reducer(state, processedAction as TEvent);
    }
    
    return state;
  };
}

/**
 * Processes an event chain by applying each event in sequence.
 * 
 * @param initialState - The starting state
 * @param eventChain - The chain of events to process
 * @param reducer - The reducer function to apply
 * @param config - Configuration options
 */
function processEventChain<TState, TEvent extends Event>(
  initialState: TState,
  eventChain: EventChain<TEvent>,
  reducer: Reducer<TState, TEvent>,
  config: ReduxAdapterConfig
): TState {
  return eventChain.events.reduce((currentState, event) => {
    const processedEvent = applyMiddleware(event as any, config.middleware || []);
    return reducer(currentState, processedEvent as TEvent);
  }, initialState);
}

/**
 * Applies middleware to an event before processing.
 * 
 * @param event - The event to process
 * @param middleware - Array of middleware functions
 */
function applyMiddleware<TEvent extends Event>(
  event: TEvent,
  middleware: readonly EventMiddleware<TEvent>[]
): TEvent {
  let processedEvent = event;
  let index = 0;
  
  const next = (modifiedEvent: TEvent): void => {
    processedEvent = modifiedEvent;
    if (index < middleware.length) {
      const currentMiddleware = middleware[index++];
      currentMiddleware(processedEvent, next);
    }
  };
  
  if (middleware.length > 0) {
    next(event);
  }
  
  return processedEvent;
}

/**
 * Creates Redux-compatible selectors from a ComponentDef.
 * The selectors will work with the Redux store's getState method.
 * 
 * @param componentDef - The component definition
 * @param stateKey - The key in the Redux state where this component's state is stored
 */
export function createReduxSelectors<TState, TSelectors extends Record<string, Selector<TState>>>(
  componentDef: ComponentDef<TState, any, TSelectors>,
  stateKey?: string
): { [K in keyof TSelectors]: Selector<any, ReturnType<TSelectors[K]>> } {
  const selectors = {} as { [K in keyof TSelectors]: Selector<any, ReturnType<TSelectors[K]>> };
  
  for (const [key, selector] of Object.entries(componentDef.selectors) as [keyof TSelectors, TSelectors[keyof TSelectors]][]) {
    selectors[key] = (rootState: any) => {
      const componentState = stateKey ? rootState[stateKey] : rootState;
      return selector(componentState);
    };
  }
  
  return selectors;
}

/**
 * Creates an action creator for dispatching event chains.
 * 
 * @param chainActionType - The action type to use for event chains
 */
export function createEventChainActionCreator(
  chainActionType: string = DEFAULT_CONFIG.chainActionType!
) {
  return <TEvent extends Event>(eventChain: EventChain<TEvent>): EventChainAction => ({
    type: chainActionType,
    payload: eventChain,
  });
}

/**
 * Higher-order function that enhances a Redux store with component support.
 * This provides additional methods for working with ComponentDef instances.
 * 
 * @param store - The Redux store to enhance
 * @param config - Configuration options for the adapter
 */
export function enhanceStoreWithComponents<TState>(
  store: ReduxStore<TState>,
  config: ReduxAdapterConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const createEventChainAction = createEventChainActionCreator(finalConfig.chainActionType);
  
  return {
    ...store,
    
    /**
     * Dispatches an event chain to the store.
     * 
     * @param eventChain - The chain of events to dispatch
     */
    dispatchEventChain<TEvent extends Event>(eventChain: EventChain<TEvent>): void {
      if (!finalConfig.enableEventChains) {
        throw new Error('Event chains are not enabled in the Redux adapter configuration');
      }
      store.dispatch(createEventChainAction(eventChain));
    },
    
    /**
     * Creates a bound selector function that automatically applies to the current state.
     * 
     * @param selector - The selector function to bind
     */
    createBoundSelector<TResult>(selector: Selector<TState, TResult>) {
      return (): TResult => selector(store.getState());
    },
    
    /**
     * Registers a component with the store by returning the appropriate reducer and selectors.
     * 
     * @param componentDef - The component definition to register
     * @param stateKey - Optional key for nested state
     */
    registerComponent<TComponentState, TEvent extends Event, TSelectors extends Record<string, Selector<TComponentState>>>(
      componentDef: ComponentDef<TComponentState, TEvent, TSelectors>,
      stateKey?: string
    ) {
      return {
        reducer: createReduxReducer(componentDef, finalConfig),
        selectors: createReduxSelectors(componentDef, stateKey),
        initialState: componentDef.initialState,
      };
    },
  };
}

/**
 * Utility type for extracting the enhanced store type.
 */
export type EnhancedReduxStore<TState> = ReturnType<typeof enhanceStoreWithComponents<TState>>;

/**
 * Creates a Redux middleware that logs all component events.
 * Useful for debugging and development.
 */
export function createComponentLoggingMiddleware(): EventMiddleware {
  return (event, next) => {
    console.group(`🔄 Component Event: ${event.type}`);
    console.log('Payload:', event.payload);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
    next(event);
  };
}

/**
 * Creates a Redux middleware that validates events against a schema.
 * This can help catch type errors at runtime during development.
 * 
 * @param validator - Function that validates event payload
 */
export function createEventValidationMiddleware<TEvent extends Event>(
  validator: (event: TEvent) => boolean | string
): EventMiddleware<TEvent> {
  return (event, next) => {
    const validationResult = validator(event);
    if (validationResult === true) {
      next(event);
    } else {
      const errorMessage = typeof validationResult === 'string' 
        ? validationResult 
        : `Invalid event: ${event.type}`;
      console.error(errorMessage, event);
      // In development, you might want to throw an error
      // In production, you might want to log and continue
      next(event);
    }
  };
}