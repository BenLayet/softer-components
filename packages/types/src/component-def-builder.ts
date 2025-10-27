import {
  ChildrenDef,
  ComponentDef,
  EventForwarderDef,
  EventHandlers,
  Payloads,
  Selectors,
  EventHandlersToPayloads,
  EventHandlersToEvent,
  ChildrenDefToEvent,
  AnyComponentDef,
} from "./softer-component-types";

export const defaultComponentDef: ComponentDef<{}, {}, {}, {}> = {
  initialState: {},
  selectors: {},
  events: {},
  children: {},
  input: [],
  output: [],
};

const withOutput =
  <TComponentDef extends AnyComponentDef>(beingBuilt: TComponentDef) =>
  (
    output: EventForwarderDef<
      TComponentDef["initialState"],
      EventHandlersToEvent<TComponentDef["events"]>,
      ChildrenDefToEvent<TComponentDef["children"]>
    >[],
  ) => {
    const newBeingBuilt: TComponentDef = { ...beingBuilt, output };
    return {
      input: withInput(newBeingBuilt),
      build: () => newBeingBuilt,
    };
  };
const withInput =
  <TComponentDef extends AnyComponentDef>(beingBuilt: TComponentDef) =>
  (
    input: EventForwarderDef<
      TComponentDef["initialState"],
      ChildrenDefToEvent<TComponentDef["children"]>,
      EventHandlersToEvent<TComponentDef["events"]>
    >[],
  ) => {
    const newBeingBuilt: TComponentDef = { ...beingBuilt, input };
    return {
      output: withOutput(newBeingBuilt),
      build: () => newBeingBuilt,
    };
  };
const withChildren =
  <TComponentDef extends AnyComponentDef>(beingBuilt: TComponentDef) =>
  <TChildren extends ChildrenDef<TComponentDef["initialState"] & {}>>(
    children: TChildren,
  ) => {
    const newBeingBuilt: ComponentDef<
      TComponentDef["initialState"],
      TComponentDef["selectors"],
      EventHandlersToPayloads<TComponentDef["events"]>,
      TChildren
    > = { ...beingBuilt, children, input: [], output: [] };
    return {
      input: withInput(newBeingBuilt),
      output: withOutput(newBeingBuilt),
      build: () => newBeingBuilt,
    };
  };

const withEvents =
  <TComponentDef extends AnyComponentDef>(beingBuilt: TComponentDef) =>
  <TPayloads extends Payloads>(
    events: EventHandlers<TComponentDef["initialState"], TPayloads>,
  ) => {
    const newBeingBuilt: ComponentDef<
      TComponentDef["initialState"],
      TComponentDef["selectors"],
      TPayloads,
      TComponentDef["children"]
    > = { ...beingBuilt, events, input: [], output: [] };
    return {
      children: withChildren(newBeingBuilt),
      build: () => newBeingBuilt,
    };
  };

const withSelectors =
  <TComponentDef extends AnyComponentDef>(beingBuilt: TComponentDef) =>
  <TSelectors extends Selectors<TComponentDef["initialState"]>>(
    selectors: TSelectors,
  ) => {
    const newBeingBuilt: ComponentDef<
      TComponentDef["initialState"],
      TSelectors,
      EventHandlersToPayloads<TComponentDef["events"]>,
      TComponentDef["children"]
    > = { ...beingBuilt, selectors, input: [], output: [] };
    return {
      events: withEvents(newBeingBuilt),
      children: withChildren(newBeingBuilt),
      build: () => newBeingBuilt,
    };
  };

const withInitialState =
  <TComponentDef extends AnyComponentDef>(beingBuilt: TComponentDef) =>
  <TState extends TComponentDef["initialState"]>(initialState: TState) => {
    const newBeingBuilt: ComponentDef<
      TState,
      TComponentDef["selectors"],
      EventHandlersToPayloads<TComponentDef["events"]>,
      TComponentDef["children"]
    > = {
      ...beingBuilt,
      initialState,
      input: [],
      output: [],
    };
    return {
      children: withChildren(newBeingBuilt),
      events: withEvents(newBeingBuilt),
      selectors: withSelectors(newBeingBuilt), //TODO add default selectors
      build: () => newBeingBuilt,
    };
  };

export const componentDefBuilder = {
  initialState: withInitialState(defaultComponentDef),
  selectors: withSelectors(defaultComponentDef),
  events: withEvents(defaultComponentDef),
  children: withChildren(defaultComponentDef),
  build: () => defaultComponentDef,
};
