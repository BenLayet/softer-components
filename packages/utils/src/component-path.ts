import { ComponentPath } from "./utils.type";

const COMPONENT_SEPARATOR = "/";
const KEY_SEPARATOR = ":";
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
    return [componentName, instanceKey ?? undefined] as const;
  });
}
export function eventNameWithoutComponentPath(globalEventName: string): string {
  return globalEventName.split(COMPONENT_SEPARATOR).pop();
}
