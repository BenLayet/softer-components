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
## Monorepo packages

- `packages/types`: core type system (`ComponentContract`, `ComponentDef`, events, paths, etc.)
- `packages/utils`: runtime engine (reducer helpers, event forwarding, effects orchestration)
- `packages/redux-adapter`: Redux store and React hooks
- `packages/ngrx-adapter`: NgRx providers and Angular base component
- `packages/examples`: Redux and NgRx sample apps

## 🧠 Core Concepts


### Component contract (`ComponentContract`)

The contract is the public interface of a component type.

- `values?`: values exposed by selectors
- `events?`: event names, payloads, and UI-dispatchable events
- `children?`: child component contracts
- `context?`: context component contracts

### Component definition (`ComponentDef<TContract, TState>`)

- `initialState`
- `selectors`
- `allEvents`, `uiEvents`
- `stateUpdaters`, `childrenUpdaters`
- `eventForwarders`
- `effects`
- `childrenComponentDefs`, `childrenConfig`, `initialChildren`
- `contextsDef`, `contextsConfig`

### Event flow

When an event occurs, the runtime can:

1. run updaters
2. generate the event chain (forwarded/listener/command events)
3. run effects
4. dispatch generated events

This keeps business logic declarative and composable.


## 📦 Installation

```bash
pnpm add @softer-components/types
```

If you use React + Redux:

```bash
pnpm add @softer-components/redux-adapter react-redux @reduxjs/toolkit
```

If you use Angular + NgRx:

```bash
pnpm add @softer-components/ngrx-adapter @ngrx/store @ngrx/effects @ngrx/operators rxjs
```

## Quick start (React + Redux)

### 1) Define contract and definition

```ts
import { ComponentDef, EventsContract } from "@softer-components/types";
import { createBaseSelectors } from "@softer-components/utils";

const initialState = { count: 0 };
type State = typeof initialState;

const allEvents = ["incrementRequested", "decrementRequested"] as const;
type CounterEvents = EventsContract<typeof allEvents>;

export type CounterContract = {
  values: { count: number };
  events: CounterEvents;
};

export const counterDef: ComponentDef<CounterContract, State> = {
  initialState,
  selectors: createBaseSelectors(initialState),
  allEvents,
  uiEvents: allEvents,
  stateUpdaters: {
    incrementRequested: ({ state }) => {
      state.count++;
    },
    decrementRequested: ({ state }) => {
      state.count--;
    },
  },
};
```

### 2) Create store

```ts
import { configureSofterStore } from "@softer-components/redux-adapter";

export const store = configureSofterStore(counterDef);
```

### 3) Use in a React component

```tsx
import { useSofter } from "@softer-components/redux-adapter";

export const Counter = ({ path = "" }: { path?: string }) => {
  const [{ count }, { incrementRequested, decrementRequested }] =
    useSofter<CounterContract>(path);

  return (
    <div>
      <div>{count}</div>
      <button onClick={() => decrementRequested()}>-</button>
      <button onClick={() => incrementRequested()}>+</button>
    </div>
  );
};
```

## Quick start (Angular + NgRx)

### 1) Provide softer state in app config

```ts
import { ApplicationConfig } from "@angular/core";
import { provideStore } from "@ngrx/store";
import { provideSofterState } from "@softer-components/ngrx-adapter";

import { appDef } from "./components/app";

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore(),
    ...provideSofterState({ rootComponentDef: appDef }),
  ],
};
```

### 2) Extend `AbstractSofterComponent`

```ts
import { Component } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { AbstractSofterComponent } from "@softer-components/ngrx-adapter";

import { CounterContract } from "./counter.component";

@Component({
  selector: "app-counter",
  templateUrl: "./counter.component.html",
  imports: [AsyncPipe],
})
export class CounterView extends AbstractSofterComponent<CounterContract> {}
```

In template, use:

- `v$ | async` for values
- `c$ | async` for children paths
- `e` for UI dispatchers

## Redux adapter API

Exports from `@softer-components/redux-adapter`:

- `configureSofterStore`
- `useSofter`
- `useSofterSelectors`
- `useSofterEvents`
- `useSofterChildrenPaths`

Examples:

```ts
const [values, events, children] = useSofter<MyContract>("");
const valuesOnly = useSofterSelectors<MyContract>("");
const eventsOnly = useSofterEvents<MyContract>("");
const childrenOnly = useSofterChildrenPaths<MyContract>("");
```

## NgRx adapter API

Exports from `@softer-components/ngrx-adapter`:

- `provideSofterState`
- `AbstractSofterComponent`

## Examples

Redux examples:

- `packages/examples/redux/basic-example-counter`
- `packages/examples/redux/complete-example-shopping-list`

NgRx examples:

- `packages/examples/ngrx/basic-example-counter`
- `packages/examples/ngrx/complete-example-shopping-list`

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT. See `LICENSE`.

## 🙋‍♂️ Support

If you have questions or need help, please open an issue on GitHub.

---
