export default (length, data) => {
  const n = length - 1;
  const body = Array.from({length: n}, (_, i) => i - 1)
    .reduceRight((child, _, i) => `
      {#if components[${i + 1}]}
        <svelte:component this={components[${i}]} ${data}={data[${i}]}>
          ${child}
        </svelte:component>
      {:else}
        <svelte:component this={components[${i}]} ${data}={data[${i}]} />
      {/if}
    `, `<svelte:component this={components[${n}]} ${data}={data[${n}]} />`);

  return `
    <script>
      import {afterUpdate} from "svelte";
      export let components;
      export let data;
      export let update = () => undefined;

      afterUpdate(update);
    </script>
    ${body}
  `;
};
