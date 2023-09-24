const normalize = string => string.trim() === "" ? undefined : string;

export default async ({ types, input, schema, strict }) =>
  Object.entries(schema).reduce(({ errors, document }, [name, field]) => {
    const value = input[name];
    // skip empty fields if not in strict mode
    if (!strict && value === undefined) {
      return { errors, document };
    }

    try {
      // empty strings are considered undefined
      const normal = typeof value === "string" ? normalize(value) : value;
      // null signals *removal* to the driver
      const validated = !strict && value === null
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
  }, { errors: {}, document: {} });
