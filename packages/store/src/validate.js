const normalize = string => string.trim() === "" ? undefined : string;

export default async ({driver, input, schema, strict}) =>
  Object.entries(schema).reduce(({errors, document}, [name, field]) => {
    const value = input[name];
    // skip empty fields if not in strict mode
    if (!strict && value === undefined) {
      return {errors, document};
    }

    try {
      // empty strings are considered undefind
      const normalized = typeof value === "string" ? normalize(value) : value;
      const validated = field.validate(normalized, driver);
      return {
        errors,
        document: {...document, [name]: validated},
      };
    } catch (error) {
      return {
        errors: {...errors, [name]: error.message},
        document,
      };
    }
  }, {errors: {}, document: {}});
