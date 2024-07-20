import { renderToString } from "solid-js/web";

export default (component, props) => {
  const heads = [];
  const push_heads = sub_heads => {
    heads.push(...sub_heads);
  };
  const body = renderToString(() => component({ ...props, push_heads }));

  if (heads.filter(head => head.startsWith("<title")).length > 1) {
    const error = "May only contain one <title> across component hierarchy";
    throw new Error(error);
  }
  const head = heads.join("\n");

  return { body, head };
};
