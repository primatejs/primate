export default length => {
  const n = length - 1;
  const body = Array.from({ length: n }, (_, i) => i - 1)
    .reduceRight((child, _, i) => `components[${i + 1}] !== undefined
        ? createElement(components[${i}], {request, ...data[${i}]}, ${child})
        : createElement(components[${i}], {request, ...data[${i}]})
    `, `createElement(components[${n}], {request, ...data[${n}]})`);

  return `
    import { createElement, useState } from "react";
    import AppContext from "@primate/frontend/react/context/app";
    import HeadContext from "@primate/frontend/react/context/head";
    import is from "@primate/frontend/react/context/is";

    export default ({
      components,
      data,
      request,
      context: c,
      push_heads: value,
    }) => {
      const [context, setContext] = useState(c);
      const $value = { context, setContext };
      return is.client
        ? createElement(AppContext.Provider, { value: $value }, ${body})
        : createElement(AppContext.Provider, { value: $value },
            createElement(HeadContext.Provider, { value }, ${body}))
      ;
    }
  `;
};
