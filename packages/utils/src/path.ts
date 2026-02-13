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
export function normalizeContextPath(path: string): string {
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
