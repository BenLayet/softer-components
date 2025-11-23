import { Event } from "@softer-components/types";

type ComponentName = string;
type ComponentKey = string;
export type PathSegment = [ComponentName, ComponentKey?];
export type ComponentPath = PathSegment[];
export type GlobalEvent = Event & {
  componentPath: ComponentPath;
};
