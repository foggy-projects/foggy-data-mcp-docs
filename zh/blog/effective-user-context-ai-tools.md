# 给业务系统接 AI 工具前，先定义有效用户上下文

很多团队把 AI 工具接入业务系统时，第一反应是先解决调用链：

- AI client 怎么调用 MCP server；
- MCP server 怎么连接业务系统；
- tool schema 怎么描述；
- prompt 怎么写得更聪明；
- 查询结果怎么返回给用户。

这些都重要，但还有一个更靠前的问题经常被跳过：

> 这次 AI 工具调用到底代表谁？

如果这个问题没有定义清楚，后面的权限、审计、结果可信度和责任边界都会变得很脆。

企业系统里的“用户”不是一个抽象概念。它通常和租户、公司、部门、角色、数据域、字段可见性、审批权限、导出权限和审计责任绑定在一起。AI 工具如果只拿一个服务端 API key 或数据库账号就开始查数据，本质上是在绕开业务系统里最关键的一层上下文。

## API key 不是业务用户

很多 AI tool 的第一版实现会长这样：

```text
AI client
  -> MCP tool
  -> service API key / database account
  -> business database
```

这条链路可以跑通 demo，但它很容易把“工具身份”误当成“业务用户身份”。

API key 只能说明 tool service 被允许访问某个系统。它不能自动说明：

- 最终发起问题的人是谁；
- 这个人属于哪个租户或公司；
- 这个人有哪些业务角色；
- 这个人是否能看某个对象、记录或字段；
- 这次查询是否允许跨公司、跨门店或跨团队；
- 审计日志应该记到谁身上。

如果没有这些信息，AI 工具最多只能说“我用某个技术账号查到了数据”，不能说“这是当前业务用户有权看到的数据”。

这就是 effective user context 的意义。

## 什么是 effective user context

effective user context 可以理解为：一次工具调用在业务系统里的实际执行身份和授权上下文。

它不只是一个 `user_id`。在企业应用里，它至少应该包含几类信息：

| 维度 | 示例 | 用途 |
|---|---|---|
| 用户身份 | Odoo user、企业账号、CRM user | 审计和权限判断主体 |
| 租户 / 组织 | tenant、company、workspace | 防止跨租户或跨组织访问 |
| 业务范围 | allowed companies、sales teams、warehouses | 限定记录可见范围 |
| 角色 / 组 | accountant、sales manager、inventory user | 判断模型、字段和动作权限 |
| 会话来源 | web session、MCP client、service job | 区分交互式查询和后台任务 |
| 工具能力 | read query、export、write draft、approve action | 控制工具能做什么 |
| 审计标识 | request id、trace id、actor id | 方便复核、追踪和问责 |

不同系统字段不同，但原则一样：AI 工具执行前必须知道它代表哪个业务主体，并把这个主体带入权限和审计链路。

## 三种常见身份模式

AI 工具接业务系统时，常见有三种身份模式。

| 模式 | 说明 | 适用场景 | 风险 |
|---|---|---|---|
| 固定服务账号 | 所有查询都用同一个后端账号执行 | 后台批处理、系统级汇总、低敏只读指标 | 容易把所有用户权限扩大成服务账号权限 |
| delegated user | 工具调用绑定最终业务用户 | 交互式问数、权限敏感查询、ERP / CRM 明细查询 | 实现复杂，需要可靠传递用户和授权上下文 |
| admin / superuser | 使用管理员身份执行 | 初始化、维护、受控运维任务 | 不适合作为默认 AI 查询身份 |

很多生产风险来自把第三种模式包装成第一种或第二种。

比如，工具服务内部用管理员账号访问 Odoo 或数据库，然后对外说“用户可以问 Odoo 数据”。这句话没有说明：结果是不是按当前用户的 `ir.model.access`、record rules、multi-company 和字段组过滤过。

如果没有过滤，那它只是 admin-view data query，不是 user-scoped AI query。

## Odoo 场景里的具体问题

Odoo 是一个很好的例子，因为它的权限并不只是数据库层面的。

一次 Odoo AI 查询如果要代表某个用户，至少要考虑：

- `ir.model.access`：用户是否能读这个 model；
- `ir.rule`：用户能看哪些记录；
- multi-company：当前 company 和 allowed companies 是什么；
- 用户组：某些字段或菜单是否只对特定组可见；
- active test / context：是否包含归档记录、语言、时区等上下文；
- record ownership：销售、采购、项目等模块里的负责人范围；
- 审计主体：查询日志记的是最终用户还是服务账号。

如果 AI 工具绕开 Odoo 应用层直接访问 PostgreSQL，就必须有另一套机制把这些规则显式带入查询计划。否则，数据库账号看到的数据范围很可能大于业务用户看到的数据范围。

这也是为什么“raw schema + Text-to-SQL”在 ERP 场景里很危险。schema 只能告诉模型有哪些表和字段，不能告诉模型当前用户是否应该看这些记录。

## service principal 也要被治理

并不是所有工具调用都必须绑定最终用户。

有些场景确实需要 service principal：

- 定时生成管理报表；
- 每日库存异常检查；
- 财务月结前的数据质量巡检；
- 系统集成任务；
- 跨租户但已脱敏的运维指标。

但 service principal 也不能是一个模糊的“后台账号”。它应该有明确边界：

