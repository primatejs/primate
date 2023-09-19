export default length => {
  const n = length - 1;
  const body = Array.from({length: n}, (_, i) => i - 1)
    .reduceRight((child, _, i) => `components[${i + 1}] !== undefined
        ? createElement(components[${i}], {...data[${i}]}, ${child})
        : createElement(components[${i}], {...data[${i}]})
    `, `createElement(components[${n}], {...data[${n}]})`);

  return `
    import {createElement} from "react";
    import {ReactHeadContext, is} from "@primate/frontend";
    const {Provider} = ReactHeadContext;

    export default ({components, data, push_heads: value}) =>
      is.client ? ${body} : createElement(Provider, {value}, ${body});
  `;
};
