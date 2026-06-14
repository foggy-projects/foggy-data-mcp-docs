# Memory Grid 能力参考

> 版本口径：v2.0
>
> 状态：已签收
>
> 实现范围：Java 引擎

Memory Grid 是 v2.0 的有界结果集二次分析边界。它用于承接受治理查询结果之间的轻量对齐、派生和复核，而不是把数据库明细导入内存后开放任意 SQL。

## 定位

Memory Grid 适合处理：

- 多个受治理查询结果之间的 bounded merge。
- actual / target / forecast 等跨模型指标对齐。
- 小结果集上的二次派生。
- 需要保留 handle、资源限制和审计证据的多步骤分析。

它不适合处理无界明细、大规模计算、自由内存 SQL 或长期持久化分析仓库。

## 已签能力

| 能力 | 说明 |
|---|---|
| opaque result handle | 受治理查询结果写入 handle，LLM 不直接读取 raw rows 或 storage ref |
| store-backed resolver | resolver 通过 handle 读取 bounded rows |
| production guard descriptor | 暴露 backend、replay mode、bounded input、limits、unsupported shapes 和 fail-closed codes |
| lifecycle manager | 支持 inspect、cleanup、expired、invalidated、read exhausted 证据 |
| resource limits | 校验 input count、row limit、output limit、cell count |
| cross-model alignment contract | 多模型输入必须声明 signed alignment contract |
| execution evidence | validate 和 execute path 都回显 guard / alignment / resolver audit |

## Guard Descriptor

`memory_grid_guard` 应暴露以下信息：

- guard profile。
- handle backend。
- handle replay mode。
- bounded input 要求。
- `request_rows_allowed=false`。
- `grid_sql_supported=false`。
- input / output / cell limits。
- supported / unsupported shapes。
- fail-closed code surface。
- handle lifecycle 能力。
- cross-model alignment contract 要求。

## Cross-model Alignment

多模型 Memory Grid 计划必须声明 `alignment_contract`。v2.0 支持的模板包括：

- `bounded_cross_model_metric_merge@v1`
- `bounded_target_achievement_merge@v1`
- `bounded_forecast_deviation_merge@v1`

合同必须绑定：

- input roles。
- match keys，并与 Memory Grid join keys 一致。
- grain。
- version 或 scenario，尤其是 target / forecast 场景。
- derived formula，并与 Memory Grid derived expression 一致。

缺少这些信息时应 fail closed。

## Lifecycle 证据

Memory Grid handle 生命周期证据只暴露安全摘要：

- total / active / expired / invalidated / read exhausted counts。
- deleted handle count。
- deleted storage ref count。
- failure codes。

证据不应包含 raw rows 或裸 `storage_ref`。

## 不纳入 v2.0

Memory Grid v2.0 不承诺：

- free Grid SQL。
- 任意 DuckDB API。
- full outer join。
- multi-key join。
- 未签窗口、嵌套表达式或外部函数。
- DML / DDL。
- 真实 durable backend、分布式锁、后台调度器或完整 admin API。
- 跨服务完整 auth replay。

## 与 DSL_CTE 的关系

DSL_CTE 负责受治理 stage plan。Memory Grid 负责受治理结果集之间的 bounded alignment。跨模型分析优先走 Memory Grid alignment contract，不应通过扩大 DSL_CTE 的自由 Join 能力来实现。

