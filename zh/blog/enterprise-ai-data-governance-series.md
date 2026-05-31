# 企业 AI 数据访问治理系列

这个系列整理 Foggy Data MCP / Foggy Odoo Bridge 在技术博客中的核心观点：企业 AI 数据访问不应该默认从 raw SQL、完整 schema 或宽泛 API 开始，而应该从受治理的工具边界、语义模型、宿主权限和可审计执行开始。

系列文章面向：

- 开发者；
- 架构师；
- 数据平台工程师；
- ERP / Odoo 技术实施团队；
- MCP / AI data access 工具开发者。

这些文章不是产品功能清单，也不是“让 AI 做一切”的宣传。它们讨论的是企业系统把 AI 接入业务数据时必须处理的工程边界。

## 按读者角色阅读

如果你不想从第一篇顺序读，可以按角色选择入口：

| 读者角色 | 建议阅读 | 重点问题 |
|---|---|---|
| Odoo 实施团队 | [从 Odoo record rules 看 AI 数据查询的权限治理](./odoo-record-rules-ai-query-governance.md)、[Odoo AI 问数的部署边界：Community、Pro 与 self-hosted 应该怎么讲](./odoo-ai-query-deployment-boundaries.md)、[给业务系统接 AI 工具前，先定义有效用户上下文](./effective-user-context-ai-tools.md) | Odoo 用户上下文、record rules、多公司、部署边界 |
| MCP 工具开发者 | [MCP 只是传输协议，企业数据安全边界应该在工具设计里](./mcp-transport-governed-tool-boundary.md)、[企业 AI 问数的澄清与拒绝：比“回答一切”更重要](./clarify-reject-fail-closed-ai-data-query.md)、[生产级 AI 查询需要 audit 和 provenance，而不只是一个答案](./audit-provenance-ai-data-query.md) | tool boundary、fail closed、audit/provenance |
| 数据平台 / BI 团队 | [raw schema 不是业务授权模型：AI 数据访问为什么需要语义层](./raw-schema-is-not-business-authorization-model.md)、[语义查询能力应该分层承诺：DSL、Semantic SQL、CTE 与小结果二次分析](./semantic-query-capability-layers.md)、[AI-driven analytics 不能只靠 LLM + SQL：指标口径、权限和复核流程缺一不可](./ai-driven-analytics-metrics-governance.md) | 语义模型、指标口径、查询能力边界 |
| 架构师 | [AI 查询 ERP 数据库时，为什么不该默认让模型写 SQL](./ai-sql-erp-governed-semantic-query.md)、[MCP 只是传输协议，企业数据安全边界应该在工具设计里](./mcp-transport-governed-tool-boundary.md)、[Odoo AI 问数的部署边界：Community、Pro 与 self-hosted 应该怎么讲](./odoo-ai-query-deployment-boundaries.md) | 总体架构、部署控制、权限和治理责任划分 |

## 核心观点

1. AI 不应该默认直接写 SQL 查询 ERP 数据库。
2. MCP 是 transport，不自动提供数据治理。
3. raw schema 不是业务授权模型。
4. 语义模型和查询模型比裸表结构更适合企业 AI 查询。
5. Odoo 的 model access、record rules、多公司和字段可见性必须进入查询执行前。
6. 生产级 AI 查询需要 audit、provenance、clarify 和 reject。
7. Community、Pro、self-hosted 的边界要讲清楚，不能把能力说得过满。
8. AI-driven analytics 需要指标口径、权限切片和复核流程，不能只靠 LLM + SQL。

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

### 5. 企业 AI 问数的澄清与拒绝：比“回答一切”更重要

[阅读全文](./clarify-reject-fail-closed-ai-data-query.md)

第五篇讨论 clarify、reject 和 fail closed。

企业 AI 问数不应该把“尽量回答一切”作为唯一目标。文章重点说明：当时间范围、指标口径、模型选择或权限边界不明确时，系统应该澄清；当请求越权、超出模型能力或要求写回业务数据时，系统应该拒绝；澄清和拒绝都应该进入工具返回结构和审计记录，而不是只靠最终回答文本解释。

适合读者：

- 正在设计 AI 问数产品的开发者；
- 企业 AI 平台和 MCP 工具开发者；
- 关心审计、权限和问数可信度的数据平台工程师；
- Odoo / ERP 技术实施团队。

### 6. 生产级 AI 查询需要 audit 和 provenance，而不只是一个答案

[阅读全文](./audit-provenance-ai-data-query.md)

第六篇讨论查询证据、审计和数据来源追踪。

AI 问数不能只返回一个自然语言答案。文章重点说明：audit 需要记录谁在什么上下文下发起了什么查询；provenance 需要记录结果来自哪个模型、字段、权限切片、结构化查询和底层执行过程。成功查询、澄清、拒绝、截断和脱敏都应该进入审计链路，方便业务复核、安全排查和模型治理。

适合读者：

- 企业 AI 平台工程师；
- 数据平台和治理团队；
- MCP / tool calling 工具开发者；
- Odoo / ERP 实施和运维团队。

