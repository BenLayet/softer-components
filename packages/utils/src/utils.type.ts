import { Event } from "@softer-components/types";
type ComponentName = string;
type ComponentKey = string;
export type PathSegment = [ComponentName, ComponentKey];
export type ComponentPath = PathSegment[];
export type GlobalEvent<TEvent extends Event = Event> = TEvent & {
  componentPath: ComponentPath;
};
// contains state for the whole application,
// and each state of each component is stored inside it
// (as a map or tree or whatever structure the real state manager uses)
export type SofterRootState = {};
