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
      import { afterUpdate, setContext } from "poly";
      import context_name from "@primate/poly/context-name";

      export let components;
      export let data;
      export let request;
      export let context;
      export let update = () => undefined;

      setContext(context_name, context);

      afterUpdate(update);
    </script>
    ${body}
  `;
};
