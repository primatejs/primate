export default length => {
  const n = length - 1;
  const body = Array.from({ length: n }, (_, i) => i - 1)
    .reduceRight((child, _, i) => `components[${i + 1}] !== undefined
        ? createComponent(components[${i}], {request, ...data[${i}], 
            children: ${child}})
        : createComponent(components[${i}], {request, ...data[${i}]})
    `, `createComponent(components[${n}], {request, ...data[${n}]})`);

  return `
    import {createComponent} from "solid-js/web";
    import {HeadContext, is} from "@primate/frontend/solid";

    const Provider = HeadContext.Provider;

    export default ({components, data, request, push_heads: value}) =>
      is.client ? ${body} : <Provider value={value}>{${body}}</Provider>;
  `;
};
