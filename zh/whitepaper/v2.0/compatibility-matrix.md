# v1.0 / v2.0 能力对照矩阵

> 版本口径：v2.0
>
> 文档用途：说明 v2.0 如何接替 v1.0 描述新增能力，同时保留 v1.0 的基础语义层契约。

v2.0 不是对 v1.0 的废弃声明。v1.0 中的 TM/QM、JSON Query DSL、MCP 工具协议、权限治理和查询证据仍然是基础契约。v2.0 在这些基础上增加 Java-first 的复杂分析、trace、Memory Grid、Pivot 和 Experience Recipe 能力。

## 总体关系

| 维度 | v1.0 | v2.0 | 升级建议 |
|---|---|---|---|
| 文档定位 | 基础语义层白皮书 | 新增能力白皮书 | v1.0 继续作为基础语法和概念入口 |
| 实现口径 | 已实现基础能力 | Java-first 新能力 | 不把 v2.0 自动理解为所有语言实现完全 parity |
| 能力边界 | 语义查询、MCP、Compose、治理证据 | 复杂分析、trace、Memory Grid、Pivot、Recipe | 每个新增能力按 signed contract 接入 |
| 发布关系 | 冻结维护 | 接替 v1.0 继续演进 | 不向 v1.0 追加新能力 |

## 能力对照

| 能力域 | v1.0 | v2.0 | 兼容性 |
|---|---|---|---|
| TM/QM 语义建模 | 已覆盖 | 继承 | v2.0 不重写基础语法，继续引用 v1.0 参考 |
| JSON Query DSL | 已覆盖 | 继承并作为基础查询面 | 原有请求模型不需要因 v2.0 改写 |
| MCP 工具协议 | 模型发现、描述、查询、组合 | 增加 Java MCP re-dispatch 和 trace 证据 | 工具入口兼容，新增 debug/evidence 字段 |
| 权限治理 | 字段校验、模型可见性、行级切片 | 继续执行，并扩展到 Recipe、Memory Grid、Pivot 合同 | v2.0 不放松权限边界 |
| 查询证据 | 查询载荷、SQL、状态、结果样本 | 增加 trace、stage plan、contract evidence、recipe evidence | 证据字段更丰富，集成方应兼容新增 debug 信息 |
| Compose | 多步骤查询和中间结果分析 | 与 DSL_CTE / Memory Grid 分层协作 | 复杂分析建议迁移到 signed stage plan |
| DSL_CTE | 未作为 v1.0 主能力 | 分阶段分析窄合同 | 只接入已签 stage 和 bridge template |
| Governed Expression | 基础计算字段和查询时计算 | result-stage signed formula subset | 不应替代为自由表达式语言 |
| Period-over-period | 后续方向或局部能力 | 月同比、季度同比等窄模板 | 不自动扩展为任意时期对比 |
| Funnel / Attribution | 后续方向或局部能力 | CRM lead funnel、target-event window、target-month matched bucket | 不自动扩展为通用漏斗 |
| Memory Grid | 组合式分析方向 | 有界结果集二次分析、handle lifecycle、alignment contract | 只处理 bounded result handle |
| Pivot | 基础说明或单独组件能力 | tree axis、axis window、cascade drilldown runtime contract | 不等于完整 BI 透视产品 |
| Experience Recipe | 后续方向 | registry exact lookup、治理过滤、发布门和签名 SPI | 不等于完整 recipe 市场或向量检索 |
| 多数据库方言 | 方言抽象基础能力 | 补复杂分析相关 parity 证据 | 窄证据不自动扩大为完整 release gate |
| Python parity | 可有独立实现 | v2.0 以 Java-first 能力为主 | Python 对齐需单独看 parity 记录 |

## 集成影响

已有 v1.0 集成可以保持以下部分不变：

- TM/QM 模型结构。
- 基础 JSON Query DSL 查询。
- 基础 MCP list / describe / query 调用。
- 基础权限和行级切片策略。

建议新增或调整：

- 在客户端展示或记录 trace id、debug evidence 和 contract evidence。
- 对复杂分析引入 DSL_CTE / Memory Grid / Pivot 的 signed contract，而不是继续扩写自由 prompt。
- 对高频业务分析建立 Experience Recipe，但保持 recipe 经过 namespace、tenant、permission 和 owner 过滤。
- 对未签能力使用澄清或拒绝，不把失败请求降级到裸 SQL。

## 迁移顺序

推荐按风险从低到高逐步采用 v2.0：

1. 启用非阻断 trace 和查询证据展示。
2. 接入 DSL_CTE 已签 stage 的只读验证。
3. 对 result-stage signed formula 做小范围场景试点。
4. 对有明确业务价值的 Pivot shape 开启 runtime contract 展示。
5. 对跨模型小结果分析引入 Memory Grid alignment contract。
6. 对重复出现的复杂分析沉淀 Experience Recipe。

## 不兼容风险

v2.0 本身不要求破坏 v1.0 集成，但以下行为可能导致误用：

- 把 v2.0 的 Java-first 能力理解成 Python 或所有部署模式已同步。
- 把 signed contract 理解成泛化能力。
- 忽略 debug evidence 中的 unsigned shapes。
- 让 recipe 绕过模型、权限或 validator。
- 把 Memory Grid 当成无界内存 SQL 引擎。
- 把 Pivot contract 当成完整前端 BI 产品。

## 结论

v1.0 继续承担基础语义层契约；v2.0 承担新增复杂分析能力说明。升级时应采用“继承基础、逐项签约、证据可见、失败关闭”的策略。

