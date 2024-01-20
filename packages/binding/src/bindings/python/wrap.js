import { File } from "rcompat/fs";

const wrap = await new File(import.meta.url).directory.join("wrap.py").text();

export default code => `${wrap}\n${code}`;
