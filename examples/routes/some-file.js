import {json} from "primate";

export default router => {
  // on matching the exact pathname /, returns {"foo": "bar"} as JSON
  router.get("/", () => json`${{foo: "bar"}}`);
};
