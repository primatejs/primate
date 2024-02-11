export default length => {
  const n = length - 1;
  const body = Array.from({ length: n }, (_, i) => i - 1)
    .reduceRight((child, _, i) => `
      {#if components[${i + 1}]}
        <svelte:component this={components[${i}]} {request} {...data[${i}]}>
          ${child}
        </svelte:component>
      {:else}
        <svelte:component this={components[${i}]} {request} {...data[${i}]}/>
      {/if}
    `, `<svelte:component this={components[${n}]} {request} {...data[${n}]}/>`);

  return `
    <script>
      import { afterUpdate, setContext, onMount } from "svelte";
      import context_name from "@primate/svelte/context-name";

      export let components;
      export let data;
      export let request;
      export let context;
      export let update = () => undefined;
      export let subscribers;

      setContext(context_name, context);

      onMount(() => {
        const ws = new WebSocket("ws://localhost:6161/$live");
        const ids = Object.keys(subscribers);

        ws.addEventListener("open", () => {
          ws.send(JSON.stringify({name: "subscribe", ids}));
        });
        ws.addEventListener("message", message => {
          const updates = JSON.parse(message.data);
          for (const { id, val } of updates) {
            const { position, prop } = subscribers[id];
            data[position][prop] = val;
          }
        })
      });

      afterUpdate(update);
    </script>
    ${body}
  `;
};
