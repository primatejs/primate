export default length => {
  const n = length - 1;
  const body = Array.from({ length: n }, (_, i) => i - 1)
    .reduceRight((child, _, i) => `components[${i + 1}] !== undefined
        ? createComponent(components[${i}], {request, ...data[${i}], 
            children: ${child}})
        : createComponent(components[${i}], {request, ...data[${i}]})
    `, `createComponent(components[${n}], {request, ...data[${n}]})`);

  return `
    import { createSignal } from "solid-js";
    import { createComponent } from "solid-js/web";
    import AppContext from "@primate/frontend/solid/context/app";
    import HeadContext from "@primate/frontend/solid/context/head";

    export default ({
      components,
      data,
      request,
      context: c,
      push_heads: value,
    }) => {
      const [context, setContext] = createSignal(c);
      const $value = { context, setContext };

      return <AppContext.Provider value={$value}>
          <HeadContext.Provider value={value}>
            {${body}}
          </HeadContext.Provider>
        </AppContext.Provider>
    }
  `;
};
