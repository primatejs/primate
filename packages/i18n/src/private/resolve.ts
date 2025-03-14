import type Dictionary from "@rcompat/record/Dictionary";
import type Locale from "#Locale";

export default (locale: Locale, key: string, placeholders?: Dictionary<string>) => {
  const value = locale[key];

  if (value === undefined) {
    return key;
  }

  return Object.entries(placeholders ?? {}).reduce((string, [pkey, pvalue]) =>
    string.replaceAll(new RegExp(`\\{${pkey}\\}`, "gu"), () => pvalue), value);
};
