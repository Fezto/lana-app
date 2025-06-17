module.exports = {
    lana: {
        input: {
            target: "http://127.0.0.1:8000/openapi.json"
        },
        output: {
            mode: "tags",
            target: "./src/api",
            schemas: "./src/api/schemas",
            client: "react-query",
            mock: false,

            // ← Aquí va el override, dentro de output
            override: {
                mutator: {
                    path: "./src/api/custom-instance.ts",
                    name: "customInstance",
                }
            }
        }
    }
};
