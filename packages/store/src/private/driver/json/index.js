import serve from "#driver/json/serve";

export default ({ database }) => ({ serve: serve({ database }) });
