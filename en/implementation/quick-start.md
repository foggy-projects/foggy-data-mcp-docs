# Runtime Quick Deployment

## 1. Start the Launcher locally

The Launcher is the shortest local validation path and requires Java 17 or newer. The example pins `v0.1.17`; check the project release page before using it in a new environment.

```bash
mkdir foggy-runtime && cd foggy-runtime

curl -fLO https://github.com/foggy-projects/foggy-data-mcp-bridge/releases/download/foggy-runtime-launcher-v0.1.17/foggy-runtime-launcher-0.1.17.jar
curl -fLO https://github.com/foggy-projects/foggy-data-mcp-bridge/releases/download/foggy-runtime-launcher-v0.1.17/start-foggy-runtime.sh
curl -fLO https://github.com/foggy-projects/foggy-data-mcp-bridge/releases/download/foggy-runtime-launcher-v0.1.17/SHA256SUMS

grep -E 'foggy-runtime-launcher-0.1.17.jar|start-foggy-runtime.sh' SHA256SUMS | sha256sum -c -
chmod +x start-foggy-runtime.sh
./start-foggy-runtime.sh
```

Windows users can download `start-foggy-runtime.ps1` from the same release. The default URL is `http://127.0.0.1:18066`, with SQLite as the default local database.

> The default Launcher security mode is for development/test use. Do not expose it to the public internet or a production network without management authentication, business identity propagation, network controls, datasource secret protection, and auditing.

## 2. Probe the service

```bash
curl http://127.0.0.1:18066/readyz
curl http://127.0.0.1:18066/api/v1/capabilities
```

Use the capability response as the automation baseline. Record the Runtime API version, enabled features, and `securityMode`. If the deployment reports `auth-code`, Runtime API management calls must include `X-Foggy-Runtime-Code`.

For a new custom namespace, continue with [Runtime API and MCP Examples](./runtime-api-examples.md) to test the datasource, bind the namespace, validate the model, and refresh it; readiness alone does not make a model queryable.

## 3. Connect an MCP client

```json
{
  "mcpServers": {
    "foggy-ai-analysis": {
      "url": "http://127.0.0.1:18066/mcp/analyst/rpc",
      "headers": {
        "X-NS": "salesdrop"
      }
    }
  }
}
```

You can discover tools directly first:

```bash
curl -X POST http://127.0.0.1:18066/mcp/analyst/rpc \
  -H 'Content-Type: application/json' \
  -H 'X-NS: salesdrop' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

`X-NS` is the isolation axis. The client, Runtime API calls, and model resources must use the same namespace. Keep datasource passwords and management codes out of MCP client configuration.

## 4. Source integration boundary

The current source uses Java 17, Spring Boot 3.4.x, and `com.foggysource` coordinates; this manual uses the published `9.2.0` version. For customization, use the bridge repository's pom/BOM as the source-build contract.

For customization, build and run focused checks in the bridge repository before consuming the output from another application. Do not copy the historical `8.1.10.beta` snippets into a new integration.

## 5. AI and chart dependencies

- Structured MCP tools can run without a ChatModel/AI Provider.
- `dataset_nl.query` requires a compatible AI Provider; without one, use `dataset.query_model` or `dataset.compose_script`.
- `dataset.export_with_xchart` is JVM-native and does not require an external render service.
- `dataset.export_with_echarts` requires an available ECharts render service; do not use the retired `dataset.export_with_chart` name.

## 6. First delivery gate

After startup, capability discovery, namespace selection, datasource binding, model validate/refresh, and one `tools/list` response, move to query troubleshooting. Preserve request/trace IDs, namespace, generation, and error codes at every stage so startup, model, and query failures remain distinguishable.