- 这个账号服务于哪个租户或组织；
- 它能访问哪些 query model；
- 它是否能看明细，还是只能看聚合；
- 它是否能导出结果；
- 它是否能触发写回或审批；
- 它的查询是否需要额外审批或留痕；
- 它的凭证如何轮换和吊销。

service principal 的风险在于它通常权限更稳定、更宽、更容易被长期使用。越是这样，越不能让它变成 AI 工具的默认万能身份。

## effective user 应该进入工具入参还是服务端上下文

一个常见设计问题是：effective user context 应该由 LLM 在 tool arguments 里传入，还是由服务端从会话里解析？

生产系统里，不应该让 LLM 自己声明最终用户。

更稳的链路是：

```text
authenticated user session
  -> server-side identity resolver
  -> effective user context
  -> governed tool execution
  -> audit / provenance
```

LLM 可以提出查询意图，但不能决定自己代表谁。

也就是说：

- `user_id`、tenant、company、groups 不应该由模型自由填写；
- tool arguments 可以包含业务问题、过滤条件、指标选择；
- 身份上下文应该来自登录态、token、网关、后端会话或受信任的系统集成；
- 工具执行层应该把身份上下文和查询计划一起审计。

如果确实存在“代理某人查询”的场景，也应该由服务端做 impersonation 校验，而不是让模型在参数里写一个目标用户 ID。

## 查询模型需要按上下文收敛

effective user context 不应该只在 SQL 最后拼一个 `where company_id in (...)`。

更好的做法是，在查询执行前就用上下文收敛可用能力：

- 当前用户能看到哪些 query model；
- 每个 query model 里哪些维度和指标可见；
- 哪些过滤条件是必需的；
- 哪些字段需要脱敏；
- 哪些聚合层级允许返回；
- 结果行数和导出能力如何限制；
- 请求不清楚或越权时应该澄清还是拒绝。

这样做的好处是：AI client 看到的工具能力本身就是被治理过的，而不是把一个巨大 schema 暴露出去，再期待模型“自觉遵守权限”。

在 Odoo 场景里，这意味着 effective user 应该影响可见 model、record rule domain、allowed companies、字段可见性和审计字段。对其他 ERP、CRM 或电商系统来说，也应该有同等语义的上下文约束。

## 审计日志里必须能看出“谁问了什么”

没有 effective user context，audit 很容易变成没有业务意义的技术日志。

例如只记录：

```json
{
  "tool": "query_sales_orders",
  "serviceAccount": "mcp-prod-reader",
  "sqlHash": "..."
}
```

这对排查系统错误有帮助，但对业务审计不够。它没有说明最终用户是谁，也没有说明这次查询对应哪个租户、公司和权限切片。

更有用的审计记录至少应该包括：

- actor：最终用户或 service principal；
- tenant / company / allowed scope；
- tool name 和 tool version；
- query model 和字段集合；
- 权限过滤摘要；
- 结构化查询或查询 hash；
- 返回行数、截断、脱敏信息；
- clarify / reject / success 状态；
- request id / trace id；
- 时间、来源 client 和会话信息。

这不是为了堆日志，而是为了回答三个问题：

1. 当时谁有权发起这个查询？
2. 结果是基于什么权限和模型生成的？
3. 事后能否复核和重放关键判断？

## 不要把用户上下文交给 prompt

有些实现会在 prompt 里写：

```text
The current user is a sales manager. Only answer questions within their permissions.
```

这可以作为辅助说明，但不能作为安全边界。

原因很简单：

- prompt 不是强制权限系统；
- 模型可能误解或忽略；
- 用户可能通过上下文注入改变指令；
- prompt 不能可靠表达复杂 record rules；
- prompt 无法替代服务端审计和执行约束。

权限应该在工具执行层、查询模型层和业务系统上下文里生效。prompt 可以解释限制，但不能承担限制本身。

## 一个设计检查清单

在给业务系统接 AI 工具前，可以先问这些问题：

- 工具调用代表最终用户、service principal，还是管理员？
- effective user context 从哪里来？
- LLM 是否能伪造或覆盖用户身份？
- tenant、company、workspace 如何传递和校验？
- 用户组、角色、字段可见性如何进入查询执行前？
- record-level 权限是在业务系统里执行，还是在语义层里显式翻译？
- 查询模型是否按用户上下文收敛？
- service principal 是否有独立权限、审计和凭证轮换策略？
- audit 日志能否回答“谁在什么权限下查了什么”？
- clarify / reject 是否也记录 actor 和上下文？
- 写回工具是否和只读查询工具分开授权？

如果这些问题没有答案，先不要急着增加更多 tool，也不要急着让模型看到更多 schema。

## 结论

企业 AI 工具的权限边界，不能建立在“模型会理解用户权限”这个假设上。

更稳的架构是：

- 由受信任的服务端解析 effective user context；
- 用该上下文收敛 query model、字段、记录范围和工具能力；
- 在执行前应用业务权限，而不是执行后靠回答文本解释；
- 对成功、澄清、拒绝、截断和脱敏都做审计；
- 明确区分最终用户、service principal 和管理员身份；
- 把读查询和写回工具分开设计。

Foggy Odoo Bridge / Foggy Data MCP 的定位也应该沿着这个方向表达：它不是让 AI 拿着数据库账号任意查询，而是在业务用户上下文、语义模型和受治理工具边界之上提供 AI 数据访问能力。
