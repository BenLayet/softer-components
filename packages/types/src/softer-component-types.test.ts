import {
  ChildDef,
  ComponentDef,
  ForParentContract,
  SingleChildDef,
  SingleChildFactory,
} from "../dist";

let ignore;
const initialState = { count: 0 };
type MyState = typeof initialState;

const childDef: ComponentDef<
  MyState,
  { incrementRequested: { payload: undefined } },
  undefined
> = {
  initialState: () => initialState,
  stateUpdaters: {
    incrementRequested: (state: MyState) => ({
      ...state,
      count: state.count + 1,
    }),
  },
};
type MyComponentDef = typeof childDef;

const child1: SingleChildDef<undefined, {}, MyComponentDef> = childDef;
ignore = child1;
const child2: ChildDef<undefined, {}, MyComponentDef> = childDef;
ignore = child2;
const child3: SingleChildFactory<undefined, undefined> = {};
ignore = child3;
const childAsComponentDef: MyComponentDef = childDef;
ignore = childAsComponentDef;

/* WithChildListeners<TState, TEventsContract, TForParentContract["events"]> & // but their contract need to match parent's listeners and commands
WithChildCommands<TState, TEventsContract, TForParentContract["events"]>; */
const componentDef: ComponentDef<undefined, {}, undefined> = {
  children: {
    child1,
  },
};
