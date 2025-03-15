import type Validated from "#type/Validated";

type InferType<T extends Validated<unknown>> = T["infer"];

export { InferType as default };
