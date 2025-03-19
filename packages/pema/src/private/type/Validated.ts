import ValidatedKey from "#type/ValidatedKey";

export default abstract class ValidatedType<StaticType> {
  get [ValidatedKey]() {
    return "ValidatedKey";
  }

  get infer() {
    return undefined as StaticType;
  }

  abstract get name(): string;

  abstract validate(x: unknown, key?: string): StaticType;
}
