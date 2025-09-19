/**
 * Core types for state-manager-agnostic component definitions.
 * These types provide the foundation for building reusable, composable components
 * that can work with any state management solution.
 */

/**
 * Represents an event that can be dispatched to modify state.
 * Events are the primary way to communicate intent to change state.
 * 
 * @template TPayload - The type of data carried by the event
 */
export interface Event<TPayload = any> {
  readonly type: string;
  readonly payload: TPayload;
}

/**
 * A function that creates an event with the given payload.
 * Event creators provide a consistent way to create events with proper typing.
 * 
 * @template TPayload - The type of payload the event creator accepts
 */
export type EventCreator<TPayload = void> = TPayload extends void
  ? () => Event<undefined>
  : (payload: TPayload) => Event<TPayload>;

/**
 * A reducer function that takes current state and an event, returning new state.
 * Reducers are pure functions that define how state changes in response to events.
 * 
 * @template TState - The type of state being managed
 * @template TEvent - The type of events the reducer can handle
 */
export type Reducer<TState, TEvent extends Event = Event> = (
  state: TState,
  event: TEvent
) => TState;

/**
 * A selector function that extracts specific data from state.
 * Selectors provide a way to derive computed values from state.
 * 
 * @template TState - The type of state being selected from
 * @template TResult - The type of data being selected
 */
export type Selector<TState, TResult = any> = (state: TState) => TResult;

/**
 * Represents a chain of events that should be processed in sequence.
 * Event chains allow for complex state updates that require multiple steps.
 * 
 * @template TEvent - The type of events in the chain
 */
export interface EventChain<TEvent extends Event = Event> {
  readonly events: readonly TEvent[];
  readonly metadata?: {
    readonly id?: string;
    readonly timestamp?: number;
    readonly source?: string;
  };
}

/**
 * Creates an event chain from a sequence of events.
 * 
 * @param events - The events to include in the chain
 * @param metadata - Optional metadata for the chain
 */
export function createEventChain<TEvent extends Event>(
  events: readonly TEvent[],
  metadata?: EventChain<TEvent>['metadata']
): EventChain<TEvent> {
  return {
    events,
    metadata: {
      timestamp: Date.now(),
      ...metadata,
    },
  };
}

/**
 * Configuration for event handling within a component.
 * Defines how events are processed and what side effects they may trigger.
 * 
 * @template TEvent - The type of events being handled
 */
export interface EventHandling<TEvent extends Event = Event> {
  readonly supportedEvents: readonly string[];
  readonly chainSupport?: boolean;
  readonly middleware?: readonly EventMiddleware<TEvent>[];
}

/**
 * Middleware function that can intercept and transform events.
 * Middleware allows for cross-cutting concerns like logging, validation, or transformation.
 * 
 * @template TEvent - The type of events being processed
 */
export type EventMiddleware<TEvent extends Event = Event> = (
  event: TEvent,
  next: (processedEvent: TEvent) => void
) => void;

/**
 * Complete definition of a component including its state, events, and behavior.
 * This is the core abstraction that ties together all aspects of a component.
 * 
 * @template TState - The type of state managed by the component
 * @template TEvent - The type of events the component can handle
 * @template TSelectors - The selectors available for this component
 */
export interface ComponentDef<
  TState = any,
  TEvent extends Event = Event,
  TSelectors = Record<string, Selector<TState>>
> {
  readonly name: string;
  readonly initialState: TState;
  readonly reducer: Reducer<TState, TEvent>;
  readonly selectors: TSelectors;
  readonly eventHandling: EventHandling<TEvent>;
  readonly metadata?: {
    readonly version?: string;
    readonly description?: string;
    readonly dependencies?: readonly string[];
  };
}

/**
 * Helper type to extract the state type from a ComponentDef.
 */
export type ComponentState<T> = T extends ComponentDef<infer TState, any, any>
  ? TState
  : never;

/**
 * Helper type to extract the event type from a ComponentDef.
 */
export type ComponentEvent<T> = T extends ComponentDef<any, infer TEvent, any>
  ? TEvent
  : never;

/**
 * Helper type to extract the selectors type from a ComponentDef.
 */
export type ComponentSelectors<T> = T extends ComponentDef<any, any, infer TSelectors>
  ? TSelectors
  : never;

/**
 * Utility type for creating strongly-typed event creators.
 * Maps event types to their corresponding event creator functions.
 * 
 * @template TEventMap - Map of event types to their payload types
 */
export type EventCreators<TEventMap extends Record<string, any>> = {
  readonly [K in keyof TEventMap]: EventCreator<TEventMap[K]>;
};

/**
 * Creates a set of event creators from an event map.
 * This utility helps maintain type safety when creating multiple related events.
 * 
 * @param eventMap - Map of event types to their payload types
 * @returns A set of strongly-typed event creators
 */
export function createEventCreators<TEventMap extends Record<string, any>>(
  eventTypes: readonly (keyof TEventMap)[]
): EventCreators<TEventMap> {
  const creators = {} as any;
  
  for (const type of eventTypes) {
    creators[type] = ((payload: any) => ({
      type: type as string,
      payload,
    })) as any;
  }
  
  return creators as EventCreators<TEventMap>;
}

/**
 * Utility for composing multiple reducers into a single reducer.
 * This enables modular state management where different aspects of state
 * can be managed by separate reducers.
 * 
 * @param reducers - Array of reducers to compose
 * @returns A single reducer that applies all provided reducers in sequence
 */
export function composeReducers<TState, TEvent extends Event>(
  ...reducers: readonly Reducer<TState, TEvent>[]
): Reducer<TState, TEvent> {
  return (state: TState, event: TEvent): TState => {
    return reducers.reduce((currentState, reducer) => {
      return reducer(currentState, event);
    }, state);
  };
}

/**
 * Creates a selector that memoizes its result based on input equality.
 * This can help optimize performance by avoiding unnecessary recalculations.
 * 
 * @param selector - The selector function to memoize
 * @param equalityFn - Optional equality function for cache invalidation
 */
export function createMemoizedSelector<TState, TResult>(
  selector: Selector<TState, TResult>,
  equalityFn: (a: TState, b: TState) => boolean = Object.is
): Selector<TState, TResult> {
  let lastState: TState;
  let lastResult: TResult;
  let hasResult = false;

  return (state: TState): TResult => {
    if (!hasResult || !equalityFn(state, lastState)) {
      lastState = state;
      lastResult = selector(state);
      hasResult = true;
    }
    return lastResult;
  };
}