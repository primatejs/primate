class Primate():
    @staticmethod
    def view(name, props = None, options = None):
        return {
            "__handler__": "view",
            "name": name,
            "props": props,
            "options": options,
        }
    @staticmethod
    def redirect(location, options = None):
        return {
            "__handler__": "redirect",
            "options": options,
        }
    @staticmethod
    def error(body, options = None):
        return {
            "__handler__": "error",
            "body": body,
            "options": options,
        }