### 7. 语义查询能力应该分层承诺：DSL、Semantic SQL、CTE 与小结果二次分析

[阅读全文](./semantic-query-capability-layers.md)

第七篇讨论语义查询能力的分层边界。

企业 AI 查询不应该被笼统描述成“想怎么问就怎么查”。文章重点区分 Query Model + JSON DSL、Compose 多步骤查询、引擎内部 CTE、受限 Semantic SQL 和小结果二次分析：哪些适合作为稳定默认能力，哪些是受控高阶能力，哪些只是内部实现策略，哪些更适合标成演进方向。核心目的是避免把 Foggy 或类似架构误解成任意 SQL / 任意分析工具。

适合读者：

- 企业数据平台架构师；
- MCP / AI data access 工具开发者；
- 正在设计语义层和查询 DSL 的工程师；
- Odoo / ERP 技术负责人。

### 8. Odoo AI 问数的部署边界：Community、Pro 与 self-hosted 应该怎么讲

[阅读全文](./odoo-ai-query-deployment-boundaries.md)

第八篇讨论 Odoo AI 问数的采用和部署边界。

文章重点说明：不要只用“支持 Odoo Community / Pro / self-hosted”回答问题，而应该把 Odoo 版本、托管形态、网络控制、effective user、权限治理、审计和读写工具边界拆开。Community 可以作为自托管、只读语义查询的起点；Pro / self-hosted 更应该强调治理、审计和运维能力；Odoo.sh / SaaS 托管需要先确认扩展、网络和数据访问方式。

适合读者：

- Odoo 实施团队；
- ERP 技术负责人；
- 企业 AI 平台架构师；
- 正在评估 Foggy Odoo Bridge / MCP 工具部署方式的工程师。

### 9. 给业务系统接 AI 工具前，先定义有效用户上下文

[阅读全文](./effective-user-context-ai-tools.md)

第九篇讨论 AI 工具调用里的 effective user context。

文章重点说明：API key、数据库账号或 MCP client 身份不能自动等同于业务用户身份。生产级 AI 工具需要在服务端解析最终用户、租户、公司、角色、字段可见性和 service principal 边界，并在查询执行前用这些上下文收敛 query model、权限过滤、审计和拒绝策略。

适合读者：

- 企业 AI 平台工程师；
- MCP / tool calling 工具开发者；
- Odoo / ERP 技术实施团队；
- 负责身份、权限和审计的数据平台工程师。

### 10. AI-driven analytics 不能只靠 LLM + SQL：指标口径、权限和复核流程缺一不可

[阅读全文](./ai-driven-analytics-metrics-governance.md)

第十篇讨论 AI 分析结果的可信边界。

文章重点说明：LLM + SQL 可以帮助用户进入数据分析流程，但不能替代指标口径、权限切片、语义模型和复核流程。生产级 AI analytics 应该优先调用受治理的 metric / query model，在用户上下文下执行查询，并保留 metric version、过滤条件、权限摘要、provenance 和人工复核证据。

适合读者：

- 企业数据平台工程师；
- BI / 指标平台负责人；
- AI analytics 产品和架构团队；
- ERP / Odoo 技术实施团队。

## 推荐阅读顺序

如果你从企业 AI 数据访问整体架构开始，建议按下面顺序读：

1. [AI 查询 ERP 数据库时，为什么不该默认让模型写 SQL](./ai-sql-erp-governed-semantic-query.md)
2. [MCP 只是传输协议，企业数据安全边界应该在工具设计里](./mcp-transport-governed-tool-boundary.md)
3. [从 Odoo record rules 看 AI 数据查询的权限治理](./odoo-record-rules-ai-query-governance.md)
4. [raw schema 不是业务授权模型：AI 数据访问为什么需要语义层](./raw-schema-is-not-business-authorization-model.md)
5. [企业 AI 问数的澄清与拒绝：比“回答一切”更重要](./clarify-reject-fail-closed-ai-data-query.md)
6. [生产级 AI 查询需要 audit 和 provenance，而不只是一个答案](./audit-provenance-ai-data-query.md)
7. [语义查询能力应该分层承诺：DSL、Semantic SQL、CTE 与小结果二次分析](./semantic-query-capability-layers.md)
8. [Odoo AI 问数的部署边界：Community、Pro 与 self-hosted 应该怎么讲](./odoo-ai-query-deployment-boundaries.md)
9. [给业务系统接 AI 工具前，先定义有效用户上下文](./effective-user-context-ai-tools.md)
10. [AI-driven analytics 不能只靠 LLM + SQL：指标口径、权限和复核流程缺一不可](./ai-driven-analytics-metrics-governance.md)

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

## 后续方向

第一批文章已经覆盖企业 AI 数据访问治理的主线。后续可以继续展开：

- Odoo 多公司 / 多租户 AI 查询的工程细节；
- 语义模型版本管理和灰度发布；
- AI 查询结果的缓存、预聚合和性能边界；
- 从只读问数到受控业务动作的 tool design。

这些文章会优先保持技术可信和边界清晰，不把 AI 描述成可以绕过权限、任意写 SQL 或自动写回业务数据的工具。
