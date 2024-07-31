import bold from "@rcompat/cli/color/bold";

export default (format, ...params) => params.reduce((formatted, param, i) =>
  formatted.replace(`{${i}}`, bold(param)), format);

