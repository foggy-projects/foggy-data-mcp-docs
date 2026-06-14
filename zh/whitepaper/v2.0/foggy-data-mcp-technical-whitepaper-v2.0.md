# LLM 语义层引擎技术白皮书 v2.0

> 文档版本：v2.0
>
> 版本定位：本版本是 v1.0 之后的新增能力白皮书。它接替 v1.0 继续描述 Foggy 的语义层引擎演进，但不把 v1.0 标记为废弃，也不替代 v1.0 中的基础语法参考。
>
> 实现口径：本文以 Java 引擎已经实现并经过测试、覆盖审计或验收签收的能力为主。规划项、prompt-only 评估和未签收实验能力不写成稳定功能。
>
> 边界声明：本文描述的是公开语义契约和 Java-first 引擎能力边界，不等同于某个 Maven 包、Python 包、Odoo 集成包或产品 UI 的版本号。

## 前言

v1.0 的核心问题是：LLM 与数据库之间应该用什么契约连接？

v2.0 的核心问题进一步推进为：当 LLM 不只做单次筛选、分组和聚合，而是要执行时期对比、漏斗、透视、跨结果对齐、二次分析和经验方案复用时，语义层引擎如何继续保持治理边界？

Foggy v2.0 的答案不是开放自由 SQL，也不是把更多规则塞进提示词，而是在 Java 引擎中引入一组可签收、可验证、可回放的窄执行合同：

- Java MCP 编排层负责路由校准、重新分发和 trace。
- DSL_CTE 承担分阶段的受治理分析。
- relation result-stage 表达式只接受 signed formula subset。
- Memory Grid 承担有界结果集的二次分析。
- Pivot 承担受控多维透视。
- Experience Recipe 承担可治理的经验方案发现和复用。

这些能力共同把 Foggy 从“LLM 语义查询引擎”推进到“LLM 语义分析引擎”，但仍坚持关闭式失败、权限内执行和证据可复核。

---

# 第一部分：从语义查询到语义分析

## 1. v1.0 基础仍然有效

v2.0 不重新定义 Foggy 的基础架构。以下 v1.0 原则仍然是前提：

- TM/QM 把物理表、字段、关系和指标收敛为业务语义契约。
- LLM 通过 JSON Query DSL 或 MCP 工具提交结构化请求。
- 引擎负责字段解析、权限注入、方言转换、执行和证据输出。
- 不在提示词里执行权限，不把裸数据库 schema 交给模型。
- 对不可见字段、未授权访问和不支持能力执行 fail-closed。

v2.0 的新增能力全部建立在这些前提上。它们不是绕过 DSL 和权限治理，而是在治理边界内扩展更复杂的分析形态。

## 2. 新能力的总体分层

v2.0 可以理解为在 v1.0 之上新增五个层次：

| 层次 | 作用 | 关键边界 |
|---|---|---|
| Java MCP 编排层 | 处理路由校准、重新分发、trace 和工具调用链路 | 不让过期计划继续执行；不把 trace 当成权限绕过入口 |
| DSL_CTE 分阶段执行层 | 表达聚合、派生、窗口、后置过滤、排序和有限桥接模板 | 不开放任意 SQL CTE |
| Governed Expression 层 | 在上一阶段输出 alias 上做签名小公式 | 不引用物理字段，不开放任意表达式 |
| Memory Grid 层 | 对受治理查询结果做有界二次分析和跨模型对齐 | 不接收无界明细，不开放任意内存 SQL API |
| Pivot / Recipe 层 | 支持多维透视、下钻合同和经验方案复用 | 不等于完整 BI 产品或经验市场 |

这种分层的价值在于：复杂分析不再被压成一个巨大 SQL，也不依赖 LLM 一次性生成完整物理查询。每一层都有自己的输入、输出、校验和拒绝边界。

## 3. Java MCP 编排：从错误返回到实际重新分发

LLM 问数系统中常见的问题是：初始路由或计划判断错误，后续却继续执行旧计划。v2.0 的 Java MCP 编排层加入 calibrated-route re-dispatch：当校准结果要求重规划时，引擎可以清除过期结果，触发新的 planner/tool path，并在结果中暴露重新分发证据。

这类能力的目标不是让 LLM 永远判断正确，而是在判断需要改变路线时，执行链路能够真正改变。

同时，v2.0 引入非阻断 trace correlation。对不需要重规划的正常查询，引擎可以记录同一 trace 下的模型目录、planner 输出、工具调用、validator 结果和 query result 捕获状态。trace 的作用是支持排查、复核和回放，而不是改变查询语义。

能力边界：

- re-dispatch 仍受模型、权限、validator 和工具 schema 约束。
- freeform 文本回答不能替代结构化查询结果。
- trace 是审计和调试证据，不是新的数据访问入口。

