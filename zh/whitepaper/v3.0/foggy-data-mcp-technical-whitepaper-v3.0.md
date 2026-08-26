---
whitepaper_status: DRAFT
frozen: false
last_reviewed: 2026-08-22
---

# Foggy Data MCP 技术白皮书 v3.0（草案）

> **DRAFT / NOT FROZEN**。本文用于评审 Runtime、MCP、模型生命周期和治理能力的下一版公开边界。文中“当前实现”表示在当前 Java bridge 基线中可以通过代码/能力探测找到的能力；“候选”不表示已经承诺兼容。

## 1. 目标

v3.0 草案把 Foggy 描述为一个可治理的语义数据运行时：AI 客户端通过 MCP 或 Runtime API 提交业务语义请求，Runtime 在 namespace、模型、权限和数据源边界内完成验证、编译、执行和证据返回。

核心原则：

- AI 面向 TM/QM 语义模型，不把物理 schema 或任意 SQL 作为默认接口；
- namespace 是数据源、Bundle、模型 catalog、工具策略和查询上下文的隔离轴；
- validate 与 refresh 分离，刷新以 catalog generation 原子发布；
- 管理认证和业务身份分离；
- explain 的重新编译证据不能冒充历史执行 trace；
- 公开文档只承诺已验证、可重复的能力。

## 2. 运行时平面

```text
MCP Client / Runtime API Client
          │ namespace + identity
          ▼
Runtime API / MCP Dispatch
  ├─ tool policy and audit
  ├─ TM/QM catalog and Bundle lifecycle
  ├─ governed query planning / dialect translation
  └─ candidate authoring and release coordination
          ▼
Datasource registry and namespace binding
          ▼
MySQL · PostgreSQL · SQL Server · SQLite · optional backends
```

运行时 identity 至少包括 namespace、数据源 binding generation、Bundle/resource revision、model catalog generation 和 backend provider identity。缓存和异步任务遗漏这些维度会产生跨 namespace 串读或过期模型。

## 3. Bundle 与模型生命周期

Bundle 注册负责登记资源，不隐式承诺资源已经编译或对查询可见。推荐生命周期是：

```text
register/update
  → inspect and conflict-check
  → persist registry
  → explicit validate
  → explicit refresh
  → atomically publish catalog generation
```

`validate` 构建 candidate 并返回诊断，不替换当前模型；`refresh` 在 admission 通过后原子发布。刷新失败时，已发布 generation 应保持可用。

当前 Runtime 还包含 authoring workspace、candidate query、immutable published artifact、publish/recover、release package、production promotion、rollback 和 lifecycle inventory 等接口。它们属于管理面，不能与普通 MCP 数据查询混为一谈。

## 4. MCP 工具契约候选

当前工具路由候选为：

| 场景 | 工具 |
| --- | --- |
| 模型发现 | `dataset.list_models` |
| 模型字段描述 | `dataset.describe_model_internal` |
| 单模型查询 | `dataset.query_model` |
| 跨模型/组合查询 | `dataset.compose_script` |
| 解释编译与证据 | `dataset.explain_query` |
| 自然语言查询 | `dataset_nl.query`（需要 AI Provider） |
| 图表/导出 | `chart.generate`、`dataset.export_with_xchart`、`dataset.export_with_echarts` |

`dataset.get_metadata` 进入兼容/迁移位置。`query_model` 仍以单模型、受治理 DSL 为边界；Join、Union、derived 和多计划进入 Compose。原始 SQL、自由 CTE 和内部治理字段不属于普通 MCP 输入契约。

## 5. 查询证据

Runtime API 和 MCP 可以提供 query validation、compiled plan、SQL/物理名映射和 explain 信息。证据必须标注来源和时间：

- definition evidence：来自模型定义或 Bundle；
- recompiled evidence：本次请求重新构建的计划/SQL；
- execution evidence：实际执行产生的 trace、结果边界和审计记录。

重新编译的 explain 结果不是历史执行记录。生产报告需要把三类证据分开保存。

## 6. 权限与信任边界

- `X-Foggy-Runtime-Code` 控制 Runtime 管理面；
- `Authorization` 是可选 opaque 业务身份，由模型权限逻辑解释；
- `X-NS` 选择隔离上下文；
- 调用方不能提交 `fieldAccess`、`deniedColumns`、`systemSlice`、`policySnapshotId` 等内部治理参数；
- FSScript 模型代码属于受信发布内容，原始脚本执行不属于普通数据查询；
- `tools.config.js` 是工具暴露/路由控制，不是唯一安全边界。

当前实现对 AI Provider 采用可选策略：结构化工具可以独立工作，NL 工具按条件启用。生产环境仍需补齐认证、业务身份、审计和网络出口策略，不能把 Launcher 默认开发模式当作生产安全基线。

## 7. 图表与扩展

XChart 为 JVM 原生导出路径；ECharts 依赖可选外部渲染服务。两者都必须继承查询字段、行权限、审计和结果大小限制。可选 addon、Odoo、缓存、向量、预聚合和远程数据源能力应根据具体实现和 capabilities 单独声明，不在本草案中自动升级为核心 GA 契约。

## 8. 需要确认的冻结问题

在 3.0 冻结前，必须确认：

1. Runtime API 与 MCP 工具的稳定名称、错误包络和版本策略；
2. namespace、管理认证和业务 Authorization 的公开安全契约；
3. authoring/release/promotion/rollback 的生产支持范围；
4. explain、audit、provenance 的证据字段和保留责任；
5. Compose、DSL_CTE、pivot、timeWindow、图表和 AI Provider 的能力分级；
6. Java、Python、Odoo 等实现的兼容矩阵和最低验证证据。

在这些问题确认前，本文所有候选能力均不得被下游文档写成“稳定支持”。

