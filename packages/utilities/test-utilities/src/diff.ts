// typescript
type DiffType = "added" | "removed" | "changed";
type DiffEntry<T extends DiffType = DiffType> = T extends "added"
  ? `added::new='${string}'`
  : T extends "removed"
    ? `removed::old='${string}'`
    : `changed::old='${string}';new='${string}'`;
type DiffResult = Record<string, DiffEntry>;

const isObject = (v: any) => v !== null && typeof v === "object";
const isPlainObject = (v: any) =>
  isObject(v) &&
  (v.constructor === Object || (Array.isArray(v) && v.constructor === Array));

export function diff(a: any, b: any): DiffResult {
  const result: DiffResult = {};

  function rec(pa: any, pb: any, path: string) {
    if (Object.is(pa, pb)) return;

    const paIsObj = isPlainObject(pa);
    const pbIsObj = isPlainObject(pb);

    if (paIsObj && pbIsObj) {
      // both arrays
      if (Array.isArray(pa) && Array.isArray(pb)) {
        const max = Math.max(pa.length, pb.length);
        for (let i = 0; i < max; i++) {
          rec(pa[i], pb[i], `${path}[${i}]`);
        }
        return;
      }

      // both plain objects
      const keys = new Set([
        ...Object.keys(pa || {}),
        ...Object.keys(pb || {}),
      ]);
      for (const k of keys) {
        const nextPath = path ? `${path}.${k}` : k;
        rec(pa ? pa[k] : undefined, pb ? pb[k] : undefined, nextPath);
      }
      return;
    }

    // types differ or primitives differ -> record change/add/remove
    if (pa === undefined && pb !== undefined) {
      result[path || "$"] = `added::new='${JSON.stringify(pb)}'`;
    } else if (pa !== undefined && pb === undefined) {
      result[path || "$"] = `removed::old='${JSON.stringify(pa)}'`;
    } else {
      result[path || "$"] =
        `changed::old='${JSON.stringify(pa)}';new='${JSON.stringify(pb)}'`;
    }
  }

  rec(a, b, "");
  return result;
}
