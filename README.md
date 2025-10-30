# Softer Components

A TypeScript component types library that is state-manager-agnostic and reusable. Build composable, type-safe components that work with any state management solution, including Redux.

## ✨ Features

- **🔒 Full Type Safety**: Complete TypeScript support with strict typing
- **🌐 State-Manager Agnostic**: Works with Redux, Zustand, or any state management solution
- **🔗 Composable**: Build complex components from simple, reusable parts
- **⚡ Zero Runtime Dependencies**: Lightweight with no external dependencies
- **🔄 Event Forwarding**: Support for complex, multi-step operations
- **🎯 Redux Integration**: Built-in Redux adapter with middleware support
- **📖 Well Documented**: Comprehensive documentation and examples

## 🧠 Concepts

- component definition (componentDef):
  - define the behaviour and structure of components
  - 1 per type of component at runtime
- component:
  - represents the UI component
  - 1 per UI component at runtime
- events:
  - UI interactions are captured as UI events
  - which can trigger internal business events
  - which can trigger commands to children or trigger events in parent
- commands:
  - use for parent to child communication
-

## 📦 Installation

```bash
pnpm install -D @softer-components/types
```

## 🚀 Quick Start

### Basic Component Definition

```typescript
import { ComponentDef } from "@softer-components/types";

// State
const initialState = {
  value: 0,
};
type CounterState = typeof initialState;

// Event Handlers
const incrementRequested = (state: CounterState) => ({
  ...state,
  value: state.value + 1,
});
const decrementRequested = (state: CounterState) => ({
  ...state,
  value: state.value - 1,
});
// Selectors
const selectCount = (state: CounterState) => state.value;

// Component Definition
export const counterComponentDef: ComponentDef<
  CounterState,
  {
    incrementRequested: void;
    decrementRequested: void;
  },
  { selectCount: number },
  {
    amount: {
      amountUpdated: number;
    };
  }
> = {
  initialState,
  stateUpdaters: {
    incrementRequested,
    decrementRequested,
    incrementByAmountRequested,
    setNextAmountRequested,
  },
  selectors: {
    selectCount,
  },
  chainedEvents: [
    {
      onEvent: "amount/amountUpdated",
      thenDispatch: "setNextAmountRequested",
      withPayload: (previousPayload) => (previousPayload ?? 0) * 2,
    },
  ],
};
```

## 🔄 Redux Integration

### Setting up Redux with Softer Components

```typescript
import { createStore } from "redux";
import {
  createReduxReducer,
  createReduxSelectors,
  enhanceStoreWithComponents,
} from "softer-components";
import { counterComponent } from "softer-components";

// Create Redux reducer from component definition
const counterReducer = createReduxReducer(counterComponent);

// Create the Redux store
const store = createStore(counterReducer);

// Enhance the store with component utilities
const enhancedStore = enhanceStoreWithComponents(store);

// Create Redux-compatible selectors
const selectors = createReduxSelectors(counterComponent);

// Use the store
store.dispatch({ type: "INCREMENT", payload: undefined });
console.log(selectors.getValue(store.getState())); // 1
```

### Working with Event Chains

```typescript
import { createEventChain, counterEvents } from "softer-components";

// Create a complex operation as an event chain
const complexOperation = createEventChain(
  [
    counterEvents.START_LOADING(),
    counterEvents.INCREMENT(),
    counterEvents.INCREMENT(),
    counterEvents.STOP_LOADING(),
  ],
  {
    id: "complex-increment",
    source: "user-action",
  }
);

// Dispatch the entire chain
enhancedStore.dispatchEventChain(complexOperation);
```

## 🎯 Core Concepts

### Events

Events represent intentions to change state. They are simple objects with a type and payload:

```typescript
interface Event<TPayload = any> {
  readonly type: string;
  readonly payload: TPayload;
}
```

### Reducers

Reducers are pure functions that describe how state changes in response to events:

```typescript
type Reducer<TState, TEvent extends Event = Event> = (
  state: TState,
  event: TEvent
) => TState;
```

### Selectors

Selectors extract specific data from state, enabling computed values:

