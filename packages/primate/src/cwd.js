import { Path } from "runtime-compat/fs";

export default (meta, up = 1) => new Path(meta.url).up(up);
