This package ngrx-adapter provides a set of utilities to integrate softer-components with NgRx.

## Installation

With pnpm:

```bash
pnpm install @softer-components/ngrx-adapter
```

## Usage

### Initialization

The `provideSofterState(softerNgRxConfig:SofterNgRxConfig)` can be used to bootstrap the application, allowing the adapter to be used throughout the app.
It can also be used in a `Route` provider or in the providers of a `Component`, to limit the scope.

The `softerNgRxConfig` must provide the root component definition, and optionally, a feature name (default is '☁️').

### Interaction with softer-components

When initialized the module provides the following:

#### Services

When initialized the module provides the following service with global scope:

- `SofterNgrxSelectors`: given a state path, it gets or creates a selector that can be used to select the state of a softer component from the NgRx store.
- `SofterNgrxDispatchers`: given a state path, it gets or creates a set of actions that can dispatched to update the state of the tree of softer component states in the NgRx store.

#### Effects

- `SofterNgrxEffects`:
  - forward events: listens for softer-component actions, and dispatches actions based on the forwarders of the components.
  - call softer effects: listens for softer-component actions, and calls the effects of the components

#### AbstractSofterComponent

- `AbstractSofterComponent`: your own angular component can extend this class
  - it takes an input for the state path of the softer component
  - it provides 3 constant fields to the html
    - `v`: the view, containing the result of the softer component selector
    - `e`: the events, containing the dispatchers for the softer component actions
    - `c`: the children, containing the state paths of the sub softer components
