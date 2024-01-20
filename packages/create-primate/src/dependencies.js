import { File } from "rcompat/fs";

const up = 2;
const { url } = import.meta;
const name = "package.json";

export default {
  ...(await new File(url).up(up).join(name).json()).devDependencies,
};
