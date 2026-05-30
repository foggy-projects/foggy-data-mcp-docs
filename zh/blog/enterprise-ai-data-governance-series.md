# 企业 AI 数据访问治理系列

这个系列整理 Foggy Data MCP / Foggy Odoo Bridge 在技术博客中的核心观点：企业 AI 数据访问不应该默认从 raw SQL、完整 schema 或宽泛 API 开始，而应该从受治理的工具边界、语义模型、宿主权限和可审计执行开始。

系列文章面向：

- 开发者；
- 架构师；
- 数据平台工程师；
- ERP / Odoo 技术实施团队；
- MCP / AI data access 工具开发者。

这些文章不是产品功能清单，也不是“让 AI 做一切”的宣传。它们讨论的是企业系统把 AI 接入业务数据时必须处理的工程边界。

## 核心观点

1. AI 不应该默认直接写 SQL 查询 ERP 数据库。
2. MCP 是 transport，不自动提供数据治理。
3. raw schema 不是业务授权模型。
4. 语义模型和查询模型比裸表结构更适合企业 AI 查询。
5. Odoo 的 model access、record rules、多公司和字段可见性必须进入查询执行前。
6. 生产级 AI 查询需要 audit、provenance、clarify 和 reject。
7. Community、Pro、self-hosted 的边界要讲清楚，不能把能力说得过满。

## 已发布文章

### 1. AI 查询 ERP 数据库时，为什么不该默认让模型写 SQL

[阅读全文](./ai-sql-erp-governed-semantic-query.md)

第一篇讨论 raw SQL 作为默认接口的问题。

它的重点不是否定 SQL，而是说明：ERP 数据里的权限、业务语义、公司边界、字段可见性和审计要求，通常不完整存在于数据库 schema 中。让模型直接看 schema 并生成 SQL，容易把“能查到数据”误认为“应该允许这样查”。

适合读者：

- 正在做 AI + 数据库 demo 的开发者；
- 评估 ERP AI 查询方案的架构师；
- 关心权限和审计的数据平台工程师。

### 2. MCP 只是传输协议，企业数据安全边界应该在工具设计里

[阅读全文](./mcp-transport-governed-tool-boundary.md)

第二篇讨论 MCP tool boundary。

MCP 让 AI client 调用工具变得标准化，但协议本身不会判断工具是否安全。一个 MCP tool 可以暴露 raw SQL，也可以忽略权限、泄露敏感字段或缺少审计。因此企业数据工具不能只是协议 wrapper，而应该承载身份、权限、语义、校验、结果裁剪、审计和 fail closed。

适合读者：

- MCP server / tool 开发者；
- 企业 AI 平台工程师；
- 正在把内部 API 或数据库暴露给 agent 的团队。

### 3. 从 Odoo record rules 看 AI 数据查询的权限治理

[阅读全文](./odoo-record-rules-ai-query-governance.md)

第三篇以 Odoo 为具体样本。

Odoo 用户不是 PostgreSQL 用户。AI 查询如果绕过 Odoo 应用层，直接访问数据库，就可能绕过 `ir.model.access`、`ir.rule`、multi-company 和 field visibility。文章重点讨论查询执行前应该如何绑定 effective Odoo user、收敛可见 query model、注入 record rules、处理公司和字段边界，并保留审计证据。

适合读者：

- Odoo 实施团队；
- Odoo 二开开发者；
- ERP 技术负责人；
- 想理解 AI 查询权限治理细节的 MCP 开发者。

### 4. raw schema 不是业务授权模型：AI 数据访问为什么需要语义层

[阅读全文](./raw-schema-is-not-business-authorization-model.md)

第四篇讨论 schema introspection 的边界。

数据库 schema 可以说明表、字段、类型、索引和部分关系，但它不能可靠表达当前用户能看哪些业务对象、记录、字段和指标。文章重点说明：raw schema 可以辅助建模，却不应该成为最终用户 AI 查询的授权入口；生产级 AI 数据访问应该通过语义模型和查询模型，把字段可见性、业务口径、行级切片和执行证据前置到查询执行前。

适合读者：

- 正在把数据库 schema 暴露给 AI 的开发者；
- 负责企业数据权限和指标口径的数据平台工程师；
- 需要评估 AI 查询边界的架构师；
- Odoo / ERP 技术实施团队。

## 推荐阅读顺序

如果你从企业 AI 数据访问整体架构开始，建议按下面顺序读：

1. [AI 查询 ERP 数据库时，为什么不该默认让模型写 SQL](./ai-sql-erp-governed-semantic-query.md)
2. [MCP 只是传输协议，企业数据安全边界应该在工具设计里](./mcp-transport-governed-tool-boundary.md)
3. [从 Odoo record rules 看 AI 数据查询的权限治理](./odoo-record-rules-ai-query-governance.md)
4. [raw schema 不是业务授权模型：AI 数据访问为什么需要语义层](./raw-schema-is-not-business-authorization-model.md)

如果你已经在做 MCP 工具实现，可以先读第二篇，再回到第一篇和第三篇。

如果你是 Odoo 实施团队，可以先读第三篇，再看前两篇了解更通用的架构背景。

如果你正在用 schema introspection 或 Text-to-SQL 做企业数据接入，建议读完第一篇后直接读第四篇。

## 和白皮书的关系

技术博客用于解释问题、边界和工程取舍；白皮书用于沉淀公开语义契约、架构能力和参考定义。

继续阅读：

- [LLM 语义层引擎白皮书 v1.0](/zh/whitepaper/v1.0/)
- [TM/QM 语义层定义总览](/zh/whitepaper/v1.0/semantic-layer-syntax-reference)
- [JSON Query DSL 语法参考](/zh/whitepaper/v1.0/query-dsl-syntax-reference)
- [权限控制（QM）](/zh/dataset-model/api/authorization)

## 后续选题

后续文章会继续展开：

- clarify / reject 为什么是生产级 AI 查询能力；
- audit 和 provenance 应该记录什么；
- 语义查询能力如何分层承诺；
- Odoo Community、Pro、self-hosted 的采用边界。

这些文章会优先保持技术可信和边界清晰，不把 AI 描述成可以绕过权限、任意写 SQL或自动写回业务数据的工具。
