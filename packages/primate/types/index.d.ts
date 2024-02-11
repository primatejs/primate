declare module 'primate' {
	function _default(command: any): Promise<any>;
	export default _default;
	export function text(body: any, options: any): (app: any) => any;
	export function json(body: any, options: any): (app: any) => any;
	export function stream(body: any, options: any): (app: any) => any;
	export function redirect(Location: any, { status }?: {
		status?: any;
	}): (app: any) => any;
	export function error(body?: string, { status, page }?: {
		status?: any;
		page: any;
	}): (app: any) => any;
	export function html(name: any, options: any): (app: any) => Promise<any>;
	/**
	 * Render a component using handler for the given filename extension
	 * @param name component filename
	 * @param props props passed to component
	 * @param options rendering options
	 */
	export function view(name: string, props: object, options: object): (app: any, ...rest: any[]) => any;
	export function ws(implementation: any): ({ server }: {
		server: any;
	}, _: any, { original }: {
		original: any;
	}) => any;
	export function sse(body: any, options: any): (app: any) => any;
}

//# sourceMappingURL=index.d.ts.map