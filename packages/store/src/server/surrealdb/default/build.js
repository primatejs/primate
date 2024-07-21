import depend from "@primate/store/base/depend";
import { dependencies, name } from "@primate/store/surrealdb/common";

export default async () => {
  await depend(dependencies, name);
};
