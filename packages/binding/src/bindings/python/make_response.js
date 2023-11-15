import { from } from "rcompat/object";

export default response => {
  const js = response.toJs?.() ?? response;
  return js instanceof Map ? from(js.entries()) : js;
};
