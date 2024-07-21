import depend from "@primate/store/base/depend";
import { name, dependencies } from "@primate/store/mongodb/common";

export default async () => {
  await depend(dependencies, name);
};
