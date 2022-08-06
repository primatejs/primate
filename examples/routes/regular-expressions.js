import {router, json} from "primate";

router.get("/user/view/([0-9])+", request => json`${{path: request.path}}`);
// accessing /user/view/1234 -> {"path":["site","login","1234"]}
// accessing /user/view/abcd -> error 404
