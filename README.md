# ☁️ Softer Components

A state-manager-agnostic component library built with TypeScript in a monorepo structure, designed for creating reusable UI components.
## ✨ Features

- **🔒 Full Type Safety**: Complete TypeScript support with strict typing
- **⚡ Minimal Runtime Dependencies**: Lightweight core types package
- **🌐 State-Manager Agnostic**: Core types work with any state management solution
- **🔄 Redux Integration**: Built-in Redux adapter, and React hooks, using a 🪾 tree state  
- **📖 Well Documented**: Comprehensive documentation with real examples
- **🧩 Composable**: Build complex apps from simple components that encapsulate their own logic
- **♻️ Reusable**: Designed so components can be reused in different contexts
- **🔄 Event Forwarding**: Support for parent-child communication via listeners and commands


## 🤔 Why Softer Components?

Front-end applications tend to become quite complex, as they have to tackle:

- handling many events in random order (user input, HTTP responses, timeout etc...)
- interacting with the DOM (time-consuming rendering, dependency to the rendering logic)
- juggling with different data models (backend DTO, display data model, and form data model), and knowing when each data is updated in each model

The first step to address these challenges is to use a state manager:

- no more ambiguity about what is updated when
- excellent to separate behaviour logic from presentation logic
- but this brings new challenges:
  - yet another data model (store data model)
  - concentration of complexity in one place (reducers, selectors, and effects/thunks)
  - components are less reusable, as their own behavior logic is mixed up with all other components logic
  - lazy loading of part of the application is more challenging
  - the codebase is tied into a library and dependent of its evolutions (for better or for worth)

To address some of these new issues, the second step is to slice the global store into "feature stores":

- the data model of each feature store is closer to the data model of form and display
- lazy loading becomes simple
- but again new challenges :
  - duplication of data between features stores
  - communication between features adds boilerplate, and dependencies between them can be challenging, with a risk of circular dependencies
  - grouping which components into which features is not straightforward: different developers might use different practices, resulting in an inconsistent codebase

Softer Components goes one step further:
- 1 UI component = 1 'softer component' managing its own slice of the store
- Complete break down of application complexity into simple component logic while keeping a unique global state
  - a component is unaware of its 'path' in the component tree and can be reused anywhere, multiple times
- minimum boilerplate
  - a component is defined by a declarative 'description' of its behavior
- maximum reusability: each component can potentially be shared and reused in any application
  - no tie to a specific platform or state manager (a component used in React/Redux can be reused in Angular/NgRx)
- Clear dependencies: a component only knows about the 'contract' of its children
  - it 'knows nothing' about its parent or the rest of the application
- Strict separation of concerns:
  - Display logic in UI components
  - Behavior in 'softer component'
  - Interaction with external systems in effects (HTTP, localstorage, service worker, etc...)

The tradeoff is that a strict coding pattern needs to be applied.

## 🧠 Core Concepts

### Component Definition (`ComponentDef`)

Defines the behavior and structure of a component type.

- One `ComponentDef` can be used by multiple components at runtime
- Each component has its own state at runtime

### Events

Each component communicates with the rest of the application through events that can be triggered:

- **by the UI**: e.g. `buttonClicked`, `inputChanged`
- **by internal event chain**: e.g. `buttonClicked` => `submitRequested` to encourage separation of UI event and behavior events, and flexibility about UI interaction
- **by listening to a child component**: e.g., if a table is listening to a pager: `pageSelected` from the pager => `fetchPageRequested`
- **by a parent component**: e.g. `selectAllRequested` from a checkboxList => `selectRequested` for each checkbox
- _coming in issue #4_: **by an effect**: e.g. `httpFetchSucceeded`, `timeoutExpired`
- _coming in issue #11_: **by listening to a context**: e.g., if a basket component is listening to security context: `authenticationSuceeded` => `loadPreviouslySavedBasket`
- _coming in issue #11_: **by a component to a context**: e.g., login component `loginSubmitted` => security context: `authenticationRequested`

Inspired by NgRx concept of Good Action Hygiene https://www.youtube.com/watch?v=JmnsEvoy-gY&themeRefresh=1, events in Softer Components:
 - they tell where they are dispatched from
 - they tell what event has occurred (in the past)
 - they are unaware about who will consume them

## 📦 Installation

```bash
# Install core types
pnpm add -D @softer-components/types

# Install Redux adapter (if using Redux)
pnpm add @softer-components/redux-adapter

```

## 🚀 Quick Start

### 1. Define Your Component Contract

