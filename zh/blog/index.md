# 技术博客

这里收录 Foggy Data MCP / Foggy Odoo Bridge 相关的技术文章。博客文章用于解释工程观点、架构取舍和生产边界；白皮书仍以 [LLM 语义层引擎白皮书](/zh/whitepaper/) 为准。

## 已发布

- [AI 查询 ERP 数据库时，为什么不该默认让模型写 SQL](./ai-sql-erp-governed-semantic-query.md)
- [MCP 只是传输协议，企业数据安全边界应该在工具设计里](./mcp-transport-governed-tool-boundary.md)

## 计划选题

这些选题会围绕企业 AI 数据访问、MCP 工具边界、语义模型和 Odoo 权限治理持续展开。

| 优先级 | 选题 | 主题 |
|---|---|---|
| P0 | 从 Odoo record rules 看 AI 数据查询的权限治理 | Odoo model access、record rules、多公司 |
| P1 | raw schema 不是业务授权模型：AI 数据访问为什么需要语义层 | schema、semantic model、query model |
| P1 | 企业 AI 问数的澄清与拒绝：比“回答一切”更重要 | clarify、reject、fail closed |
| P1 | 生产级 AI 查询需要 audit 和 provenance，而不只是一个答案 | audit、provenance、query evidence |
| P1 | 语义查询能力应该分层承诺：DSL、Semantic SQL、CTE 与小结果二次分析 | capability layers、query boundary |
| P2 | Odoo AI 问数的部署边界：Community、Pro 与 self-hosted 应该怎么讲 | edition boundary、self-hosted、Odoo.sh |
| P2 | 给业务系统接 AI 工具前，先定义有效用户上下文 | effective user、tenant、service principal |
| P2 | AI-driven analytics 不能只靠 LLM + SQL：指标口径、权限和复核流程缺一不可 | metrics governance、BI、review workflow |

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
