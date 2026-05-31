# 技术博客

这里收录 Foggy Data MCP / Foggy Odoo Bridge 相关的技术文章。博客文章用于解释工程观点、架构取舍和生产边界；白皮书仍以 [LLM 语义层引擎白皮书](/zh/whitepaper/) 为准。

## 系列入口

- [企业 AI 数据访问治理系列](./enterprise-ai-data-governance-series.md)

## 已发布文章

- [AI 查询 ERP 数据库时，为什么不该默认让模型写 SQL](./ai-sql-erp-governed-semantic-query.md)
- [MCP 只是传输协议，企业数据安全边界应该在工具设计里](./mcp-transport-governed-tool-boundary.md)
- [从 Odoo record rules 看 AI 数据查询的权限治理](./odoo-record-rules-ai-query-governance.md)
- [raw schema 不是业务授权模型：AI 数据访问为什么需要语义层](./raw-schema-is-not-business-authorization-model.md)
- [企业 AI 问数的澄清与拒绝：比“回答一切”更重要](./clarify-reject-fail-closed-ai-data-query.md)
- [生产级 AI 查询需要 audit 和 provenance，而不只是一个答案](./audit-provenance-ai-data-query.md)
- [语义查询能力应该分层承诺：DSL、Semantic SQL、CTE 与小结果二次分析](./semantic-query-capability-layers.md)
- [Odoo AI 问数的部署边界：Community、Pro 与 self-hosted 应该怎么讲](./odoo-ai-query-deployment-boundaries.md)
- [给业务系统接 AI 工具前，先定义有效用户上下文](./effective-user-context-ai-tools.md)
- [AI-driven analytics 不能只靠 LLM + SQL：指标口径、权限和复核流程缺一不可](./ai-driven-analytics-metrics-governance.md)

## 后续方向

第一批技术博客已经覆盖 raw SQL、MCP tool boundary、Odoo 权限、语义模型、澄清/拒绝、审计、部署边界、用户上下文和指标治理。

后续可以继续展开：

- Odoo 多公司 / 多租户 AI 查询的工程细节；
- 语义模型版本管理和灰度发布；
- AI 查询结果的缓存、预聚合和性能边界；
- 从只读问数到受控业务动作的 tool design。

## 写作边界

- 不把 Foggy 描述为任意 SQL 生成器。
- 不承诺绕过宿主系统权限。
- 不承诺自动写回业务数据。
- 不把 MCP 协议本身等同于数据安全。
- 不把 Community 和 Pro 的采用边界写模糊。

## 相关文档

- [LLM 语义层引擎白皮书 v1.0](/zh/whitepaper/v1.0/)
- [MCP 服务架构概述](/zh/mcp/guide/architecture)
- [权限控制（QM）](/zh/dataset-model/api/authorization)
- [JSON Query DSL 语法参考](/zh/whitepaper/v1.0/query-dsl-syntax-reference)
