import { Path } from "rcompat/fs";

const wrap = await new Path(import.meta.url).directory.join("wrap.py").text();

export default code => `${wrap}\n${code}`;
