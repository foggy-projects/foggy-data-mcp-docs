# Pivot v2 能力参考

> 版本口径：v2.0
>
> 状态：窄合同可用
>
> 实现范围：Java 引擎

Pivot v2 是 Java 引擎中受治理多维透视的 runtime contract。它把透视结果的轴、窗口、树形结构和下钻边界暴露为可审计证据，而不是把透视逻辑留给前端临时解释。

## 定位

Pivot 适合：

- 基于受治理聚合结果生成行轴、列轴和指标矩阵。
- 对 rows axis 使用 parent-child tree。
- 对轴域做受控窗口和分页。
- 对级联下钻路径输出 contract evidence。
- 对未签 shape 明确列为 unsigned，而不是静默执行。

Pivot 不等同于完整 BI 透视表产品。

## Runtime Contract

v2.0 Pivot 响应应在 debug metadata 中暴露 `pivotEngineContract`，用于说明：

- contract 名称和版本。
- `signed=true`。
- output format。
- row / column fields。
- metrics。
- execution path。
- axis contract。
- tree axis contract。
- drilldown contract。
- required capabilities。
- unsupported combinations。
- unsigned shapes。

## 已签能力

| 能力 | 说明 |
|---|---|
| tree axis | rows-axis parent-child tree |
| axis window | 轴域窗口、limit、offset、effective offset 证据 |
| axis domain selection | 受控轴域选择 |
| cascade drilldown | 级联下钻生成路径和 required capability |
| derived metric scope | 已签范围内的透视结果派生指标 |
| weekday dialect parity | weekday 口径在相关方言中保持一致 |

## Tree Axis 边界

tree axis 当前只签 rows-axis parent-child tree：

- hierarchy field 明确。
- dimension 明确。
- id field 明确。
- skeleton node evidence 可见。

不签收：

- columns tree。
- crossjoin tree。
- tree axis domainSlice start / offset。
- domain tree cursor。
- 任意 interactive expand / collapse state。

## Drilldown 边界

drilldown contract 可描述：

- axis domain selection。
- rows child per-parent window。
- cascade generate 已实现路径。

不应扩大为通用 domain tree cursor，也不应把前端交互状态当成引擎语义。

## 方言证据

v2.0 可声明以下窄证据：

- SQLite fast path / fixture。
- MySQL8 / PostgreSQL pivot parity。
- PostgreSQL P2 DSL_CTE / pivot environment-gated evidence。
- SQL Server weekday parity evidence。

这些证据不等于完整 SQL Server release gate。

## Fail-closed 规则

以下情况应拒绝或列为 unsigned：

- 未签 rows / columns tree shape。
- 未签 domainSlice start / offset。
- 未签 interactive expand / collapse。
- 未签 multi-level domain cursor。
- 越权字段、未授权指标或不可见轴字段。

## 与产品 UI 的关系

Pivot v2 是引擎合同，不是产品 UI。前端可以基于 `pivotEngineContract` 展示树轴、下钻和 unsupported shapes，但不能用 UI 逻辑补签未实现的引擎语义。

