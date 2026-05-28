# TM/QM 语义层定义总览

本文是 Foggy 语义层定义的总览入口，用于说明 TM、QM 与 JSON Query DSL 之间的分工关系。具体属性语法请分别阅读：

- [TM 定义参考](./tm-definition-reference.md)
- [QM 定义参考](./qm-definition-reference.md)
- [JSON Query DSL 语法参考](./query-dsl-syntax-reference.md)

本文优先描述当前 Java 引擎已经支持、且适合作为公开契约使用的语义建模对象。少数高级属性会依赖具体引擎、加载器或宿主集成，使用时应以目标运行时的能力说明和验证结果为准。

## 1. 语义层对象

Foggy 的语义层由两个主要对象组成：

| 对象 | 文件类型 | 作用 | 面向对象 |
|------|----------|------|----------|
| TM | `.tm` | 描述物理表、字段、维度关系、指标和数据类型 | 引擎与建模者 |
| QM | `.qm` | 基于 TM 定义可查询字段、计算字段、默认排序和权限边界 | LLM、应用和工具协议 |

TM 定义“数据是什么”，QM 定义“哪些数据可以被查询，以及以什么语义暴露”。

```text
Physical Tables
      |
      v
Table Model (TM)
  - tableName / viewSql
  - dimensions
  - properties
  - measures
      |
      v
Query Model (QM)
  - model binding
  - columnGroups
  - calculated fields
  - orders / accesses
      |
      v
Query DSL / MCP Tools / Application API
```

## 2. TM 的职责

TM 是物理数据和语义字段之间的第一层契约。它负责描述：

- 数据来自哪个物理表、视图、集合或扩展数据源。
- 物理列如何映射为语义字段。
- 哪些字段是明细属性，哪些字段是可聚合指标。
- 事实表与维度表之间的关联路径。
- 字段类型、默认聚合方式、字典、公式和语义单位。
- 可选的引擎优化元数据，例如预聚合声明。

TM 面向建模者和查询引擎，不应直接等同于 LLM 可查询字段集合。一个 TM 字段只有被当前 QM 暴露后，才成为 DSL 可以引用的查询字段。

详细属性见 [TM 定义参考](./tm-definition-reference.md)。预聚合属于查询引擎优化能力，独立说明见 [预聚合能力参考](./pre-aggregation-reference.md)。

## 3. QM 的职责

QM 是面向查询调用方的语义契约。它基于一个或多个 TM 定义：

- 当前查询模型暴露哪些字段。
- 字段如何分组、命名、改写显示名称或说明。
- 哪些字段是 QM 级计算字段。
- 默认排序如何声明。
- 行级治理、字段治理和维度成员权限如何收窄。

对 LLM、MCP tools、应用 API 和 JSON Query DSL 来说，QM 是直接可见的查询边界。DSL 字段引用应以当前 QM 暴露字段为准，而不是以数据库列或完整 TM 字段集合为准。

详细属性见 [QM 定义参考](./qm-definition-reference.md)。

## 4. 与 Query DSL 的关系

JSON Query DSL 在运行时引用 QM 暴露的字段，并通过查询引擎生成受治理的执行计划。

| TM/QM 定义 | DSL 引用 |
|------------|----------|
| TM property `order_id -> orderId` 被 QM 暴露 | `"orderId"` |
| TM measure `sales_amount -> salesAmount` 被 QM 暴露 | `"salesAmount"` |
| dimension `customer.captionColumn` 被 QM 暴露 | `"customer$caption"` |
| dimension property `customer_type` 被 QM 暴露 | `"customer$customerType"` |
| QM calculated field `profitRate` | `"profitRate"` |

查询 DSL 的完整语法见 [JSON Query DSL 语法参考](./query-dsl-syntax-reference.md)。

## 5. 建模链路

一个典型的语义建模链路如下：

1. 用 TM 描述物理数据结构、字段类型、维度关系和指标语义。
2. 用 QM 选择并组织对外暴露的查询字段。
3. 由宿主系统注入用户、公司、租户、字段可见性等治理上下文。
4. LLM 或应用提交 JSON Query DSL。
5. 引擎根据 TM/QM 和治理上下文生成最终查询，并返回结构化结果与查询证据。

这条链路的核心目标是让 LLM 面对稳定、受治理的语义字段，而不是直接面对裸数据库 schema 或任意 SQL。