## 4. DSL_CTE：分阶段受治理分析

v1.0 的 JSON Query DSL 适合表达单次语义查询。v2.0 中，Java 引擎进一步把一类复杂分析收敛为 DSL_CTE 分阶段执行：

- aggregate：基于受治理模型做筛选、分组和指标聚合。
- derive：在上一阶段输出 alias 上生成派生字段。
- window_derive：在签名窗口语义内生成累计、排名或相邻结果。
- postSlice：对结果阶段字段做后置过滤。
- orderBy / limit：基于输出字段、分组字段或签名 alias 排序截断。
- join_align：在签名场景中对多个受治理结果做有界对齐。

DSL_CTE 的关键不是“让 LLM 写 CTE”，而是让 LLM 生成结构化 stage plan，由 Java 引擎校验每一阶段是否只引用可见字段和签收 alias。底层是否使用 SQL CTE 是实现细节，不是对 LLM 开放的自由 SQL 能力。

能力边界：

- 不允许物理表名、物理列名或自由 JOIN 条件进入计划。
- 不允许未签收 stage 类型伪装成可执行计划。
- 结果阶段的派生过滤不会静默下推为源表过滤。
- 复杂场景如果缺少时间口径、对齐键、粒度或权限证据，应进入澄清或拒绝。

## 5. Governed Expression：签名小公式而非任意表达式

v2.0 对 relation result-stage 的表达式能力做了扩展，但扩展方式是 signed formula subset，而不是任意表达式语言。

当前 Java 引擎已签收的表达式面包括：

- metric ratio：两个上一阶段指标 alias 的比率。
- metric difference：两个指标 alias 的差额。
- metric delta ratio：差额再除以基准指标，用于差异率或偏差率。
- absolute metric delta ratio：差异率的绝对值版本。
- single-threshold CASE label：单阈值标签。
- ordered numeric bucket：对单个数值 alias 做显式有序分桶。
- same-stage alias DAG auto-layering：同一阶段内签名 alias 依赖可在无环 DAG 中自动分层。
- signed ranking：有限 result-stage ranking 合同，例如累计贡献相关的签名 ranking。

这些能力覆盖了很多业务分析中的“小公式”需求：占比、差额、偏差、分档、排名和后置过滤。它们的安全性来自两个约束：

1. 表达式只能引用上一阶段或已签名分层后的 visible aliases。
2. 表达式形态必须匹配 Java compiler / validator 认可的 signed templates。

明确拒绝的能力包括：

- 物理字段引用。
- 未出现在上一阶段输出中的字段。
- 任意 SQL expression、任意函数或任意 CASE。
- aggregate/window function 自由嵌入。
- 通过表达式绕过字段权限或结果粒度。

## 6. 时期对比、漏斗和归因：模板化签收

时期对比、漏斗和归因是企业分析中高频但风险较高的场景。v2.0 的策略不是直接开放通用能力，而是按业务模板逐项签收。

已经进入 Java-first 签收范围的典型能力包括：

- 月同比、季度同比等 period-over-period 模板。
- 单模型 CRM lead funnel：基于 `convertedOpportunityId`、`convertedOrderId` 等受治理 marker 计算转化率。
- 跨模型 CRM 漏斗的有限 target-event window bridge。
- 跨模型 target-month attribution 的 matched-bucket bridge。
- 优先级感知 SLA、并列 SLA rate、组合分子 SLA rate 等服务工单场景。

这些模板的共同点是：模型、字段、分母、分子、时间窗口、分组和公式都有明确合同。LLM 不需要自由发明漏斗定义，也不能把缺失上下文的复杂归因直接交给引擎执行。

能力边界：

- 不声明通用跨模型漏斗。
- 不声明任意时期对比、财务日历、自然日历和自定义日历的自动推断。
- 不声明任意订单归因、金额归因、质量归因或阶段掉点分析。
- 模板缺少必要参数时应澄清；越过签名模板时应拒绝或转入后续人工建模。

## 7. Memory Grid：受控结果集二次分析

v1.0 中的 Compose 组合式分析强调多步骤查询。v2.0 中，Memory Grid 把“多步骤结果集”进一步收敛为有界、可校验、可审计的二次分析边界。

Java 引擎已经形成以下能力：

- 受治理查询结果可以写入 opaque result handle。
- handle store / storage / resolver 形成最小闭环。
- resolver 读取结果时检查 row limit、cell limit、input grain、join key 和资源上限。
- handle lifecycle 支持 inspect、cleanup、expired 和 invalidated 处理。
- guard descriptor 暴露 backend capability、bounded input、unsupported shapes 和 fail-closed codes。
- 跨模型分析需要 alignment contract，明确 input roles、match keys、grain、version 或 scenario。

