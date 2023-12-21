export default (name, props) => `
  import * as components from "app";

  globalThis.customElements.define("p-wrap-with", class extends HTMLElement {
    connectedCallback() {
      this.attachShadow({ mode: "open" });

      const id = this.getAttribute("id");
      const wrapped = globalThis.registry[id];
      this.shadowRoot.appendChild(wrapped);
      wrapped.render();
      delete globalThis.registry[id];
    }
  });
  globalThis.registry = {};

  const element = globalThis.document.createElement("${name}");
  element.props = ${JSON.stringify(props)};
  globalThis.document.body.appendChild(element)
  element.render();
`;
