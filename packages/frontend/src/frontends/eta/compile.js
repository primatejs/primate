import { Eta } from "eta";
const eta = new Eta();

export default {
  server(text) {
    return `
      import { Eta } from "eta";
      const eta = new Eta();

      ${eta.compile(text).toString()}

      export default (props, options) => anonymous.call(eta, props, options);
    `;
  },
};
