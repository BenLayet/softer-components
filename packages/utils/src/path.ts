type ComponentName = string;
type ChildKey = string;
export type ChildrenKeys = Record<string, string[]>;
export type StatePathSegment = [ComponentName, ChildKey];
export type StatePath = StatePathSegment[];
export const COMPONENT_SEPARATOR = "/";
export const KEY_SEPARATOR = ":";
export const SINGLE_CHILD_KEY = "0";

/**
 * Converts a state path to a string representation that can be used in event names or as keys in maps.
 * @param statePath
 * @returns string representation of the state path, with component names separated with "/" and keys separated by ":". Starts with a "/" but does not end with a "/". For example: "/ComponentA:instance1/ComponentB/ComponentC:instance2"
 */
export function statePathToString(statePath: StatePath): string {
  return statePath
    .map(([componentName, instanceKey]) =>
      instanceKey
        ? `${COMPONENT_SEPARATOR}${componentName}${KEY_SEPARATOR}${instanceKey}`
        : `${COMPONENT_SEPARATOR}${componentName}`,
    )
    .join("");
}

/**
 * Converts a string representation of a state path back to a StatePath.
 * The string is typically in the format produced by statePathToString.
 * For example: "/ComponentA:instance1/ComponentB/ComponentC:instance2"
 * but ":0" can be omitted for single child components, so "/ComponentA/ComponentB/ComponentC" is also valid and will be parsed as if it were "/ComponentA:0/ComponentB:0/ComponentC:0"
 * @param statePathStr
 */
export function stringToStatePath(statePathStr: string): StatePath {
  const parts = statePathStr.split(COMPONENT_SEPARATOR);
  parts.shift(); // remove prefix
  return parts.map(part => {
    const [componentName, instanceKey] = part.split(KEY_SEPARATOR);
    return [componentName, instanceKey ?? SINGLE_CHILD_KEY] as const;
  });
}

/**
 * Computes a new state path by applying a relative path to a given state path.
 * @param statePath
 * @param relativePathString a string representation of a relative path, using "../" to go back up one level, "./" is ignored, and otherwise the same as statePathStr returned by componentPathToString.
 * @returns the new state path.
 */
export function computeRelativePath(
  statePath: StatePath,
  relativePathString: string,
): StatePath {
  const normalizedRelativePathString = normalizePath(
    `${statePathToString(statePath)}/${relativePathString}`,
  );
  return stringToStatePath(normalizedRelativePathString);
}

/**
 * Converts a state path to a component path string,
 * which is the same as the string representation of the state path but without the keys.
 *
 * For example, if the state path is "/ComponentA:instance1/ComponentB/ComponentC:instance2",
 * the component path will be "/ComponentA/ComponentB/ComponentC".
 * @param statePath
 */
export function statePathToComponentPath(statePath: StatePath): string {
  return statePath
    .map(([componentName]) => `${COMPONENT_SEPARATOR}${componentName}`)
    .join("");
}

/**
 * Checks if a state path starts with a given prefix path.
 * @param statePath
 * @param prefix
 */
export function statePathStartsWith(
  statePath: StatePath,
  prefix: StatePath,
): boolean {
  if (prefix.length > statePath.length) {
    return false;
  }
  return prefix.every(
    (part, i) => statePath[i][0] === part[0] && statePath[i][1] === part[1],
  );
}
/**
 * Normalize a unix-like path string resolving '.' and '..' segments.
 *
 * Examples:
 *  - '/a/b/../c' -> '/a/c'
 *  - '/a/./b' -> '/a/b'
 *  - 'a/b/../c' -> 'a/c'
 *  - '/' -> '/'
 *  - '' -> ''
 *
 * The function preserves leading '/' (absolute paths) and trailing '/' only when
 * the path is exactly '/'. It treats consecutive slashes as a single separator.
 */
export function normalizePath(path: string): string {
  if (path === "") return "";

  const isAbsolute = path.startsWith("/");
  const parts = path.split(/\/+/);

  const stack: string[] = [];

  for (const raw of parts) {
    if (raw === "" || raw === ".") {
      // skip empty (from leading/trailing or multiple slashes) and current dir
      continue;
    }
    if (raw === "..") {
      if (stack.length > 0 && stack[stack.length - 1] !== "..") {
        stack.pop();
      } else if (!isAbsolute) {
        // relative path can grow .. beyond root
        stack.push("..");
      }
    } else {
      stack.push(raw);
    }
  }

  const result = (isAbsolute ? "/" : "") + stack.join("/");
  return result === "" && isAbsolute ? "/" : result;
}
