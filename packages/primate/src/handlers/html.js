import {Response, Status, MediaType} from "runtime-compat/http";

const script_re = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style_re = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;
const remove = /<(?<tag>script|style)>.*?<\/\k<tag>>/gus;

export default (name, options = {}) => {
  const {status = Status.OK, partial = false} = options;

  return async app => {
    const html = await app.path.components.join(name).text();
    const scripts = await Promise.all([...html.matchAll(script_re)]
      .map(({groups: {code}}) => app.inline(code, "module")));
    const styles = await Promise.all([...html.matchAll(style_re)]
      .map(({groups: {code}}) => app.inline(code, "style")));
    const assets = [...scripts, ...styles];

    const body = html.replaceAll(remove, _ => "");
    const head = assets.map(asset => asset.head).join("\n");
    const script = scripts.map(asset => asset.csp).join(" ");
    const style = styles.map(asset => asset.csp).join(" ");
    const headers = {script, style};

    return new Response(partial ? body : await app.render({body, head}), {
      status,
      headers: {...app.headers(headers), "Content-Type": MediaType.TEXT_HTML},
    });
  };
};
