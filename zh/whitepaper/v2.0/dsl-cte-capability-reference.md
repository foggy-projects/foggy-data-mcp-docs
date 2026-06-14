# DSL_CTE 分阶段分析能力参考

> 版本口径：v2.0
>
> 状态：窄合同可用
>
> 实现范围：Java 引擎

DSL_CTE 是 v2.0 中承接复杂分析的结构化 stage plan。它不是把任意 SQL CTE 暴露给 LLM，而是让 LLM 提交受治理的分阶段分析计划，由 Java 引擎逐阶段校验、编译和执行。

## 定位

v1.0 的 JSON Query DSL 适合单次筛选、分组、聚合和排序。DSL_CTE 面向更复杂但仍可治理的分析：

- 先聚合，再计算派生指标。
- 先输出结果 alias，再做后置过滤或排序。
- 在签名窗口语义下计算累计贡献、排名等 result-stage 指标。
- 在有限 bridge 模板中承接时期对比、漏斗、SLA 和归因类场景。

DSL_CTE 的核心边界是：每个阶段引用的字段、alias、公式和输出都必须可验证。

## 已签能力

| Stage / 合同 | 能力 | v2.0 口径 |
|---|---|---|
| `aggregate` | 基于受治理模型做筛选、分组和指标聚合 | 可作为下游 stage 的输入 |
| `derive` | 在上一阶段输出 alias 上做 signed formula | 不引用物理字段 |
| `window_derive` | 有限窗口合同，如 cumulative contribution + signed `rank()` | 不开放任意 window function |
| `postSlice` | 对 result-stage alias 做后置过滤 | 不静默下推为源表过滤 |
| `orderBy` / `limit` | 基于输出、groupBy 或 signed alias 排序截断 | 不引用不可见字段 |
| bridge template | 月同比、季度同比、CRM 漏斗、SLA、target-event / target-month 等窄模板 | 模板参数必须完整 |

## 计划边界

DSL_CTE stage plan 应保留以下结构化信息：

- source model 或上一阶段输入。
- filters / systemSlice / 权限上下文。
- groupBy 粒度。
- metrics 和 aggregate aliases。
- derived aliases、公式类型和依赖 aliases。
- window contract、排序字段、frame 和 postSlice policy。
- output aliases 和 evidence metadata。

如果计划缺少必要上下文，例如时间范围、分组粒度、对齐键、版本或 scenario，应进入澄清或拒绝。

## Fail-closed 规则

以下请求应关闭式失败：

- 引用物理表、物理列或未授权字段。
- 引用未出现在上一阶段输出中的 alias。
- 把 result-stage 过滤伪装成源表过滤。
- 使用未签 stage 类型。
- 使用未签窗口函数、任意 SQL expression 或自由 JOIN。
- 跨模型分析缺少 Memory Grid alignment contract。

## 不纳入 v2.0

DSL_CTE v2.0 不承诺：

- 任意 SQL CTE。
- 任意跨模型 SQL Join。
- 自由物理表查询。
- 通用时期对比、通用漏斗或通用归因。
- 自动推断财务日历、自定义日历或业务阶段。

## 与其他能力的关系

- 与 Governed Expression：`derive` 和 result-stage 小公式由受治理表达式子集承担。
- 与 Memory Grid：跨模型和多结果对齐优先进入 Memory Grid 的 bounded alignment contract，而不是扩大 DSL_CTE 的 JOIN 面。
- 与 Pivot：透视是独立的 pivot contract，不应混入任意 DSL_CTE shape。
- 与 Experience Recipe：高频复杂分析可以沉淀为 recipe，但 recipe 不能绕过 DSL_CTE validator。

