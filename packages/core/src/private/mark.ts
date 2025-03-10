import bold from "@rcompat/cli/color/bold";
import type StringLike from "@rcompat/string/StringLike";

export default (format: string, ...params: string[]) => params.reduce((formatted, param, i) =>
  formatted.replace(`{${i}}`, bold(param)), format);

