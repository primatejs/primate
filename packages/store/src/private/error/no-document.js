import { warn } from "#error";

export default warn(import.meta.url, {
  message: "no document found with primary key {0}={1}",
  fix: "check first for existence with {2} or use {3}",
});
