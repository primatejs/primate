import {Status, MediaType} from "runtime-compat/http";

const script = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;

const integrate = async (html, publish) => {
  await Promise.all([...html.matchAll(script)]
    .map(({groups: {code}}) => publish({code, inline: true})));
  await Promise.all([...html.matchAll(style)]
    .map(({groups: {code}}) => publish({code, type: "style", inline: true})));
  return html.replaceAll(/<(?<tag>script|style)>.*?<\/\k<tag>>/gus, _ => "");
};

export default (component, options = {}) => {
  const {status = Status.OK, partial = false, load = false} = options;

  return async app => {
    const body = await integrate(await load ?
      await app.paths.components.join(component).text() : component,
    app.publish);
    // needs to happen before app.render()
    const headers = app.headers();

    return [partial ? body : await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": MediaType.TEXT_HTML},
    }];
  };
};
