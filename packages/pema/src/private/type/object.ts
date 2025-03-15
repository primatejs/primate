import type Infer from "#type/Infer";
import Validated from "#type/Validated";
import ValidatedKey from "#type/ValidatedKey";

interface ObjectProperties {
  readonly [k: string]: Validated<unknown> | ObjectProperties;
};

type InferObject<Properties extends ObjectProperties, Result = {
  [K in keyof Properties]:
    Properties[K] extends Validated<unknown>
      ? Infer<Properties[K]>
      : Properties[K] extends ObjectProperties
        ? Infer<ObjectType<Properties[K]>>
        : never
}> = Result;

function is_validated_type(x: unknown): x is Validated<unknown> {
  return !!x && typeof x === "object" && ValidatedKey in x;
}

class ObjectType<Properties extends ObjectProperties>
  extends Validated<InferObject<Properties>> {
  #properties: Properties;

  constructor(properties: Properties) {
    super();
    this.#properties = properties;
  }

  validate(x: unknown): Infer<this> {
    if (!(!!x && typeof x === "object")) {
      throw new Error("NOT AN OBJECT");
    }

    return Object.fromEntries(Object.entries(this.#properties).map(([k, v]) => {
      const validator = is_validated_type(v) ? v : new ObjectType(v);
        return [k, validator.validate((x as Record<PropertyKey, unknown>)[k], k)]
    })) as never;
  }
}

export default <Properties extends ObjectProperties>(properties: Properties):
  ObjectType<Properties> => new ObjectType(properties);
