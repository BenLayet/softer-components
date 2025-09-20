/**
 * Core types for state-manager-agnostic component definitions.
 * These types provide the foundation for reusable and composable components,
 * compatible with any state manager.
 */

/**
 * Describes the payload for a single event.
 */
export interface Event<TPayload = any> {
	readonly payload: TPayload;
}

/**
 * A map of event type strings to their event payloads.
 * Example:
 *   interface CounterEvents {
 *     INCREMENT: Event<undefined>;
 *     DECREMENT: Event<undefined>;
 *     SET_VALUE: Event<number>;
 *   }
 */
export type Events = Record<string, Event<any>>;

export type EventCreator<TPayload = void> = TPayload extends void
  ? () => Event<undefined>
  : (payload: TPayload) => Event<TPayload>;

export type Reducer<TState, TEvent = any> = (
	state: TState,
	event: TEvent
) => TState;

export type Selector<TState, TResult = any> = (state: TState) => TResult;

export interface EventChain<TEvent = any> {
	readonly events: readonly TEvent[];
	readonly metadata?: {
		readonly id?: string;
		readonly timestamp?: number;
		readonly source?: string;
	};
}

export interface EventHandling<TEvents extends Events = Events> {
	readonly supportedEvents: (keyof TEvents)[];
	readonly chainSupport?: boolean;
}

/**
 * Defines a reusable, typed, and composable component.
 * TEvents should be a map of event type strings to Event payloads.
 *
 * Example:
 *   interface CounterEvents {
 *     INCREMENT: Event<undefined>;
 *     DECREMENT: Event<undefined>;
 *     SET_VALUE: Event<number>;
 *   }
 *   const counterComponent: ComponentDef<CounterState, CounterEvents, ...>
 */
export interface ComponentDef<
	TState = any,
	TEvents extends Events = Events,
	TSelectors = Record<string, Selector<TState>>
> {
	readonly initialState: TState;
	/**
	 * The reducer receives the current state and an event object, where the key is the event type and the value is the event payload.
	 */
	readonly reducer: (
		state: TState,
		event: { type: keyof TEvents; payload: TEvents[keyof TEvents]["payload"] }
	) => TState;
	readonly selectors: TSelectors;
	readonly eventHandling: EventHandling<TEvents>;
}

export type ComponentState<T> = T extends ComponentDef<infer TState, any, any>
	? TState
	: never;

export type ComponentEvents<T> = T extends ComponentDef<any, infer TEvents, any>
	? TEvents
	: never;

export type ComponentSelectors<T> = T extends ComponentDef<any, any, infer TSelectors>
	? TSelectors
	: never;

export type EventCreators<TEventMap extends Events> = {
	readonly [K in keyof TEventMap]: EventCreator<TEventMap[K]["payload"]>;
};
