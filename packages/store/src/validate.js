import modes from "./modes.js";
const normalize = string => string.trim() === "" ? undefined : string;

const is_strict = mode => mode === modes.strict;
const is_loose = mode => !is_strict(mode);

export default async ({ types, input, schema, mode }) =>
  Object.entries(schema).reduce(({ errors, document }, [name, field]) => {
    const value = input[name];
    // skip empty fields if not in strict mode
    if (is_loose(mode) && value === undefined) {
      return { errors, document };
    }

    try {
      // empty strings are considered undefined
      const normal = typeof value === "string" ? normalize(value) : value;
      // null signals *removal* to the driver
      const validated = is_loose(mode) && value === null
        ? null : field.validate(normal, types);
      return {
        errors,
        document: { ...document, [name]: validated },
      };
    } catch (error) {
      return {
        errors: { ...errors, [name]: error.message },
        document,
      };
    }
  }, { errors: {}, document: is_loose(mode) ? input : {} });
