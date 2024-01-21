export default name => `import implementation from "./${name}.webc.impl.js";

globalThis.customElements.define("${name}", implementation);

export default implementation;`;
