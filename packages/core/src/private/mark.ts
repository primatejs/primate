import bold from "@rcompat/cli/color/bold";

export default (format: string, ...params: string[]) => params.reduce((formatted, param, i) =>
  formatted.replace(`{${i}}`, bold(param)), format);

