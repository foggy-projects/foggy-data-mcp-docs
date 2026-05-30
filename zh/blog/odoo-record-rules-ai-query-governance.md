# 从 Odoo record rules 看 AI 数据查询的权限治理

如果要给 Odoo 接一个 AI 问数工具，最容易做的 demo 是直接连 PostgreSQL：

1. 读取 Odoo 数据库 schema。
2. 让模型理解表结构。
3. 生成 SQL。
4. 执行查询。
5. 把结果总结给用户。

这条路径很快，但它绕过了 Odoo 里最重要的一层事实：Odoo 用户不是 PostgreSQL 用户。

一个 Odoo 用户能看到什么，不是由数据库账号单独决定的，而是由 Odoo 应用层里的模型访问权限、记录规则、多公司边界、字段可见性和业务逻辑共同决定的。

所以 AI 查询 Odoo 数据时，真正的问题不是：

```text
模型能不能写出 sale_order 的 SQL？
```

而是：

```text
查询执行前，系统有没有保留当前 Odoo 用户本来应该受到的权限约束？
```

如果答案是否定的，这个 AI 工具就不是 Odoo 的自然语言问数入口，而是数据库旁路。

## Odoo 的权限边界在应用层

Odoo 权限不是单一开关。它通常由几层共同决定。

### model access

`ir.model.access` 控制用户或用户组是否可以读、写、创建、删除某个模型。

例如，一个用户可能可以读取 `sale.order`，但不能读取某些 HR 模型；也可能能看订单，但不能写订单。

对 AI 查询来说，第一条原则很简单：

```text
用户没有读权限的 Odoo model，不应该出现在 AI 可查询模型里。
```

这意味着工具发现阶段就应该收敛，而不是把所有 query model 都暴露给 AI client，再要求模型“不要查不该查的”。

### record rules

`ir.rule` 是 Odoo 行级权限的核心机制。它决定用户在一个模型中能看到哪些记录。

典型规则包括：

- 销售只能看自己的订单；
- 员工只能看所在部门相关数据；
- 用户只能看所属公司的记录；
- 某些审批状态的数据只有特定角色可见；
- 实施商自定义的业务域限制。

这些规则经常以 Odoo domain 的形式存在，例如：

```python
[('company_id', 'in', user.company_ids.ids)]
```

或：

```python
['|', ('user_id', '=', user.id), ('team_id.member_ids', 'in', [user.id])]
```

如果 AI 查询绕过 Odoo 应用层，直接查 PostgreSQL，这些 record rules 不会自动生效。

### multi-company

Odoo 的多公司不是简单的字段过滤。

不同模型可能用 `company_id`、`company_ids`、关联对象公司、层级公司或共享记录表达公司边界。某些数据可能跨公司共享，某些数据必须严格隔离。

AI 查询如果没有保留 multi-company context，就可能出现两个问题：

- 用户看到不属于当前公司范围的数据；
- 聚合指标把多个公司混在一起，造成错误业务判断。

### field visibility

即使用户能读取某个模型，也不代表所有字段都应该返回给 AI。

例如：

- 成本价；
- 薪资字段；
- 员工隐私信息；
- 内部备注；
- 审批敏感字段；
- 实施商自定义敏感字段。

字段边界不能只靠模型最终回答时自觉隐藏。敏感字段最好不要进入 AI client 的可见结果集。

## 为什么“回答后再过滤”不够

有些方案会先查出数据，再让模型或中间层过滤不该展示的部分。

这在安全上是不够的。

只要完整数据已经离开受控执行边界，风险就已经发生：

- 模型上下文可能收到敏感字段；
- 中间日志可能记录完整结果；
- 工具调用返回值可能被 agent runtime 保存；
- 后续步骤可能把结果导出或写入别处；
- 错误信息可能泄露内部字段。

所以对 Odoo 这类业务系统，权限治理必须前置。

更可靠的原则是：

```text
不允许当前用户看到的数据，不应该被查询出来。
```

而不是：

```text
先查出来，再提醒模型不要展示。
```

## 查询执行前应该发生什么

一个更合理的 Odoo AI 查询路径，可以分成几个阶段。

## 1. 绑定 effective Odoo user

