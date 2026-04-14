# Basic Counter Example

A minimal demonstration of the Softer Components architecture showing how to create a state-manager-agnostic component with Angular/NgRx integration.

## Overview

This example showcases the core principles of Softer Components:

- **Pure component definition** - Business logic separated from UI framework
- **Type safety** - Full TypeScript support with strict mode
- ** Platform and state-manager agnostic** - Component definition is completely decoupled from Angular and NgRx.

## Architecture

### Component Definition (`counter.component.ts`)

The component definition contains all business logic and state management without any framework dependencies: [counter.component.ts](src/components/counter/counter.component.ts)

### UI Component (`counter.component.view.ts`)

* The Angular component is almost empty, only the template contains only presentation logic, retrieving typed event dispatchers and selectors:
* [counter.component.view.ts](src/components/counter/counter.component.view.ts)
* [counter.component.html](src/components/counter/counter.component.html)

#### event dispatchers

![Strongly Typed Events](docs/images/strongly-typed-events.png)

#### selectors

![Strongly Typed Selectors](docs/images/strongly-typed-selectors.png)

## Key Benefits

### 🎯 **Pure Business Logic**

- Component definition has zero dependencies on Angular or NgRx (it is in fact identical to the redux example)
- Testable without any UI framework

### 🔒 **Type Safety**

- Full TypeScript inference from component definition
- No manual typing of selectors or event handlers
- Compile-time validation of state updates

### 🔄 **State-Manager Agnostic**

- Keep your business logic safe from evolutions of external libraries and frameworks
- Framework-independent component testing

### 🏗️ **Strict Architecture**

- Clear separation between business logic and presentation
- Predictable component structure

### Testing

The component definition can be tested independently of React:

## Running the Example

```bash
# install the dependencies
pnpm install

# Development server
pnpm dev
```

## File Structure

```
basic-example-counter/
├── src/
│   ├── components/
│   │   └── counter/
│   │       ├── counter.component.test.ts     # Platform agnostic tests
│   │       ├── counter.component.ts          # Pure component definition
│   │       ├── counter.component.html        # Angular HTML template
│   │       ├── counter.component.css         # Angular CSS styles
│   │       └── counter.component.view.ts     # Angular UI component
│   ├── app/
│   │   ├── app.config.ts     # Configures softer components with `provideSofterState`
│   │   ├── app.html          # App template, including the counter component
│   │   └── app.ts             # Angular application setup 
│   ├── main.ts                           # Angular application entry point
├── package.json
├── tsconfig.json
└── README.md
```

