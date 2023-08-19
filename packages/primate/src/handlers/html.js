import {Response, Status, MediaType} from "runtime-compat/http";

const script = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;
const remove = /<(?<tag>script|style)>.*?<\/\k<tag>>/gus;
const inline = true;

export default (name, options = {}) => {
  const {status = Status.OK, partial = false} = options;

  return async app => {
    const html = await app.path.components.join(name).text();
    await Promise.all([...html.matchAll(script)]
      .map(({groups: {code}}) => app.publish({code, inline})));
    await Promise.all([...html.matchAll(style)]
      .map(({groups: {code}}) => app.publish({code, type: "style", inline})));
    const body = html.replaceAll(remove, _ => "");
    // needs to happen before app.render()
    const headers = app.headers();

    return new Response(partial ? body : await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": MediaType.TEXT_HTML},
    });
  };
};
