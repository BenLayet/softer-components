import { State, Event } from "@softer-components/types";

export const OWN_STATE_KEY = "@";
export const CHILDREN_STATE_KEY = "#";
export type SingleChildState = StateTree;
export type CollectionChildState = Record<string, SingleChildState>;
export type ChildrenState = Record<
  string,
  SingleChildState | CollectionChildState
>;

export type StateTree = {
  [OWN_STATE_KEY]?: State;
  [CHILDREN_STATE_KEY]?: ChildrenState;
};
export type ComponentName = string;
export type ComponentKey = string;
export type PathSegment = [ComponentName, ComponentKey?];
export type ComponentPath = PathSegment[];

export type GlobalEvent = Event & {
  componentPath: ComponentPath;
};
