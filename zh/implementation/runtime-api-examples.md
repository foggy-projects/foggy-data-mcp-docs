---
title: Runtime API 与 MCP 示例
last_reviewed: 2026-08-22
status: working-manual
---

# Runtime API 与 MCP 示例

本页示例来自 Java Runtime 的 disposable SQLite 验证。它们用于开发/测试和文档验收；不要直接复制到生产环境。生产请求还需要正确的管理认证、业务身份、TLS、审计和网络边界。

## 变量与请求约定

```bash
BASE_URL=http://127.0.0.1:18066
NS=salesdrop
MODEL=SalesDropDailyQueryModel
MODEL_DIR=/path/to/sales-drop-demo/models
```

- Runtime API 使用 `X-NS` 选择 namespace；本文所有请求都显式传递它。
- CLI 默认输出 JSON，适合保存为验收证据；错误退出码为 `2`（Runtime API 错误）、`3`（能力不支持）、`4`（传输错误）。
- 下例中的 `MODEL_DIR` 必须是 Runtime 进程可读的 TM/QM 目录。

## 1. 先做 ready 与 capability 探测

```bash
curl -fsS "$BASE_URL/readyz"

curl -fsS "$BASE_URL/api/v1/capabilities" \
  -H "X-NS: $NS"
```

应记录 `engine`、`runtimeApiVersion`、`schemaVersion`、`securityMode` 和 `capabilities`。本次证据为 `java`、`foggy-runtime-api/v1`、`2026-06-06`、`none-dev-test-only`。

等价 CLI：

```bash
PYTHONPATH=foggy-runtime-cli/src python3 -m foggy_runtime_cli.main \
  --base-url "$BASE_URL" --namespace "$NS" wait-ready

PYTHONPATH=foggy-runtime-cli/src python3 -m foggy_runtime_cli.main \
  --base-url "$BASE_URL" --namespace "$NS" capabilities
```

## 2. 测试 datasource，并绑定 namespace

```bash
curl -fsS -X POST "$BASE_URL/api/v1/datasources/default/test" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{}'

curl -fsS -X PUT "$BASE_URL/api/v1/namespaces/$NS/datasource" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"namespace\":\"$NS\",\"dataSource\":\"default\"}"

curl -fsS "$BASE_URL/api/v1/datasources/diagnostics" \
  -H "X-NS: $NS"
```

不要跳过 binding。真实失败证据是：未绑定时 `models.validate` 返回 `MODEL_VALIDATE_FAILED`，其中 `MODEL` 诊断为 `No default data source bound for namespace 'salesdrop'`；绑定后同一 fixture 通过。

## 3. 探查表并执行只读 SQL

```bash
curl -fsS -X POST "$BASE_URL/api/v1/tables/list" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"dataSource":"default","includeViews":true}'

curl -fsS -X POST "$BASE_URL/api/v1/tables/inspect" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"dataSource":"default","includeForeignKeys":false,"includeIndexes":true,"table":"sales_drop_daily"}'

curl -fsS -X POST "$BASE_URL/api/v1/sql/query" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"dataSource":"default","maxRows":5,"timeoutSeconds":5,"sql":"select observation_date, region, sales_drop_amount from sales_drop_daily order by sales_drop_amount desc"}'
```

SQL 仅作为受控建模/运维面的只读探查。普通 MCP 查询应使用 QM 和语义工具。

## 4. 注册、校验、刷新和描述模型

先校验资源目录：

```bash
curl -fsS -X POST "$BASE_URL/api/v1/models/validate" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"clearExisting\":true,\"includeStackTrace\":false,\"namespace\":\"$NS\",\"path\":\"$MODEL_DIR\",\"watch\":false}"
```

注册 Bundle 并刷新：

```bash
curl -fsS -X POST "$BASE_URL/api/v1/bundles" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"enabled\":true,\"name\":\"sales-drop-models\",\"namespace\":\"$NS\",\"path\":\"$MODEL_DIR\",\"refresh\":false,\"replace\":true,\"validate\":false,\"watch\":true}"

curl -fsS -X POST "$BASE_URL/api/v1/models/refresh" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"namespace\":\"$NS\"}"

curl -fsS "$BASE_URL/api/v1/models" \
  -H "X-NS: $NS"

curl -fsS -X POST "$BASE_URL/api/v1/models/$MODEL/describe" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"namespace\":\"$NS\"}"
```

本次刷新后，`models` 返回 `SalesDropDailyQueryModel`；describe 返回 21 个字段，事实表为 `sales_drop_daily`。Bundle 注册、model validate 和 refresh 的响应应全部保存。

## 5. 先 validate，再 execute

将以下内容保存为 `basic-query.json`，或直接使用 demo 目录下同名 payload：

```json
{
  "limit": 5,
  "columns": [
    "observationDate",
    "region",
    "channel",
    "productCategory",
    "customerName",
    "customerSegment",
    "severity",
    "rootCause",
    "actionOwner",
    "netSalesAmount",
    "priorWeekNetSalesAmount",
    "salesDropAmount",
    "salesDropRate"
  ]
}
```

```bash
curl -fsS -X POST "$BASE_URL/api/v1/query/$MODEL/validate" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  --data @basic-query.json

curl -fsS -X POST "$BASE_URL/api/v1/query/$MODEL/execute" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  --data @basic-query.json
```

验证失败时先修复模型、字段或权限上下文，不要退回物理列或 raw SQL 绕过语义层。

## 6. Explain 的正确含义

```bash
curl -fsS -X POST "$BASE_URL/api/v1/query/$MODEL/explain" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d "{\"payload\":$(tr -d '\n' < basic-query.json),\"includeSql\":false,\"includePhysicalNames\":false}"
```

如果响应包含 `basis: RECOMPILED`，它表示 Runtime 依据当前模型 revision、调用者上下文和 payload 重新编译；`executionTrace` 可能是 `NOT_EVALUATED`。它不能证明某一次历史查询曾经执行过该 SQL。

## 7. MCP tools/list 与推荐路由

```bash
curl -fsS -X POST "$BASE_URL/mcp/analyst/rpc" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list","params":{}}'
```

推荐的 JSON-RPC 调用顺序：

```bash
curl -fsS -X POST "$BASE_URL/mcp/analyst/rpc" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"dataset.list_models","arguments":{}}}'

curl -fsS -X POST "$BASE_URL/mcp/analyst/rpc" \
  -H "X-NS: $NS" \
  -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"dataset.describe_model_internal","arguments":{"model":"SalesDropDailyQueryModel"}}}'
```

路由规则：

- 只发现模型：`dataset.list_models`。
- 已知模型但字段不确定：`dataset.describe_model_internal`。
- 单模型查询：`dataset.query_model`。
- Join、Union、derived 或多 Plan：`dataset.compose_script`，并返回 `{ plans: plan }`。
- 解释查询：`dataset.explain_query`，把 `RECOMPILED` 标注为重新编译证据。
- `dataset.get_metadata` 已被标记 Deprecated；不要在新客户端首轮调用它。

## 8. 证据保存与失败处置

至少保存以下 JSON：capabilities、datasource test、datasource diagnostics、model validate、bundles、model refresh、models list/describe、query validate/execute。失败时记录 namespace、Runtime API/schema、请求 path、退出码和响应中的 error code/phase。

本页不授权对既有业务数据进行修复、回填或重放。需要验证修复时使用新的 disposable fixture。
