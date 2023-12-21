export default name => `import * as impl from "./${name}.webc.impl.js";

globalThis.customElements.define("${name}", class extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
  }

  render() {
    this.shadowRoot.innerHTML = impl.default(this.props);
    impl.mounted?.(this.shadowRoot);
  }
});

export default props => {
  const element = globalThis.document.createElement("${name}");
  const uuid = crypto.randomUUID();
  element.props = props;
  globalThis.registry[uuid] = element;
  return \`<p-wrap-with id="\${uuid}"></p-wrap-with>\`;
}`;
