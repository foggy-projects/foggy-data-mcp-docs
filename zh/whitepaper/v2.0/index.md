# LLM 语义层引擎白皮书 v2.0

Foggy v2.0 白皮书是 v1.0 之后的能力续篇，重点记录 Java 引擎已经实现并签收的新增查询、分析、治理和可观测能力。

v2.0 不把 v1.0 标记为废弃，也不替代 v1.0 中的基础 TM/QM、JSON Query DSL、MCP 工具协议和语法参考。读者应把 v1.0 作为基础契约，把 v2.0 作为新增能力和边界说明。

## 文档

- [v2.0 发布说明](./v2.0-release-note.md)
- [Foggy LLM 语义层引擎技术白皮书 v2.0](./foggy-data-mcp-technical-whitepaper-v2.0.md)
- [DSL_CTE 分阶段分析能力参考](./dsl-cte-capability-reference.md)
- [受治理表达式能力参考](./governed-expression-reference.md)
- [Memory Grid 能力参考](./memory-grid-reference.md)
- [Pivot v2 能力参考](./pivot-v2-reference.md)
- [Experience Recipe 能力参考](./experience-recipe-reference.md)
- [v1.0 / v2.0 能力对照矩阵](./compatibility-matrix.md)

## 适合读者

本版本面向已经了解 v1.0 基础语义层能力的读者，包括 Java 引擎集成方、AI 数据查询平台负责人、企业数据治理负责人和复杂分析能力评估者。

如果你需要了解基础概念，请先阅读 [v1.0 白皮书](../v1.0/)。

## v2.0 版本口径

- v2.0 是接替 v1.0 的后续能力白皮书，不宣布 v1.0 废弃。
- v2.0 重点描述 Java 引擎已经实现并有测试、验收或 CI 证据的新能力。
- v2.0 不重新发布 TM/QM 和 Query DSL 的完整语法参考；相关基础语法仍以 v1.0 参考文档为准。
- 文档中的能力边界按“签收窄契约”描述，不扩大为任意 SQL、任意表达式、任意跨模型 Join 或完整 BI 产品能力。

## 阅读顺序

1. 先读技术白皮书，理解 v2.0 的整体能力分层。
2. 再按能力域阅读 DSL_CTE、Governed Expression、Memory Grid、Pivot 和 Experience Recipe 参考页。
3. 最后用兼容对照矩阵判断 v1.0 集成需要继承什么、扩展什么。
