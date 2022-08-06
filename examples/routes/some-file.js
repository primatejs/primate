import {router, json} from "primate";

// on matching the exact pathname /, returns {"foo": "bar"} as JSON
router.get("/", () => json`${{foo: "bar"}}`);
