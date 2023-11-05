import { Headers } from "rcompat/http";

export const isResponse = value =>
  value.body !== undefined && value.headers instanceof Headers;