```typescript
import { ComponentContract } from "@softer-components/types";

// Define the contract for a counter component
type CounterContract = {
  // Component state
  state: {
    count: number;
  };

  // Computed values (from selectors)
  values: {
    doubled: number;
    isEven: boolean;
  };

  // Events the component can handle
  events: {
    increment: { payload: undefined };
    decrement: { payload: undefined };
    set: { payload: number };
  };

  // Child components
  children: {};
};
```

### 2. Create Component Definition

```typescript
import { ComponentDef } from "@softer-components/types";

export const counterDef: ComponentDef<CounterContract> = {
  // Initial state
  initialState: { count: 0 },

  // Selectors - compute derived values
  selectors: {
    doubled: (state) => state.count * 2,
    isEven: (state) => state.count % 2 === 0,
  },

  // UI events that can be dispatched from the component
  uiEvents: ["increment", "decrement", "set"],

  // Updaters - handle events and update state
  updaters: {
    increment: ({ state }) => {
      state.count += 1; // ✅ Immer allows mutation
    },
    decrement: ({ state }) => {
      state.count -= 1;
    },
    set: ({ state, payload }) => {
      state.count = payload;
    },
  },
};
```

### 3. Use with Redux

```tsx
import { configureSofterStore } from "@softer-components/redux-adapter";
import { Provider } from "react-redux";

// Create Redux store with Softer Components
const store = configureSofterStore(counterDef);

// Wrap your app with Redux Provider
function App() {
  return (
    <Provider store={store}>
      <Counter />
    </Provider>
  );
}
```

or create your own adapter for your own state manager using `@softer-components/utils` (and share it!)

### 4. Use in React Component

```tsx
import { useSofter } from "@softer-components/redux-adapter";

interface CounterProps {
  path?: string;
}

export const Counter = ({ path = "" }: CounterProps) => {
  // ☁️ Get values, events, and children paths
  const [values, events] = useSofter<CounterContract>(path);

  return (
    <div>
      <h1>Count: {values.doubled}</h1>
      <p>{values.isEven ? "Even" : "Odd"}</p>
      <button onClick={events.increment}>+</button>
      <button onClick={events.decrement}>-</button>
      <button onClick={() => events.set(0)}>Reset</button>
    </div>
  );
};
```

## 🔄 Detailed Features

### Event Forwarding (Internal)

Forward events within the same component:

```typescript
export const counterDef: ComponentDef<CounterContract> = {
  initialState: { count: 0 },

  selectors: {
    count: (state) => state.count,
  },

  uiEvents: ["btnClicked"],

  updaters: {
    incrementRequested: ({ state }) => {
      state.count++;
    },
  },

  // 🔄 Forward btnClicked -> incrementRequested
  eventForwarders: [
    {
      from: "btnClicked",
      to: "incrementRequested",
    },
  ],
};
```

### Parent-Child Communication

#### Child-to-Parent (Listeners)

```typescript
type ItemContract = {
  state: { name: string };
  values: { displayName: string };
  events: {
    removed: { payload: undefined };
  };
  children: {};
};

type ListContract = {
  state: { items: string[] };
  values: { itemCount: number };
  events: {
    itemRemoved: { payload: string };
  };
  children: {
    items: ItemContract;
  };
};

export const listDef: ComponentDef<ListContract> = {
  initialState: { items: [] },

  selectors: {
    itemCount: (state) => state.items.length,
  },

  updaters: {
    itemRemoved: ({ state, payload }) => {
      state.items = state.items.filter((id) => id !== payload);
    },
  },

  childrenComponents: {
    items: itemDef,
  },

  childrenConfig: {
    items: {
      // 👂 Listen to child events
      listeners: [
        {
          from: "removed", // Child event
          to: "itemRemoved", // Parent event
          withPayload: ({ fromChildKey }) => fromChildKey,
        },
      ],
    },
  },
};
```

#### Parent-to-Child (Commands)

```typescript
export const listDef: ComponentDef<ListContract> = {
  // ...existing code...

  childrenConfig: {
    items: {
      // 📢 Send commands to children
      commands: [
        {
          from: "clearAllRequested", // Parent event
          to: "clearRequested", // Child event
        },
      ],
    },
  },
};
```

### Conditional Event Forwarding

```typescript
eventForwarders: [
  {
    from: "itemClicked",
    to: "itemSelected",
    // Only forward if condition is met
    onCondition: ({ values, payload }) => {
      return values.isEnabled && payload !== null;
    },
    // Transform payload
    withPayload: ({ payload :{id}) => {
      return { id, nextId: id+1) };
    },
  },
]
```

### Managing Children Instances With Keys

