# 受治理表达式能力参考

> 版本口径：v2.0
>
> 状态：窄合同可用
>
> 实现范围：Java compiler / validator

受治理表达式是 v2.0 中 relation result-stage 的小公式能力。它解决的是“上一阶段已经得到一组指标 alias，下一步要计算比率、差额、偏差、标签或分桶”的问题。

它不是任意表达式语言，也不是让 LLM 写 SQL 片段。

## 已签表达式面

| 表达式 | 用途 | 边界 |
|---|---|---|
| metric ratio | `metricA / metricB` 类占比、均值或转化率 | 引用 signed aliases |
| metric difference | `metricA - metricB` 类差额 | 引用 signed aliases |
| metric delta ratio | `(metricA - metricB) / metricB` 类差异率、偏差率 | 基准指标必须明确 |
| absolute metric delta ratio | `abs(metricA - metricB) / metricB` 类绝对偏差率 | 只表达显式绝对值语义 |
| single-threshold label | 单阈值 CASE 标签 | 不开放任意 CASE |
| ordered numeric bucket | 单数值 alias 的显式有序分桶 | label postSlice 只允许等值类操作 |
| same-stage alias DAG | 同一 derive stage 内 signed alias 依赖自动分层 | 只能是无环 DAG |
| signed ranking | 累计贡献等 result-stage 排名合同中的 `rank()` | 不签其他 ranking function |

## Alias 依赖规则

表达式只能引用受治理 alias：

- aggregate stage 输出的 metric alias。
- 上一层 derive 输出的 signed alias。
- same-stage DAG 自动分层后已经可见的 signed alias。

表达式不能引用：

- 物理字段。
- 未授权字段。
- 不在上一阶段输出中的字段。
- 未签函数或任意 SQL 片段。

## Ordered Bucket 合同

ordered numeric bucket 只签收以下形态：

- source 是单个 visible numeric alias。
- threshold 是显式数字边界。
- label 是短单行 literal。
- else label 明确。
- 对 bucket label 的 postSlice 只允许 `=`、`!=`、`<>`。

不支持多字段 bucket、嵌套 CASE、动态 label 或范围型 label 过滤。

## Ranking 合同

result-stage ranking 当前只签收 `rank()` 相关窄合同：

- `rank_function=rank`。
- 排序 metric 明确。
- 排序方向明确。
- 有 deterministic tie-breaker。
- running total frame 明确。
- postSlice 只能引用允许的 aliases 和 operators。

`dense_rank()`、`row_number()`、`percent_rank()`、`cume_dist()`、`ntile()` 不属于 v2.0 signed ranking。

## Fail-closed 规则

以下请求应拒绝：

- 任意 SQL expression。
- 任意函数调用。
- 任意 CASE。
- aggregate / window function 自由嵌入。
- 同阶段 alias cycle。
- 用 derived alias 替代只允许 aggregate metric alias 的 signed formula。
- 通过表达式构造未授权字段访问。

## 设计原因

业务分析需要小公式，但自由表达式会迅速破坏语义层边界。v2.0 选择 signed formula subset，是为了让常见指标计算可用，同时让 validator 能稳定判断：

- 公式是否属于已签能力。
- 字段和 alias 是否可见。
- 结果是否可以被 postSlice、orderBy 或 Pivot 安全引用。

