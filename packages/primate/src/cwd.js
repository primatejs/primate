import { File } from "rcompat/fs";

export default (meta, up = 1) => new File(meta.url).up(up);
