import {Path} from "runtime-compat/fs";

export default await new Path(import.meta.url).up(1).join("statuses.json")
  .json();
