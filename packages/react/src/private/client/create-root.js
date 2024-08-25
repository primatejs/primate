export default length => {
  const n = length - 1;
  const body = Array.from({ length: n }, (_, i) => i - 1)
    .reduceRight((child, _, i) => `components[${i + 1}] !== undefined
        ? createElement(components[${i}], {request, ...data[${i}]}, ${child})
        : createElement(components[${i}], {request, ...data[${i}]})
    `, `createElement(components[${n}], {request, ...data[${n}]})`);

  return `
    import { createElement, useState, useEffect } from "react";
    import AppContext from "@primate/react/context/app";
    import HeadContext from "@primate/react/context/head";
    import platform from "@primate/react/platform";

    export default ({
      components,
      data: data$,
      subscribers,
      request,
      context: c,
      push_heads: value,
    }) => {
      const [context, setContext] = useState(c);
      const [data, setData] = useState(data$);

      useEffect(() => {
        const ws = new WebSocket("ws://localhost:6161/$live");
        const ids = Object.keys(subscribers);

        ws.addEventListener("open", () => {
          ws.send(JSON.stringify({name: "subscribe", ids}));
        });
        ws.addEventListener("message", message => {
          const updates = JSON.parse(message.data);
          setData(olddata => {
            const newdata = [...olddata];

            for (const { id, val } of updates) {
              const { position, prop } = subscribers[id];
              newdata[position][prop] = val;
            }
            return newdata;
          });
        })
      }, []);
      const $value = { context, setContext };
      return platform === "browser"
        ? createElement(AppContext.Provider, { value: $value }, ${body})
        : createElement(AppContext.Provider, { value: $value },
            createElement(HeadContext.Provider, { value }, ${body}))
      ;
    }
  `;
};
