# 运行时快速部署

## 1. 使用 Launcher 本地启动

Launcher 是当前最短的本地验证路径，需要 Java 17 或更高版本。下面示例固定 `v0.1.17`；使用前请检查项目发布页是否已有更新版本。

```bash
mkdir foggy-runtime && cd foggy-runtime

curl -fLO https://github.com/foggy-projects/foggy-data-mcp-bridge/releases/download/foggy-runtime-launcher-v0.1.17/foggy-runtime-launcher-0.1.17.jar
curl -fLO https://github.com/foggy-projects/foggy-data-mcp-bridge/releases/download/foggy-runtime-launcher-v0.1.17/start-foggy-runtime.sh
curl -fLO https://github.com/foggy-projects/foggy-data-mcp-bridge/releases/download/foggy-runtime-launcher-v0.1.17/SHA256SUMS

grep -E 'foggy-runtime-launcher-0.1.17.jar|start-foggy-runtime.sh' SHA256SUMS | sha256sum -c -
chmod +x start-foggy-runtime.sh
./start-foggy-runtime.sh
```

Windows 用户从同一 Release 下载 `start-foggy-runtime.ps1`。默认地址是 `http://127.0.0.1:18066`，默认本地数据库为 SQLite。

> Launcher 默认安全模式面向开发/测试。不要直接把默认实例暴露到公网或生产网络；生产部署必须配置管理认证、业务身份传递、网络访问控制、数据源密钥保护和审计。

## 2. 启动后探测

```bash
curl http://127.0.0.1:18066/readyz
curl http://127.0.0.1:18066/api/v1/capabilities
```

能力响应是后续自动化的依据。至少记录 Runtime API 版本、启用的 feature 和 `securityMode`。如果 `securityMode` 是 `auth-code`，Runtime API 管理调用必须带 `X-Foggy-Runtime-Code`。

首次使用自定义 namespace 时，继续按[Runtime API 与 MCP 示例](./runtime-api-examples.md)完成 datasource test、namespace binding、model validate 和 refresh；仅 ready 不代表模型已经可查询。

## 3. 连接 MCP 客户端

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

也可以先直接发现工具：

```bash
curl -X POST http://127.0.0.1:18066/mcp/analyst/rpc \
  -H 'Content-Type: application/json' \
  -H 'X-NS: salesdrop' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

`X-NS` 是数据隔离轴。客户端、Runtime API 和模型资源必须使用同一个 namespace。不要把数据源密码或管理 code 写入 MCP 客户端配置。

## 4. 源码集成的边界

源码当前使用 Java 17、Spring Boot 3.4.x 和 `com.foggysource` 坐标；本手册使用已发布的 `9.2.0` 版本。需要二次开发时，源码构建应以 bridge 仓库的 pom/BOM 为准。

如果需要二次开发，先在 bridge 仓库完成编译和 focused 验证，再将构建产物接入业务工程。不要把历史文档中的 `8.1.10.beta` 片段直接复制到新项目。

## 5. AI 与图表依赖

- 结构化 MCP 工具可以在没有 ChatModel/AI Provider 的情况下运行。
- `dataset_nl.query` 需要配置兼容的 AI Provider；没有 Provider 时应使用 `dataset.query_model` 或 `dataset.compose_script`。
- `dataset.export_with_xchart` 使用 JVM 内生成的 XChart，不要求外部渲染服务。
- `dataset.export_with_echarts` 需要可用的 ECharts 渲染服务；不要再使用旧的 `dataset.export_with_chart` 名称。

## 6. 首次交付验收

完成启动、能力探测、namespace 选择、数据源绑定、模型 validate/refresh 和一次 `tools/list` 后，才进入查询问题排查。每一步保存响应中的 request/trace id、namespace、generation 和错误码，便于区分启动问题、模型问题和查询问题。
