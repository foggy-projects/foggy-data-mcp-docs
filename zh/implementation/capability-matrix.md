---
title: Foggy 能力基线与证据矩阵
last_reviewed: 2026-08-22
status: working-manual
---

# Foggy 能力基线与证据矩阵

本页是实施手册的当前能力真源，不是 v3.0 白皮书冻结内容。它记录了 2026-08-22 在 disposable SQLite fixture 上对 Java Runtime 的验证结果。生产环境仍需重新执行相同检查，并补齐认证、Authorization、审计、网络和密钥治理。

## 验证边界

| 项目 | 本次值 |
| --- | --- |
| Launcher | `foggy-runtime-launcher v0.1.17` |
| Engine | `java` |
| Runtime API | `foggy-runtime-api/v1` |
| Schema | `2026-06-06` |
| Security mode | `none-dev-test-only` |
| Namespace | `salesdrop` |
| Fixture | disposable SQLite + `sales_drop_daily` |
| 运行时来源 | `foggy-data-mcp-bridge`，公开框架版本 `9.2.0` |

`none-dev-test-only` 是明确的开发/测试边界，不是生产安全结论。每次部署都应先读取 `/api/v1/capabilities`，再依据实际能力决定后续步骤。

## 能力矩阵

状态含义：`已验证` 表示本次 fixture 真实执行通过；`已声明/未执行` 表示 Runtime capability 已声明但本次没有消费该能力；`条件能力` 表示依赖配置、身份或可选服务；`已禁用` 表示当前实例明确不提供。

| 能力 | 当前状态 | Runtime/API 或 MCP 入口 | 本次证据与文档决策 |
| --- | --- | --- | --- |
| 就绪与能力探测 | 已验证 | `GET /readyz`、`GET /api/v1/capabilities` | 返回 Java、API v1、schema `2026-06-06`；所有实施流程以此为首步。 |
| Runtime 安全模式 | 条件能力 | `securityMode`、管理认证配置 | 当前为 `none-dev-test-only`，文档不得把本地 Launcher 当生产部署。 |
| 数据源列表/测试 | 已验证 | `GET /api/v1/datasources`、`POST /api/v1/datasources/{name}/test` | `default` datasource 测试通过；诊断结果不应暴露密码或完整连接串。 |
| Namespace datasource binding | 已验证 | `PUT /api/v1/namespaces/{namespace}/datasource` | 新 namespace 未绑定时模型校验失败；绑定 `default` 后链路通过，绑定是模型校验前置条件。 |
| 数据源 diagnostics | 已验证 | `GET /api/v1/datasources/diagnostics` | 能看到 `namespaceBindings.salesdrop=default`；`managedDatasourceCount=0` 不等于没有可用 config datasource。 |
| 表列表与表结构 | 已验证 | `POST /api/v1/tables/list`、`POST /api/v1/tables/inspect` | `sales_drop_daily` 可探查；仅用于受控运维/建模，不替代语义查询。 |
| Runtime SQL | 已验证但受限 | `POST /api/v1/sql/query` | 只读 top-5 查询通过；不能把 SQL 面暴露为普通 MCP 用户查询入口。 |
| Bundle 注册 | 已验证 | `GET/POST /api/v1/bundles` | 注册 `sales-drop-models` 后再刷新；注册不等于模型已发布。 |
| 模型 validate | 已验证 | `POST /api/v1/models/validate` | 绑定 datasource 后通过；validate 是 candidate 诊断，不直接替换 catalog。 |
| 模型 refresh/list/describe | 已验证 | `/api/v1/models/refresh`、`GET /api/v1/models`、`POST /api/v1/models/{model}/describe` | 刷新后发现 `SalesDropDailyQueryModel`；describe 返回 21 个字段和物理表映射。 |
| Query validate/execute | 已验证 | `/api/v1/query/{model}/validate|execute` | 使用 13 列、`limit=5` 的最小查询通过；文档要求先 validate 再 execute。 |
| Query explain | 已验证 | `/api/v1/query/{model}/explain`、`dataset.explain_query` | `basis=RECOMPILED`；这是当前上下文重新编译证据，不是历史执行 trace。 |
| Compose/FSScript | 已声明/未执行 | `/api/v1/compose/validate|preview|execute`、`dataset.compose_script` | capability 为 supported；本轮未将它写成已验收示例，需单独补 cross-model/derived fixture。 |
| Authoring workspace/resources/diff/validate | 已声明/未执行 | `/api/v1/authoring/...` | capability 为 supported；发布、恢复和并发修订需要独立管理面验收。 |
| Release package export | 已声明/未执行 | `/api/v1/authoring/workspaces/{id}/release-package` | capability 为 supported；本轮不宣称已完成发布演练。 |
| Production apply/rollback | 已禁用 | capability `authoring.production.apply/rollback` | 当前实例明确 disabled；3.0 草案必须保留条件/禁用口径。 |
| Release package import | 已禁用 | capability `authoring.releasePackage.import` | 当前实例明确 disabled；不能在部署手册中提供“可直接导入生产”的承诺。 |
| MCP 模型发现 | 已验证 | `dataset.list_models` | 当前首选发现工具，只返回路由信息；随后调用 `dataset.describe_model_internal`。 |
| MCP 模型详情 | 已验证 | `dataset.describe_model_internal` | 传入 `model`；不要再以 `dataset.get_metadata` 作为首轮发现入口。 |
| 旧元数据工具 | 兼容/待下线 | `dataset.get_metadata` | `tools/list` 标记 Deprecated；新接入必须迁移到 list + describe。 |
| 单模型查询 | 已声明并有 API 证据 | `dataset.query_model` | 单模型过滤、分组、时间窗口、pivot 走此工具；跨模型不要硬拼。 |
| 跨模型组合 | 已声明/未执行 | `dataset.compose_script` | 只用于 Join/Union/derived/multi-plan；脚本必须返回 `{ plans: plan }`。 |
| 图表导出 | 条件能力 | `dataset.export_with_xchart`、`dataset.export_with_echarts` | XChart 是 JVM 原生、不依赖浏览器/Node；ECharts 依赖可选渲染服务且应明确选择。 |
| 自然语言查询 | 条件能力 | `dataset_nl.query` | 依赖 ChatModel/AI Provider；结构化工具不应因 Provider 缺失而被描述为不可用。 |

## 需要进入 v3.0 评审的口径

- 保留 `DRAFT / NOT FROZEN`，直到产品和架构负责人确认能力矩阵与兼容策略。
- 将 datasource binding、model validate/refresh、catalog generation 和工具迁移写成实施前置条件，而不是隐藏在示例中。
- 把 `RECOMPILED` 与历史执行 trace 分开定义，并明确 SQL/物理名是否暴露由 namespace 管理策略决定。
- 把 production apply/rollback/import 的 disabled/conditional 状态放进兼容矩阵，不提前承诺完整发布闭环。

## 复现入口

完整的 curl、MCP JSON-RPC 和 CLI 示例见[Runtime API 与 MCP 示例](./runtime-api-examples.md)。实施团队应保存 `capabilities`、datasource diagnostics、model validate/refresh、query validate/execute 的 JSON 响应作为交付证据。
