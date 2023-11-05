import { Path } from "rcompat/fs";

const up = 4;
const { url } = import.meta;
const name = "package.json";

export default {
  ...(await new Path(url).up(up).join(name).json()).peerDependencies,
};
