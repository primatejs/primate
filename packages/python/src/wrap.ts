export default (code: string) => `
class Primate():
    @staticmethod
    def view(name, props = None, options = None):
        return {
            "handler": "view",
            "params": (name, props, options),
        }
    @staticmethod
    def redirect(location, options = None):
        return {
            "handler": "redirect",
            "params": (location, options),
        }
    @staticmethod
    def error(body, options = None):
        return {
            "handler": "error",
            "params": (body, options),
        }\n${code}`;
