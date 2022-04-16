export const constructible = value => {
  try {
    Reflect.construct(String, [], value);
    return true;
  } catch (error) {
    return false;
  }
};

export const inconstructible_function = value =>
  typeof value === "function" && !constructible(value);
export const numeric = value => !isNaN(parseFloat(value)) && isFinite(value);
export const boolish = value => value === "true" || value === "false";
export const nullish = value => value === undefined || value === null;
