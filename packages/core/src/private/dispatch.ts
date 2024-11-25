import is from "@rcompat/invariant/is";

export interface DispatchObject {
  get: (key: string) => unknown;
  json: () => unknown,
  toString: () => string;
  raw: unknown
}  

export default (object: Record<PropertyKey, unknown>, raw: unknown, cased = true): DispatchObject => {
  return Object.assign(Object.create(null), {
    get(key: string) {
      is(key).string();

      return object[cased ? key : key.toLowerCase()];
    },
    json(): unknown {
      return JSON.parse(JSON.stringify(object));
    },
    toString() {
      return JSON.stringify(object);
    },
    raw,
  } satisfies DispatchObject)
};
