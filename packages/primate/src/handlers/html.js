const script = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;
const style = /(?<=<style)>(?<code>.*?)(?=<\/style>)/gus;

const integrate = async (html, publish, headers) => {
  const scripts = await Promise.all([...html.matchAll(script)]
    .map(({groups: {code}}) => publish({code, inline: true})));
  for (const integrity of scripts) {
    headers["Content-Security-Policy"] = headers["Content-Security-Policy"]
      .replace("script-src 'self' ", `script-src 'self' '${integrity}' `);
  }
  const styles = await Promise.all([...html.matchAll(style)]
    .map(({groups: {code}}) => publish({code, type: "style", inline: true})));
  for (const integrity of styles) {
    headers["Content-Security-Policy"] = headers["Content-Security-Policy"]
      .replace("style-src 'self'", `style-src 'self' '${integrity}' `);
  }
  return html.replaceAll(/<(?<tag>script|style)>.*?<\/\k<tag>>/gus, _ => "");
};

export default (component, options = {}) => {
  const {status = 200, partial = false, load = false} = options;

  return async (app, headers) => {
    const body = await integrate(await load ?
      await app.paths.components.join(component).text() : component,
    app.publish, headers);

    return [partial ? body : await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    }];
  };
};
