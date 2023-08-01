export default (component, props) => `
  import {hydrateRoot} from "react-dom/client";
  import React from "react";
  import * as components from "app";

  const data = JSON.parse(${JSON.stringify(JSON.stringify(props))});
  const component = components.${component};
  const is_class = component?.prototype instanceof React.Component;
  const create = (MaybeClass, props) => 
    is_class ? new MaybeClass(props) : MaybeClass(props);
  hydrateRoot(document.body, create(component, data));
`;