AI client 发起请求时，服务端必须知道它代表哪个 Odoo 用户。

这个用户不能由 prompt 声明，也不应该由模型自己选择。它应该来自 Odoo 侧的登录态、API key、token、session 或其他受控认证机制。

绑定 effective user 后，后续所有模型可见性、record rules、多公司边界和字段控制都应该基于这个用户计算。

如果无法确认 effective user，请求应该失败。

## 2. 收敛可见 query model

AI 不应该看到完整数据库 schema。

它应该看到当前用户可用的一组业务查询模型，例如：

- 销售订单分析；
- 客户贡献分析；
- 应收账款分析；
- 采购金额分析；
- 库存流转分析；
- CRM pipeline 分析。

这些 query model 背后可以映射到 Odoo 模型和字段，但对 AI 暴露的是业务接口，而不是物理表。

当用户没有某个 Odoo model 的读权限时，对应 query model 不应该出现在工具列表里。

## 3. 把 record rules 转成查询前置条件

这是 Odoo 权限治理的关键部分。

如果某个 query model 映射到 `sale.order`，查询执行前就应该拿到当前用户对 `sale.order` 生效的 record rules，并把它们转换为查询条件。

例如：

```python
[('company_id', 'in', user.company_ids.ids)]
```

应该变成查询执行层能理解的公司过滤。

如果存在 `child_of`、`parent_of`、多级组织或公司层级规则，就需要有明确的层级映射方式，而不是忽略它们。

如果某条规则引用了当前语义模型无法映射的字段，安全默认值应该是拒绝查询，而不是放行查询。

这就是 fail closed。

## 4. 应用 multi-company context

Odoo 用户可能同时属于多个公司，也可能当前只在一个 active company 下操作。

AI 查询必须明确使用哪个 company scope：

- 当前 active company；
- 用户允许访问的 company set；
- 请求中显式选择的公司；
- 某些模型允许跨公司共享的例外。

如果公司范围不清楚，系统应该澄清或拒绝，而不是自动查所有公司。

尤其是聚合类问题，例如：

```text
统计本月销售额。
```

如果没有公司范围，结果可能在业务上没有意义，甚至包含用户不应混看的数据。

## 5. 处理字段边界

字段治理至少要发生在两个位置。

第一，工具描述和 query model metadata 不应该暴露不可见字段。

如果某个字段对当前用户不可见，它就不应该成为 AI 可选择的 filter、dimension、measure 或返回列。

第二，查询结果返回前要做字段裁剪。

即使底层执行为了 join 或计算临时使用某些字段，也不代表这些字段可以返回给 AI client。

## 6. 保留审计证据

Odoo AI 查询的结果不应该只是一段自然语言。

系统至少应该能回答：

- 哪个 Odoo 用户发起请求；
- 使用了哪个 query model；
- 对应哪个 Odoo model；
- 应用了哪些 record rules 或权限切片；
- company scope 是什么；
- 查询参数是什么；
- 返回了多少行；
- 是否发生 clarify 或 reject；
- 是否导出结果。

这些证据不是为了让普通用户每天阅读，而是为了管理员、实施商和审计人员在出现争议时能复查。

## raw SQL 路线的问题

现在可以回头看 raw SQL 路线的问题。

如果 AI client 直接面对 PostgreSQL，它可能生成类似这样的查询：

```sql
SELECT partner_id, SUM(amount_total)
FROM sale_order
WHERE date_order >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY partner_id
ORDER BY SUM(amount_total) DESC
LIMIT 5;
```

这条 SQL 在语法上可能没问题，业务上也可能看起来合理。

但它没有天然回答：

- 当前用户能不能看 `sale.order`；
- 哪些订单被 record rules 排除；
- 当前公司范围是什么；
- `amount_total` 是否是正确指标；
- `partner_id` 对应的客户名称是否可见；
- 是否应该排除取消订单；
- 是否应该按确认订单、开票金额还是回款金额统计；
- 查询过程是否可审计。

这些不是 SQL 字符串本身能解决的问题。

所以在 Odoo 场景里，“模型生成 SQL”不是最重要的能力。更重要的是：查询是否在 Odoo 的业务和权限边界内执行。

## 一个更合适的查询路径

以这个问题为例：