Memory Grid 的定位是小结果、受控结果和可复核二次分析，不是把数据库导入内存后让 LLM 任意查询。

明确不签收的能力包括：

- 无界明细输入。
- 任意 DuckDB API 或任意内存 SQL。
- full outer、多 key join、窗口、嵌套表达式等未签收 shape。
- 长期 durable backend、跨服务完整 auth replay 和通用外部 API 暴露。

## 8. Pivot：受治理多维透视

v2.0 将 Pivot 从普通聚合结果展示推进到 Java 引擎签收的多维透视合同。

已实现能力包括：

- pivot tree axis：支持树形轴结构。
- axis window：支持轴域窗口和分页式返回边界。
- axis domain selection：支持受控轴域选择。
- cascade drilldown runtime contract：支持级联下钻合同证据。
- derived metric scope：在已签名范围内支持透视结果派生指标。
- dialect parity：修正 weekday 口径，覆盖 SQLite、MySQL8、PostgreSQL 和 SQL Server weekday evidence 的关键差异。

Pivot 的关键是把多维透视当成引擎合同，而不是前端临时拼装。响应中的 contract evidence 应明确哪些 shape 已签收，哪些组合仍是 unsigned。

能力边界：

- 不开放任意 interactive expand/collapse 语义。
- 不把未签名 shape 当作可执行能力。
- 不声明完整前端透视产品、拖拽报表设计器或 BI 仪表板。
- SQL Server 当前只记录 weekday parity 等窄证据，不等同于完整 SQL Server release gate。

## 9. Experience Recipe：从经验文档到治理资产

复杂业务分析往往需要可复用经验：哪些模型可用，哪些字段组合稳定，哪些参数必须澄清，哪些场景应该拒绝。v2.0 中，Experience Recipe 从离线文档和评测样本推进到最小 Java/MCP registry 能力。

已实现的核心能力包括：

- exact registry lookup。
- active / namespace / tenant / permission / owner 过滤。
- lifecycle gate 和 publish gate。
- evidence artifact refs 的发布门记录。
- artifact hash / URI 形态校验。
- signature verifier SPI 和严格模式 fail-closed。
- governance context injection，让 MCP 请求上下文可进入治理链路。

Experience Recipe 的价值不是让系统盲目套模板，而是让已签收经验在合适的 namespace、tenant、权限和 owner 条件下被发现，并在冲突或缺参时保持可审计。

能力边界：

- 不声明完整 recipe 市场。
- 不声明向量检索、全文检索或混合检索已经进入主线。
- 不声明真实 KMS、信任根、密钥轮换、远端对象存储权限和管理后台已完成。
- recipe 不能绕过 TM/QM、权限、validator 或 signed contract。

## 10. 多数据库方言与证据边界

v2.0 继续坚持方言差异由引擎处理，而不是交给 LLM。新增复杂能力后，方言差异不只出现在基础 SQL，还会影响窗口、日期、weekday、pivot column window 和派生指标。

当前 Java 引擎证据覆盖了：

- SQLite 快速 fixture 和核心回归。
- MySQL8 / PostgreSQL pivot parity release gate。
- PostgreSQL P2 DSL_CTE / pivot environment-gated evidence。
- SQL Server weekday parity evidence。

需要明确的是：窄证据不自动扩大为完整数据库 release gate。尤其是 SQL Server，当前 v2.0 只应声明已有 weekday parity 等签收证据，不应声明完整 SQL Server Maven profile 已成为发布门槛。

## 11. 可观测性与可复核性

v2.0 的复杂分析能力必须配套更强的证据输出。一个结果如果包含重规划、stage plan、Memory Grid handle、pivot contract 或 recipe 命中，就应能展示相应证据：

- 路由校准和实际重新分发状态。
- trace id 和工具调用链路。
- 查询模型、字段、权限和 validator 结果。
- DSL_CTE stage plan 和每阶段输出 alias。
- result-stage expression 的 signed template 和引用依赖。
- Memory Grid handle、资源限制和 guard descriptor。
- Pivot contract、unsupported combinations 和 unsigned shapes。
- Recipe 命中、治理过滤和 evidence artifact 状态。

这些证据的目标不是替代人工判断，而是让人工和系统都能复核：引擎到底执行了什么，拒绝了什么，哪些能力属于签收边界。

---

# 第二部分：能力矩阵

## 12. v2.0 新增能力矩阵

本矩阵只列入 Java 引擎已有实现证据的能力。状态含义如下：

- **已签收**：具备 Java runtime、validator、fixture、CI 或验收记录，可作为 v2.0 稳定能力描述。
- **窄合同可用**：能力可用，但仅在 signed template、特定 shape、特定模型或特定方言证据范围内成立。
- **后续方向**：不进入 v2.0 稳定能力；只能作为后续规划或风险项处理。

