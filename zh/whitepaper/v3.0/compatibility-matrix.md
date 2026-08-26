---
whitepaper_status: DRAFT
frozen: false
last_reviewed: 2026-08-22
---

# v2.0 / v3.0 候选能力对照（草案）

> 本表是评审材料，不是冻结的兼容性承诺。v2.0 的既有公开语义不因本表改变。

| 能力域 | v2.0 已冻结口径 | 当前 Java Runtime 证据 | v3.0 状态 |
| --- | --- | --- | --- |
| TM/QM 基础语义 | 已发布的语义层、查询 DSL 和模型参考 | bridge engine/catalog/model SPI | 保留，需确认版本映射 |
| 单模型查询 | 受治理结构化查询 | `dataset.query_model`、Runtime query routes | 候选稳定 |
| Compose/跨模型 | v2 能力按既有白皮书说明 | `dataset.compose_script`、Compose API | 候选，需冻结边界 |
| DSL_CTE / Pivot / timeWindow | v2 文档中的分层能力 | schema/capabilities 按版本暴露 | 不得统一宣称全支持 |
| 模型发现 | 旧 metadata 入口 | `dataset.list_models` preferred；`get_metadata` legacy | 建议升级 |
| Explain | v2 未定义为历史执行 trace | `dataset.explain_query` 与 Runtime explain | 需冻结证据语义 |
| Namespace | 实现/集成边界已有约定 | `X-NS`、binding、catalog 隔离 | 候选公共契约 |
| Authoring workspace | 不是 v2 基础承诺 | workspace、candidate、publish/recover | 候选，需生产范围确认 |
| Release/promotion/rollback | 非统一 v2 基础契约 | release package 与 promotion routes | 候选，需恢复语义确认 |
| 权限 | 以模型/宿主能力为边界 | 管理 code、opaque Authorization、QM/TM policies | 需完成公开安全闭环 |
| AI Provider | 依实现/部署配置 | 结构化工具可无 Provider，NL 条件启用 | 候选分级 |
| 图表 | 旧工具名存在于历史文档 | XChart/ECharts 分离 | 必须升级名称和依赖说明 |
| 远程数据源/部分 addon | 不自动视为核心能力 | 以具体 addon 实现为准 | 保持条件性声明 |

## 评审结论字段

冻结前每一行还需要补充：实现版本、最小验证命令、失败语义、审计字段、兼容策略、中文/英文文档负责人和发布日期。任何缺少这些证据的行保持“候选”状态。

