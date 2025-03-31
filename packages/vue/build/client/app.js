new EventSource("/esbuild").addEventListener("change",
        () => globalThis.location.reload());
