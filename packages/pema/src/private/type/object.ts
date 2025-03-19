import type Infer from "#type/Infer";
import Validated from "#type/Validated";
import is_validated_type from "#type/is_validated_type";
import notdefined from "#type/undefined";
import type Dictionary from "@rcompat/record/Dictionary";
import schema, { type Schema } from "#type/schema";

export interface ObjectProperties {
  readonly [k: string]: Validated<unknown> | ObjectProperties;
};

type InferObject<Properties extends ObjectProperties, Result = {
  [K in keyof Properties]:
    Properties[K] extends Validated<unknown>
      ? Infer<Properties[K]>
      : Properties[K] extends ObjectProperties
        ? InferObject<Properties[K]>
        : never
}> = Result;

const error_key = (name: unknown, key?: string) => {
  return key === undefined
    ? `.${name}`
    : `${key}.${name}]`;
}

const is = <T>(x: unknown, validator: (t: unknown) => boolean): x is T => validator(x);

class ObjectType<Properties extends ObjectProperties>
  extends Validated<InferObject<Properties>> {
  #properties: Properties;

  constructor(properties: Properties) {
    super();
    this.#properties = properties;
  }

  get name() {
    return "object";
  }

  validate(x: unknown, key?: string): Infer<this> {
    if (!is<Dictionary>(x, _ => !!x && typeof _ === "object")) {
      throw new Error(`expected object, got \`${x}\` (${typeof x})`);
    }

    Object.entries(this.#properties).forEach(([k, v]) => {
      const validator = is_validated_type(v) ? v : schema(v as Schema);
      validator.validate(x[k], error_key(k, key));
    });

    const length = Object.keys(this.#properties).length;
    
    Object.entries(x).slice(length).forEach(([k, v]) => {
      notdefined.validate(v, `${error_key(k)}`);
    });

    return x as never;
  }
}

export default <Properties extends ObjectProperties>(properties: Properties) => new ObjectType(properties);
