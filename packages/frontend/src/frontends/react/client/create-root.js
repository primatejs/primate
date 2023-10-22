export default length => {
  const n = length - 1;
  const body = Array.from({ length: n }, (_, i) => i - 1)
    .reduceRight((child, _, i) => `components[${i + 1}] !== undefined
        ? createElement(components[${i}], {request, ...data[${i}]}, ${child})
        : createElement(components[${i}], {request, ...data[${i}]})
    `, `createElement(components[${n}], {request, ...data[${n}]})`);

  return `
    import {createElement} from "react";
    import {HeadContext, is} from "@primate/frontend/react";
    const {Provider} = HeadContext;

    export default ({components, data, request, push_heads: value}) =>
      is.client ? ${body} : createElement(Provider, {value}, ${body});
  `;
};
