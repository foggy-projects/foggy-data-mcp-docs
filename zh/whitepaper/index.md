# LLM 语义层引擎白皮书

Foggy 是面向 LLM 的语义层引擎，用结构化语义模型和治理执行层连接 AI 与业务数据。

## 文档

- [Foggy LLM 语义层引擎技术白皮书](./foggy-data-mcp-technical-whitepaper.md)
- [TM/QM 语义层定义总览](./semantic-layer-syntax-reference.md)
- [TM 定义参考](./tm-definition-reference.md)
- [QM 定义参考](./qm-definition-reference.md)
- [JSON Query DSL 语法参考](./query-dsl-syntax-reference.md)
- [预聚合能力参考](./pre-aggregation-reference.md)

## 适合读者

本专题文档面向开发者、AI 工具集成方、数据平台负责人和技术采购评估者，帮助他们了解如何为 LLM 提供一个可建模、可治理、可审计的业务数据语义层，而不是把裸 SQL 或数据库 schema 直接交给模型。

## 文档定位

技术白皮书说明 Foggy 的定位、架构和能力边界；语法参考按对象属性分别组织 TM、QM 和 JSON Query DSL，不展开部署、目录结构或快速上手流程。

## 当前版本口径

- 中文稿是本轮评审主版本，英文版待中文内容确认后再同步翻译。
- 当前能力只描述已经实现并经过验证的语义建模、DSL 查询、Compose 组合式分析、治理和证据能力。
- Virtual Semantic SQL 属于下一阶段引擎方向，不作为当前稳定功能使用。
