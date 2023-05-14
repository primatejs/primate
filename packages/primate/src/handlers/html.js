const match = /(?<=<script)>(?<code>.*?)(?=<\/script>)/gus;

const integrate = async (html, publish, headers) => {
  const scripts = await Promise.all([...html.matchAll(match)]
    .map(({groups: {code}}) => publish({code, inline: true})));
  for (const integrity of scripts) {
    headers["Content-Security-Policy"] = headers["Content-Security-Policy"]
      .replace("script-src 'self' ", `script-src 'self' '${integrity}' `);
  }
  return html.replaceAll(/<script>.*?<\/script>/gus, () => "");
};

export default (component, flags = {}) => {
  const {status = 200, partial = false, load = false} = flags;

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
