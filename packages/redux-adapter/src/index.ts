/**
 * Redux adapter for integrating ComponentDef with Redux.
 * Depends on the @softer-components/types package for core types.
 */

import type {
  ComponentDef,
  Event,
  ChainedEvent,
  State,
  Payload,
  Selector,
  Value,
} from '@softer-components/types';

export interface ReduxAction<TPayload extends Payload = Payload> {
  readonly type: string;
  readonly payload: TPayload;
}

export interface ReduxStore<TState extends State = State> {
  getState(): TState;
  dispatch<TPayload extends Payload>(action: ReduxAction<TPayload>): ReduxAction<TPayload>;
  subscribe(listener: () => void): () => void;
}

export interface ReduxAdapterConfig {
  readonly enableChainedEvents?: boolean;
  readonly chainActionType?: string;
}

export interface ChainedEventAction<TState extends State> extends ReduxAction<ChainedEvent<TState>> {
  readonly type: string;
  readonly payload: ChainedEvent<TState>;
}

export function isChainedEventAction<TState extends State>(
  action: ReduxAction,
  chainActionType: string = DEFAULT_CONFIG.chainActionType!
): action is ChainedEventAction<TState> {
  return action.type === chainActionType;
}

export function createReduxReducer<TState extends Value>(
  componentDef: ComponentDef<TState>
): (state: TState | undefined, action: ReduxAction) => TState {

  const fullComponentDef = setDefaultValues(componentDef);

  return (
    state: TState | undefined = componentDef.initialState,
    action: ReduxAction
  ): TState => {

    // Handle chained events
    processChainedEvent(currentState, action.payload, componentDef);

    // Handle regular events
    if (componentDef.events && action.type in componentDef.events) {
      const event = componentDef.events[action.type as keyof typeof componentDef.events];
      if (event && 'handler' in event && event.handler) {
        return event.handler(action.payload, currentState);
      }
    }

    return currentState;
  };
}

function processChainedEvent<TState extends State>(
  state: TState,
  chainedEvent: ChainedEvent<TState>,
  componentDef: ComponentDef<TState>
): TState {
  // Check condition if provided
  if (chainedEvent.onCondition && !chainedEvent.onCondition(undefined, state)) {
    return state;
  }

  // Find the target event to dispatch
  const targetEventType = chainedEvent.thenDispatch.eventType;
  if (componentDef.events && targetEventType in componentDef.events) {
    const targetEvent = componentDef.events[targetEventType as keyof typeof componentDef.events];
    
    // Calculate payload for the chained event
    const payload = chainedEvent.withPayload ? chainedEvent.withPayload(undefined, state) : undefined;
    
    // Execute the target event handler
    if (targetEvent && 'handler' in targetEvent && targetEvent.handler) {
      return targetEvent.handler(payload as Payload, state);
    }
  }

  return state;
}

export function createReduxSelectors<TState extends State>(
  componentDef: ComponentDef<TState>,
  stateKey?: string
): Record<string, Selector<any, Value>> {
  const selectors: Record<string, Selector<any, Value>> = {};

  if (componentDef.selectors) {
    for (const [key, selector] of Object.entries(componentDef.selectors)) {
      selectors[key] = (rootState: any) => {
        const componentState = stateKey ? rootState[stateKey] : rootState;
        return selector(componentState);
      };
    }
  }

  return selectors;
}

export function createChainedEventActionCreator<TState extends State>(
  chainActionType: string = DEFAULT_CONFIG.chainActionType!
) {
  return (chainedEvent: ChainedEvent<TState>): ChainedEventAction<TState> => ({
    type: chainActionType,
    payload: chainedEvent,
  });
}

export function enhanceStoreWithComponents<TState extends State>(
  store: ReduxStore<TState>,
  config: ReduxAdapterConfig = {}
) {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const createChainedEventAction = createChainedEventActionCreator<TState>(finalConfig.chainActionType);

  return {
    ...store,
    dispatchChainedEvent(chainedEvent: ChainedEvent<TState>): void {
      if (!finalConfig.enableChainedEvents) {
        throw new Error('Chained events are not enabled in the Redux adapter configuration');
      }
      store.dispatch(createChainedEventAction(chainedEvent));
    },
    createBoundSelector<TResult extends Value>(selector: Selector<TState, TResult>) {
      return (): TResult => selector(store.getState());
    },
    registerComponent(
      componentDef: ComponentDef<TState>,
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

export type EnhancedReduxStore<TState extends State> = ReturnType<typeof enhanceStoreWithComponents<TState>>;

// Action creators for common patterns
export function createEventActionCreator<TEventType extends string, TPayload extends Payload>(
  eventType: TEventType
) {
  return (payload: TPayload): ReduxAction<TPayload> => ({
    type: eventType,
    payload,
  });
}

// Utility type for extracting event types from ComponentDef
export type ComponentEventTypes<T extends ComponentDef<any>> = 
  T extends ComponentDef<infer TState> 
    ? T['events'] extends Record<string, any>
      ? keyof T['events']
      : never
    : never;