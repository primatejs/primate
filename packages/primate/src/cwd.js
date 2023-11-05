import { Path } from "rcompat/fs";

export default (meta, up = 1) => new Path(meta.url).up(up);
