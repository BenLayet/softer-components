import { ComponentPath } from "./utils.type";
import { assertIsNotUndefined } from "./predicate.functions";

const COMPONENT_SEPARATOR = "/";
const KEY_SEPARATOR = ":";
const SINGLE_CHILD_KEY = "0";
export function componentPathToString(componentPath: ComponentPath): string {
  return (
    COMPONENT_SEPARATOR +
    componentPath
      .map(([componentName, instanceKey]) =>
        instanceKey
          ? `${componentName}${KEY_SEPARATOR}${instanceKey}`
          : componentName,
      )
      .map((segment) => segment + COMPONENT_SEPARATOR)
      .join("")
  );
}

export function stringToComponentPath(pathString: string): ComponentPath {
  if (!pathString) {
    return []; // tolerates empty string as root path
  }

  const parts = pathString.split(COMPONENT_SEPARATOR);
  if (parts.length < 2) {
    throw new Error(`invalid component path string: '${pathString}'`);
  }
  parts.shift(); // remove prefix
  parts.pop(); // remove trailing empty part due to trailing separator
  return parts.map((part) => {
    const [componentName, instanceKey] = part.split(KEY_SEPARATOR);
    return [componentName, instanceKey ?? SINGLE_CHILD_KEY] as const;
  });
}
export function eventNameWithoutComponentPath(globalEventName: string): string {
  const eventName = globalEventName.split(COMPONENT_SEPARATOR).pop();
  assertIsNotUndefined(eventName);
  return eventName;
}
