import {router, json} from "primate";

router.alias("_id", "([0-9])+");

router.get("/user/view/_id", request => json`${{path: request.path}}`);

router.get("/user/edit/_id", request => json`${{path: request.path}}`);