```typescript
type Selector<TState, TResult = any> = (state: TState) => TResult;

// Example with memoization
const expensiveSelector = createMemoizedSelector((state: AppState) =>
  state.items.map((item) => computeExpensiveValue(item))
);
```

### Event Chains

Event chains allow you to compose multiple events into a single operation:

```typescript
const userRegistration = createEventChain([
  userEvents.START_REGISTRATION(),
  userEvents.VALIDATE_EMAIL({ email: "user@example.com" }),
  userEvents.CREATE_USER({ name: "John", email: "user@example.com" }),
  userEvents.SEND_WELCOME_EMAIL(),
  userEvents.COMPLETE_REGISTRATION(),
]);
```

### Component Definitions

ComponentDef ties together all aspects of a component:

```typescript
interface ComponentDef<TState, TEvent, TSelectors> {
  readonly name: string;
  readonly initialState: TState;
  readonly reducer: Reducer<TState, TEvent>;
  readonly selectors: TSelectors;
  readonly eventHandling: EventHandling<TEvent>;
  readonly metadata?: ComponentMetadata;
}
```

## 🔧 Advanced Usage

### Middleware

Add middleware for cross-cutting concerns:

```typescript
import {
  createComponentLoggingMiddleware,
  createEventValidationMiddleware,
} from "softer-components";

const loggingMiddleware = createComponentLoggingMiddleware();
const validationMiddleware = createEventValidationMiddleware((event) => {
  // Custom validation logic
  return event.type.length > 0;
});

const config = {
  middleware: [loggingMiddleware, validationMiddleware],
};

const reducer = createReduxReducer(myComponent, config);
```

### Composing Reducers

Combine multiple reducers for complex state management:

```typescript
import { composeReducers } from "softer-components";

const combinedReducer = composeReducers(
  userReducer,
  settingsReducer,
  uiReducer
);
```

### State Validation

Ensure your state stays valid:

```typescript
const isValidUserState = (state: UserState): boolean => {
  return (
    typeof state.id === "string" &&
    state.id.length > 0 &&
    typeof state.email === "string" &&
    state.email.includes("@")
  );
};
```

## 📋 Example: Counter Component

The library includes a complete counter example demonstrating best practices:

```typescript
import {
  counterComponent,
  counterEvents,
  counterEventChains,
} from "softer-components";

// Use the pre-built counter
const store = createStore(createReduxReducer(counterComponent));

// Basic operations
store.dispatch(counterEvents.INCREMENT());
store.dispatch(counterEvents.SET_STEP(5));
store.dispatch(counterEvents.INCREMENT()); // Now increments by 5

// Complex operations
const enhancedStore = enhanceStoreWithComponents(store);
enhancedStore.dispatchEventChain(counterEventChains.multipleIncrements(3));
```

## 🏗️ Building and Publishing

```bash
# Install dependencies
npm install

# Build the library
npm run build

# Publish to npm
npm publish
```

## 🔍 API Reference

### Core Types

- `Event<TPayload>` - Base event interface
- `EventCreator<TPayload>` - Function to create events
- `Reducer<TState, TEvent>` - State transformation function
- `Selector<TState, TResult>` - State extraction function
- `EventChain<TEvent>` - Sequence of related events
- `ComponentDef<TState, TEvent, TSelectors>` - Complete component definition

### Utilities

- `createEventCreators<TEventMap>(types)` - Create typed event creators
- `createEventChain<TEvent>(events, metadata?)` - Create event chains
- `composeReducers<TState, TEvent>(...reducers)` - Combine reducers
- `createMemoizedSelector<TState, TResult>(selector, equalityFn?)` - Memoized selectors

### Redux Adapter

- `createReduxReducer<TState, TEvent>(componentDef, config?)` - Redux-compatible reducer
- `createReduxSelectors<TState, TSelectors>(componentDef, stateKey?)` - Redux selectors
- `enhanceStoreWithComponents<TState>(store, config?)` - Enhanced store with utilities
- `createComponentLoggingMiddleware()` - Development logging
- `createEventValidationMiddleware<TEvent>(validator)` - Runtime validation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have questions or need help, please open an issue on GitHub.

---

Built with ❤️ and TypeScript
