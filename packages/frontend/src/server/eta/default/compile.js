import { Eta } from "eta";
const eta = new Eta();

export const server = text => `
  import { Eta } from "eta";
  const eta = new Eta();

  ${eta.compile(text).toString()}

  export default (props, options) => anonymous.call(eta, props, options);
`;