```text
统计最近 30 天销售额最高的 5 个客户。
```

更合适的路径应该是：

1. 识别为销售分析问题。
2. 选择当前用户可见的 sales query model。
3. 确认指标口径，例如 confirmed order amount 或 invoiced amount。
4. 绑定 effective Odoo user。
5. 检查用户对相关 Odoo model 的读权限。
6. 计算并注入 record rules。
7. 应用 multi-company context。
8. 裁剪不可见字段。
9. 执行受控查询。
10. 返回结构化结果和查询证据。

这个过程中可以生成 SQL，也可以使用 DSL、查询引擎或 ORM-like 执行路径。关键不在底层执行形式，而在执行前的治理边界。

## clarify 和 reject 在 Odoo 里很重要

Odoo 业务问题经常带有隐含口径。

例如：

```text
看一下这个月销售额。
```

系统可能需要澄清：

- 是报价单、确认订单，还是已开票金额；
- 是否包含退款或取消；
- 用当前公司还是所有可见公司；
- 按订单日期、确认日期还是发票日期。

再例如：

```text
导出所有客户的全部字段。
```

这类请求可能需要拒绝或进入受控导出流程，因为它涉及字段边界、行数、导出审计和潜在隐私风险。

AI 问数系统不应该把所有自然语言都硬翻译成查询。它应该把“不明确”和“不允许”显式表达出来。

## 对 Odoo 实施团队的检查清单

如果你正在评估或实现 Odoo AI 查询，可以用下面的问题做自检。

身份：

- AI 查询是否绑定 effective Odoo user？
- API key 或 token 是否能追溯到用户或服务主体？
- 是否避免让模型自己声明用户身份？

模型：

- AI 可见的是业务 query model，还是 Odoo 物理表？
- 不可读的 Odoo model 是否从工具列表里隐藏？
- 模型字段是否有业务说明和指标口径？

权限：

- `ir.model.access` 是否在工具发现或模型选择阶段生效？
- `ir.rule` 是否在查询执行前转成过滤条件？
- `child_of`、`parent_of`、多公司层级是否有明确处理？
- 无法映射的权限字段是否 fail closed？

字段：

- 不可见字段是否不会出现在 metadata 里？
- 敏感字段是否不会返回给 AI client？
- 导出是否独立受控？

审计：

- 是否记录 query model、Odoo model、用户、参数和权限边界？
- 是否能解释结果为什么被允许返回？
- clarify / reject 是否被记录？

如果这些问题没有答案，那这个方案可能只是“AI 连上了 Odoo 数据库”，还不是“AI 在 Odoo 权限边界内问数”。

## 小结

Odoo 的权限治理给 AI 数据访问提供了一个很好的现实样本。

它提醒我们：业务系统的数据安全边界通常不在数据库 schema 里，而在应用层的用户、模型、记录规则、公司范围、字段可见性和业务状态里。

因此，AI 查询 Odoo 数据时，正确默认值不应该是 raw SQL 直连，而应该是：

- 绑定 effective Odoo user；
- 只暴露当前用户可见的 query model；
- 在执行前应用 `ir.model.access`、`ir.rule` 和 multi-company context；
- 对字段和结果做最小化；
- 保留 audit 和 provenance；
- 在不明确时澄清，在越界时拒绝。

Foggy Odoo Bridge / Foggy Data MCP 目前采用的也是这个方向：让 AI client 通过 MCP 和语义查询模型访问 Odoo 业务数据，同时让 Odoo 权限继续控制可见范围。这里的重点不是让 AI 绕过 Odoo 更快查库，而是让 AI 问数进入 Odoo 原有的治理边界。

## 继续阅读

- [技术博客：AI 查询 ERP 数据库时，为什么不该默认让模型写 SQL](/zh/blog/ai-sql-erp-governed-semantic-query)
- [技术博客：MCP 只是传输协议，企业数据安全边界应该在工具设计里](/zh/blog/mcp-transport-governed-tool-boundary)
- [LLM 语义层引擎白皮书 v1.0](/zh/whitepaper/v1.0/)
- [权限控制（QM）](/zh/dataset-model/api/authorization)
- [MCP 服务架构概述](/zh/mcp/guide/architecture)