| 能力 | 当前状态 | 适合场景 | 不适合场景 |
|---|---|---|---|
| Calibrated-route re-dispatch | 已签收 | 初始计划需改道时重新进入 planner/tool path | 忽略权限或执行自由计划 |
| Non-blocked trace correlation | 已签收 | 成功查询的调试、回放和审计 | 把 trace 当成数据访问 API |
| DSL_CTE stage plan | 窄合同可用 | 分阶段聚合、派生、窗口、排序、后置过滤 | 任意 SQL CTE、自由物理 Join |
| Governed expression subset | 窄合同可用 | 比率、差额、偏差率、标签、分桶、有限 ranking | 任意函数、任意 CASE、任意表达式 |
| Period-over-period templates | 窄合同可用 | 月同比、季度同比等已定义口径 | 通用日历推断、任意时期比较 |
| Funnel / attribution templates | 窄合同可用 | CRM lead funnel、target-event window、target-month matched bucket | 通用跨模型漏斗、复杂归因 |
| Memory Grid | 已签收 | 有界结果集二次分析、跨模型 alignment | 无界明细、任意内存 SQL、完整 durable backend |
| Pivot | 窄合同可用 | 树形轴、轴窗口、下钻、透视派生指标 | 完整 BI、任意透视 shape、未签名交互 |
| Experience Recipe registry | 已签收 | 受治理经验方案精确发现和复用 | 完整市场、向量检索、绕过签收合同 |
| Multi-database evidence | 窄合同可用 | SQLite/MySQL8/PostgreSQL 关键 parity；SQL Server weekday parity | 完整 SQL Server release gate |

## 13. v2.0 不承诺的能力

为了避免误用，以下能力不属于 v2.0 稳定范围：

- LLM 直接执行裸 SQL。
- 任意 Semantic SQL 或任意 CTE。
- 任意跨模型 Join。
- 任意表达式语言、任意函数、任意 CASE。
- 未签收 pivot shape。
- 无界 Memory Grid 或完整 DuckDB API。
- 完整 AI 分析工作台、BI 产品、SQL notebook 或报表设计器。
- 所有 Java-first 能力的 Python 同步 parity。

---

# 第三部分：采用建议

## 14. 集成方如何理解 v2.0

如果你已经基于 v1.0 集成 Foggy，v2.0 不要求推翻原有模型和查询方式。推荐路径是：

1. 保留 TM/QM 和 JSON Query DSL 作为基础查询面。
2. 对高频复杂分析逐项引入 signed DSL_CTE / Memory Grid / Pivot / Recipe 合同。
3. 每引入一个合同，都补充模型字段、权限、测试样本和拒绝样本。
4. 在 UI 或 AI agent 中展示 trace、stage plan、pivot contract 和 recipe evidence。
5. 对未签收场景保持澄清或拒绝，不把失败请求降级成自由 SQL。

## 15. 业务方如何评估 v2.0

业务方不应只问“能不能回答复杂问题”，而应检查以下问题：

- 指标口径是否来自 QM 或 signed formula。
- 时间范围、日历口径、分组粒度是否明确。
- 跨模型分析是否有 alignment contract。
- 透视结果是否暴露 signed / unsigned shape。
- recipe 命中是否满足 namespace、tenant、permission 和 owner。
- 查询结果是否有 trace 和执行证据。

当这些问题无法回答时，系统应该澄清或拒绝，而不是给出看似完整但无法复核的答案。

## 16. 结论

Foggy v2.0 的核心变化，是把 LLM 数据访问从“受治理查询”推进到“受治理复杂分析”。它没有放弃 v1.0 的语义层、结构化 DSL、权限治理和证据原则，而是在 Java 引擎中增加了更细的执行合同、更明确的拒绝边界和更完整的可观测证据。

v2.0 因此适合被理解为 v1.0 的后续能力版本：它接替 v1.0 描述新的 Java-first 引擎能力，但不废弃 v1.0，也不把尚未签收的泛化能力包装成稳定功能。

## 实现证据来源

本文能力口径主要依据以下内部签收与实现记录整理：

- `docs/v3.8/acceptance/version-signoff.md`
- `docs/v3.8/README.md`
- `docs/v3.8/P0-engine-capability-continuation-plan.md`
- `docs/v3.8/coverage/v3.8-engine-capability-coverage-audit-20260528.md`
- `docs/v3.6/P29-relation-expression-compiler-boundary-refactor-report.md`
- `docs/v3.0/acceptance/*`
- `docs/v3.0/coverage/*`

这些记录用于约束 v2.0 的宣传边界：只有具备 Java runtime、validator、fixture、CI 或验收证据的能力才进入本文稳定描述。
