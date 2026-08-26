# MCP 工具与查询路由

## 当前工具面

以运行实例的 `tools/list` 为准。当前 Java bridge 的核心工具包括：

| 工具 | 用途 | 前置条件 |
| --- | --- | --- |
| `dataset.list_models` | 首选模型发现和路由概览 | namespace |
| `dataset.describe_model_internal` | 查看单个模型字段详情 | 模型名、namespace |
| `dataset.query_model` | 单模型结构化查询 | 已知模型和字段 |
| `dataset.compose_script` | Compose/跨模型/受控组合查询 | 当前 schema 支持的 Compose payload |
| `dataset.explain_query` | 查询定义、重编译和证据解释 | query payload |
| `dataset_nl.query` | 自然语言查询 | ChatModel/AI Provider |
| `chart.generate` | 生成图表描述或图表数据 | 查询结果 |
| `dataset.export_with_xchart` | JVM 原生 XChart 导出 | 查询结果 |
| `dataset.export_with_echarts` | ECharts 导出 | 查询结果和渲染服务 |

`dataset.get_metadata` 是旧的元数据入口，新的集成应先使用 `dataset.list_models`，再按需调用 `dataset.describe_model_internal`。工具策略或版本差异可能使某些工具在特定 endpoint 不可见，不能只依赖静态角色表。

## 推荐路由

```text
用户问题
  ├─ 已知一个 QM、字段和过滤条件 → dataset.query_model
  ├─ 需要多个模型、Join/Union 或多阶段计划 → dataset.compose_script
  ├─ 需要解释计划/SQL/物理映射 → dataset.explain_query
  ├─ 只想发现模型 → dataset.list_models
  └─ 需要自然语言推理 → dataset_nl.query（确认 AI Provider）
```

`query_model` 面向单模型。跨模型 Join、Union、derived 或多计划场景应路由到 Compose；不要把任意 SQL 或自由 CTE 直接交给 MCP 工具。DSL_CTE、pivot、timeWindow 和 calculatedFields 是否可用，应以当前 schema 与 capabilities 为准。

## 最小调用顺序

1. 确认 MCP endpoint 和 `X-NS`。
2. 调用 `dataset.list_models`，取得模型路由信息。
3. 对目标模型调用 `dataset.describe_model_internal`。
4. 先用 query validate/工具参数校验发现字段和权限问题，再 execute。
5. 需要解释时调用 `dataset.explain_query`，把 recompiled evidence 标成“重新编译证据”。
6. 查询完成后再选择 chart 或 export 工具。

## namespace 与权限

MCP 请求的 namespace 不只是展示字段，它决定模型 catalog、数据源 binding、工具策略和查询上下文。切换 namespace 后必须重新发现模型，不应复用上一个 namespace 的模型缓存。

`Authorization` 如果由宿主传入，应作为业务 opaque token 传递；它不能替代 `X-Foggy-Runtime-Code`，也不能通过 query payload 自行提交列/行权限参数。

## 失败处理

- 工具不存在：先重新 `tools/list`，确认 endpoint、namespace 和动态工具策略。
- 模型不存在：重新 `list_models`，检查 Bundle 是否已 refresh，避免猜测模型名。
- 字段无权限：缩小字段集合，检查 QM/TM 权限和业务身份，不要绕过到物理列或 SQL。
- Compose 不支持：拆成单模型查询，或先用 schema/capabilities 确认当前受控能力；不要改成原始 SQL。
- Explain 与历史结果不一致：检查请求 revision、catalog generation 和执行 trace；Explain 本身不代表历史执行。

