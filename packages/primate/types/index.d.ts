declare module 'primate' {
	function _default(command: any): Promise<any>;
	export default _default;
	export type ResponseFn = ResponseFn_1;
	export type MinOptions = MinOptions_1;
	export type ErrorOptions = ErrorOptions_1;
	export type Options = Options_1;
	export function text(body: any, options: any): (app: any) => any;
	export function json(body: any, options: any): (app: any) => any;
	export function stream(body: any, options: any): (app: any) => any;
	/**
	 * Redirect request
	 * @param Location location to redirect to
	 * @param options handler options
	 * */
	export function redirect(Location: string, { status }?: MinOptions): ResponseFn;
	/**
	 * Render an error page
	 * @param body replacement for %body%
	 * @param options rendering options
	 * */
	export function error(body?: string, { status, page }?: ErrorOptions): ResponseFn;
	/**
	 * Render a HTML component, extracting <script> and <style> tags
	 * @param name component filename
	 * @param options rendering options
	 * */
	export function html(name: string, options: MinOptions): ResponseFn;
	/**
	 * Render a component using handler for the given filename extension
	 * @param name component filename
	 * @param props props passed to component
	 * @param options rendering options
	 * */
	export function view(name: string, props: object, options: object): ResponseFn;
	export function ws(implementation: any): ({ server }: {
		server: any;
	}, _: any, { original }: {
		original: any;
	}) => any;
	export function sse(body: any, options: any): (app: any) => any;
	export class Logger {
		static err(errors: any, module: any): any;
		static get Error(): number;
		static get Warn(): number;
		static get Info(): number;
		constructor({ level, trace }?: {
			level?: number | undefined;
			trace?: boolean | undefined;
		});
		get level(): number;
		info(...args: any[]): void;
		warn(...args: any[]): void;
		error(...args: any[]): void;
		auto(error: any): any;
		#private;
	}
  type App = any;

  interface MinOptions_1 {
	status: number;
	headers: Headers | {};
  }
	
  interface ErrorOptions_1 extends MinOptions_1 {
	page: string;
  }

  interface Options_1 extends ErrorOptions_1 {
	placeholders: {};
  }

  type ResponseFn_1 = (app: App, ...rest: any) => Response;
}

//# sourceMappingURL=index.d.ts.map