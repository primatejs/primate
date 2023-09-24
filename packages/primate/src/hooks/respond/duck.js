import { Headers } from "runtime-compat/http";

export const isResponse = value =>
  value.body !== undefined && value.headers instanceof Headers;
