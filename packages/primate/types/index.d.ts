declare module 'primate' {
  export function view(name: string, props: object, options: object): 
    (app: any, ...rest: any) => Response
}
