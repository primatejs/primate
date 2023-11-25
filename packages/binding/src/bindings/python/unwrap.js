import { from } from "rcompat/object";

const to_object = object_with_maps =>
  JSON.parse(JSON.stringify(object_with_maps, (_, value) =>
    value instanceof Map ? from(value.entries()) : value));

const normalize = response =>
  response instanceof Map ? from(response.entries()) : response;
const qualify = response => response.toJs?.() ?? response;

export const unwrap = response => normalize(qualify(response));

export { to_object };
