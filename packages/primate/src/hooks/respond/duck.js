import { Headers } from "rcompat/http";

export default value =>
  value.body !== undefined && value.headers instanceof Headers;