```typescript
type ListContract = {
    state: { nextId: number };
    values: { itemCount: number };
    events: {
        addItem: { payload: string };
        removeItem: { payload: string };
    };
    children: {
        items: ItemContract;
    };
};

export const listDef: ComponentDef<ListContract> = {
    initialState: {nextId: 0},

    // Initial children keys
    initialChildrenKeys: {
        items: [], // Start with no items
    },

    updaters: {
        addItem: ({state, childrenKeys, payload}) => {
            const newId = String(state.nextId);
            state.nextId += 1;

            // 🔧 Mutate childrenKeys to add child
            childrenKeys.items.push(newId);
        },

        removeItem: ({childrenKeys, payload}) => {
            // 🔧 Mutate childrenKeys to remove child
            const index = childrenKeys.items.indexOf(payload);
            if (index > -1) {
                childrenKeys.items.splice(index, 1);
            }
        },
    },

    childrenComponents: {
        items: itemDef,
    },
};
```

## 🎯 Complete Examples 

- [app with a most basic component](./packages/examples/basic-example-counter)
- [app with several components, event forwarding, listening and commands](./packages/examples/complete-example-shopping-list)

## 🏗️ Monorepo Structure

```
softer-components/
├── packages/
│   ├── types/                    # ☁️ Core type definitions
│   │   ├── src/
│   │   │   └── softer-component-types.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── utils/                    # 🛠️ Utility functions
│   │   ├── src/
│   │   │   ├── reducer.ts       # State update logic
│   │   │   ├── state.ts         # State tree utilities
│   │   │   └── predicate.functions.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── redux-adapter/            # 🎯 Redux integration
│   │   ├── src/
│   │   │   ├── softer-store.ts  # Redux store setup
│   │   │   ├── softer-hooks.ts  # React hooks
│   │   │   └── mappers.ts       # Redux mappers
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── examples/
│       └── complete-example-shopping-list/
│           └── src/
│               ├── components/
│               │   ├── list/
│               │   └── item-row/
│               └── main.tsx
├── .github/
│   └── copilot-instructions.md
├── package.json                  # Root workspace config
├── pnpm-workspace.yaml
└── tsconfig.json                 # Root project references
```

## 🔧 API Reference

### Core Types

#### `ComponentContract`

```typescript
type ComponentContract = {
  state: OptionalValue;
  values: ComponentValuesContract;
  events: ComponentEventsContract;
  children: ComponentChildrenContract;
};
```

#### `ComponentDef<TComponentContract>`

```typescript
type ComponentDef<TComponentContract extends ComponentContract> = {
  initialState?: TComponentContract["state"];
  initialChildrenKeys?: ChildrenKeys<TComponentContract["children"]>;
  selectors?: {
    [K in keyof TComponentContract["values"]]: (
      state: TComponentContract["state"]
    ) => TComponentContract["values"][K];
  };
  uiEvents?: (keyof TComponentContract["events"])[];
  updaters?: {
    [K in keyof TComponentContract["events"]]?: (
      params: UpdaterParams
    ) => void | TComponentContract["state"];
  };
  eventForwarders?: InternalEventForwarders<TComponentContract>;
  childrenComponents?: {
    [K in keyof TComponentContract["children"]]: ComponentDef<
      TComponentContract["children"][K]
    >;
  };
  childrenConfig?: {
    [K in keyof TComponentContract["children"]]?: ChildConfig<
      TComponentContract,
      TComponentContract["children"][K]
    >;
  };
};
```

#### `Values<TComponentContract>`

Runtime interface for accessing component values:

```typescript
type Values<TComponentContract extends ComponentContract> = {
  values: {
    [K in keyof TComponentContract["values"]]: () => TComponentContract["values"][K];
  };
  children: ChildrenValues<TComponentContract>;
};
```

### Redux Adapter

#### `configureSofterStore(rootComponentDef)`

Creates a Redux store with Softer Components integration:

```typescript
const store = configureSofterStore(counterDef);
```

#### `useSofter<TComponentContract>(path)`

React hook for accessing component state, events, and children:

```typescript
const [values, events, children] = useSofter<CounterContract>("");
```

#### `useSofterSelectors<TValuesContract>(path)`

Hook for accessing only computed values:

```typescript
const values = useSofterSelectors<CounterContract["values"]>("");
```

#### `useSofterEvents<TEventsContract>(path)`

Hook for accessing only event dispatchers:

```typescript
const events = useSofterEvents<CounterContract["events"]>("");
```

#### `useSofterSingleChildrenPaths<TChildrenContract>(path)`

Hook for accessing only children's paths (first instance only), as a string that can be undefined:

```typescript
const children = useSofterSingleChildrenPaths<CounterContract["children"]>("");
```
#### `useSofterChildrenPaths<TChildrenContract>(path)`

Hook for accessing only children's paths, as arrays of strings:

```typescript
const children = useSofterChildrenPaths<CounterContract["children"]>("");
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License
See the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

If you have questions or need help, please open an issue on GitHub.

---
