---
title: Runtime API 与 MCP 示例
last_reviewed: 2026-10-03
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

## 8. 将真实查询结果导出为 PNG

`dataset.export_image` 执行一次受治理的 QueryModel 查询，在 Java Runtime 内渲染表格、
柱状图或折线图。CLI `query export-image` 调用同一个 MCP 工具，复用 Java2D/XChart
和随包交付的中文字体，无需 Docker、浏览器、Node、外部渲染服务或 AI 绘画模型。
本次不包含 Python Runtime 支持。

::: info 开发中功能
本功能目前位于 Java Runtime 和 CLI 的 `codex/query-image-export` 分支，发布版本尚未确定。
不能假定已发布的 CLI `0.1.24` 包含它。需使用配套新版构建，并确认所选 endpoint 的
`tools/list` 暴露 `dataset.export_image`。CLI 自动执行工具发现；缺失时返回
`UNSUPPORTED_IMAGE_TOOL`，exit `3`，不要改走私有端点或伪造结果行。
:::

沿用普通查询的 `X-NS` 和可选的完整 opaque `Authorization`。CLI 可使用已有
`FOGGY_RUNTIME_AUTHORIZATION` 环境变量，避免把凭据写入 payload 文件和示例。
模型、行、语义字段和物理列权限仍由原查询链路校验；空结果或权限拒绝不生成图片。
标题和 caption 只放展示文字，不放 token、连接串和运行参数。

先 describe 目标 QM，再 validate 查询 DSL。下例假设模型真实提供 `month` 和
`salesAmount`，必须替换为 describe 字段或最终聚合 alias，不保证前文 sales-drop 模型已提供。
将以下 DSL 单独保存为 `monthly-sales.json`：

```json
{
  "columns": ["month", "salesAmount"],
  "orderBy": [{"field": "month", "dir": "asc"}],
  "limit": 40
}
```

输出目录需已存在。执行表格命令前，先将下方含 caption/单位的字段配置保存为 `columns.json`：

```bash
foggy-runtime --base-url "$BASE_URL" --namespace "$NS" query export-image <QueryModel> --payload monthly-sales.json --kind table --columns columns.json --title "月度销售明细" --out sales-table.png
foggy-runtime --base-url "$BASE_URL" --namespace "$NS" query export-image <QueryModel> --payload monthly-sales.json --kind bar --x month --y salesAmount --y-label "销售额" --unit "元" --title "月度销售额" --out sales-bar.png
foggy-runtime --base-url "$BASE_URL" --namespace "$NS" query export-image <QueryModel> --payload monthly-sales.json --kind line --x month --y salesAmount --y-label "销售额" --unit "元" --title "销售额趋势" --out sales-line.png
```

表格可通过 `--columns columns.json` 选择并标注最终结果字段：

```json
[
  {"field": "month", "caption": "月份"},
  {"field": "salesAmount", "caption": "销售额", "unit": "元"}
]
```

caption 默认取查询 schema 标题，再回退字段名。单位须明确提供，不猜测，也不缩放数值。
图表必须用 `--x`、`--y` 指定分类字段和一个数值结果字段；渲染保留查询顺序和数值，
排序、聚合和日期补齐由 DSL 完成。表格 null 显示为横线，折线图 null 保留空隙。

MCP 客户端沿用发现阶段的请求头，提交以下 `tools/call`：

```json
{
  "jsonrpc": "2.0", "id": 4, "method": "tools/call",
  "params": {
    "name": "dataset.export_image",
    "arguments": {
      "model": "<QueryModel>",
      "payload": {
        "columns": ["month", "salesAmount"],
        "orderBy": [{"field": "month", "dir": "asc"}],
        "limit": 40
      },
      "kind": "bar", "xField": "month", "yField": "salesAmount",
      "title": "月度销售额", "yLabel": "销售额", "unit": "元",
      "delivery": "inline"
    }
  }
}
```

默认 `inline` 响应包含 MCP 原生图片内容：
`{type: "image", mimeType: "image/png", data: "<Base64 PNG>"}`。
文本和 `structuredContent` 提供安全的图片元数据、`rowsRendered`、`rowsReturned`、
`truncated`，不重复放入 Base64。可选的 `delivery: "link"` 复用现有图表存储；
部署方需配置客户端可访问的 URL 及其访问策略。inline 不要求公开图片存储，CLI 请求
inline PNG，不下载 URL。

| 项目 | 限制 |
| --- | --- |
| 表格 | 50 行、12 列；长文字换行并自动增高 |
| 柱状图 / 折线图 | 单系列，40 / 100 个点 |
| 宽度 | 640–2400 px，默认 1200 |
| 高度 | 请求表格高度 360–2400 px，自动输出最多 4096；图表 520–2400 px，默认 700 |
| PNG | 最多 800 万像素、8 MiB |
| 字号 | 标题 28 px；表头、正文及轴名称 18 px；刻度 16 px；页脚 14 px |

`--max-rows` 可降低展示上限。查询分页、引擎截断或展示上限都会在图片和元数据中标明
部分结果，不能当作全部数据。不支持的字体字符、无法清晰容纳的排版会明确失败，不无限
缩小字号。目前支持一个 flat QueryModel 结果，不支持 Compose 多结果、tree/grid Pivot、
连续时间/数值轴或报表设计器。

CLI 校验 PNG 内容后原子替换 `--out`，失败保留原文件。JSON 输出包含文件、尺寸、大小
和行数元数据，不输出图片 Base64 或运行凭据。保留该 JSON，分享前查看每张实际 PNG 的
中文、标题、字段名称、单位、间距和部分结果说明。

## 9. 证据保存与失败处置

至少保存以下 JSON：capabilities、datasource test、datasource diagnostics、model validate、bundles、model refresh、models list/describe、query validate/execute。失败时记录 namespace、Runtime API/schema、请求 path、退出码和响应中的 error code/phase。

本页不授权对既有业务数据进行修复、回填或重放。需要验证修复时使用新的 disposable fixture。
