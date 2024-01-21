const ServerHTMLElement = class {};

const HTMLElement = globalThis.HTMLElement ?? ServerHTMLElement;

export default class WebComponent extends HTMLElement {
  constructor(props) {
    super();
    this.props = props;
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.innerHTML = this.render(this.props);
    this.mounted?.(this.shadowRoot);
  }

  toString() {
    const uuid = crypto.randomUUID();
    globalThis.registry[uuid] = this;
    return `<p-wrap-with id="${uuid}"></p-wrap-with>`;
  }
}

