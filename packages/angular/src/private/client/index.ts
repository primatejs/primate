import type Props from "@primate/frontend/Props";

export default ({ component, props }: { component: string, props: Props}) => `
  import { bootstrapApplication, provideClientHydration } from "app";
  import * as components from "app";

  const config = { providers: [provideClientHydration()] };

  const rendered = components.root_angular(components.${component},
    ${JSON.stringify(props)});

  bootstrapApplication(rendered, config)
    .catch(error => console.error(error));`;
