/**
 * Redux adapter for integrating ComponentDef with Redux.
 * Dépend du package @softer-components/types pour les types de base.
 */

import type {
  ComponentDef,
  Event,
  EventChain,
  Reducer,
  Selector,
} from '@softer-components/types';

export interface ReduxAction<TPayload = any> extends Event<TPayload> {
	readonly type: string;
	readonly payload: TPayload;
}

export interface ReduxStore<TState = any> {
	getState(): TState;
	dispatch(action: ReduxAction): ReduxAction;
	subscribe(listener: () => void): () => void;
}


export interface ReduxAdapterConfig {
	readonly enableEventChains?: boolean;
	readonly chainActionType?: string;
}

const DEFAULT_CONFIG: ReduxAdapterConfig = {
  enableEventChains: true,
  chainActionType: '@@COMPONENT/EVENT_CHAIN',
};

export interface EventChainAction extends ReduxAction<EventChain> {
	readonly type: string;
	readonly payload: EventChain;
}

export function isEventChainAction(
	action: ReduxAction,
	chainActionType: string = DEFAULT_CONFIG.chainActionType!
): action is EventChainAction {
	return action.type === chainActionType;
}

export function createReduxReducer<TState, TEvent extends Event>(
	componentDef: ComponentDef<TState, TEvent>,
	config: ReduxAdapterConfig = {}
): Reducer<TState, ReduxAction> {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
		return (state: TState = componentDef.initialState, action: ReduxAction): TState => {
			if (finalConfig.enableEventChains && isEventChainAction(action, finalConfig.chainActionType)) {
				return processEventChain(state, action.payload as EventChain<TEvent>, componentDef.reducer);
			}
			if (componentDef.eventHandling.supportedEvents.includes(action.type)) {
				return componentDef.reducer(state, action as TEvent);
			}
			return state;
		};
}

function processEventChain<TState, TEvent extends Event>(
	initialState: TState,
	eventChain: EventChain<TEvent>,
	reducer: Reducer<TState, TEvent>
): TState {
	return eventChain.events.reduce((currentState: TState, event: TEvent) => {
		return reducer(currentState, event);
	}, initialState);
}



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

export function createEventChainActionCreator(
	chainActionType: string = DEFAULT_CONFIG.chainActionType!
) {
	return <TEvent extends Event>(eventChain: EventChain<TEvent>): EventChainAction => ({
		type: chainActionType,
		payload: eventChain,
	});
}

export function enhanceStoreWithComponents<TState>(
	store: ReduxStore<TState>,
	config: ReduxAdapterConfig = {}
) {
	const finalConfig = { ...DEFAULT_CONFIG, ...config };
	const createEventChainAction = createEventChainActionCreator(finalConfig.chainActionType);
	return {
		...store,
		dispatchEventChain<TEvent extends Event>(eventChain: EventChain<TEvent>): void {
			if (!finalConfig.enableEventChains) {
				throw new Error('Event chains are not enabled in the Redux adapter configuration');
			}
			store.dispatch(createEventChainAction(eventChain));
		},
		createBoundSelector<TResult>(selector: Selector<TState, TResult>) {
			return (): TResult => selector(store.getState());
		},
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

export type EnhancedReduxStore<TState> = ReturnType<typeof enhanceStoreWithComponents<TState>>;




