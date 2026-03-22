# Python 实现差异清单

> 本文档列出 **foggy-data-mcp-bridge-python** 相对于 Java 版本（foggy-data-mcp-bridge）的功能差异。
> 生成日期：2026-03-22 | 最后更新：2026-03-22

---

## 当前状态总览

| 类别 | 状态 | 说明 |
|------|------|------|
| 操作符（NOT LIKE、isNullAndEmpty 等） | ✅ 已实现 | Python 团队已完成 |
| 函数白名单 | ✅ 已实现 | Python 团队已完成 |
| $field 字段引用 | ✅ 已实现 | Python 团队已完成 |
| **向量搜索（similar/hybrid）** | **❌ 未实现** | 暂不支持，见下文 |

---

## 1. 已实现的功能（2026-03-22 确认）

以下差异项已由 Python 团队实现，与 Java 版本对齐：

### 1.1 操作符

| 操作符 | 状态 |
|--------|------|
| `not like` / `not left_like` / `not right_like` | ✅ 已实现 |
| `isNullAndEmpty` / `isNotNullAndEmpty` | ✅ 已实现 |
| `===` (force_eq) | ✅ 已实现 |
| `bit_in` | ✅ 已实现 |

### 1.2 函数与表达式

| 功能 | 状态 |
|------|------|
| 函数白名单机制 | ✅ 已实现 |
| 窗口函数 SQL 生成 | ✅ 已实现 |
| 统计聚合函数（COUNTD, STDDEV, VAR） | ✅ 已实现 |
| 字符串/日期/条件函数 | ✅ 已实现 |
| $field 字段引用 | ✅ 已实现 |

---

## 2. 未实现：向量搜索

Java 有完整的向量模型查询引擎，Python 版本 **暂不支持**。

| 功能 | Java 实现 | Python 状态 |
|------|-----------|-------------|
| `similar` 操作符（语义相似度搜索） | `VectorModelQueryEngine.java` | **❌ 暂不支持** |
| `hybrid` 操作符（混合搜索：向量+关键词） | 同上 | **❌ 暂不支持** |
| VECTOR 列类型支持 | `DbColumnType.VECTOR` | **❌ 暂不支持** |
| Milvus 集成 | `MilvusDataSource` | **❌ 暂不支持** |

> 向量搜索为按需功能，视 Python 版本是否需要对接 Milvus 等向量数据库再决定是否实现。

### 参考 Java 代码

```
foggy-dataset-model/src/main/java/com/foggyframework/dataset/db/model/engine/
└── VectorModelQueryEngine.java

foggy-dataset/src/main/java/com/foggyframework/dataset/db/common/
└── DbColumnType.java  (VECTOR 类型定义)
```

---

## 3. 已确认 Python 完整支持的功能

| 功能 | Python 位置 |
|------|------------|
| ✅ 基础操作符（含 NOT LIKE、isNullAndEmpty 等） | `engine/formula/__init__.py` |
| ✅ 层级操作符（7个，含 ancestorsOf 系列） | `engine/hierarchy/__init__.py` |
| ✅ 窗口函数（参数定义 + SQL 生成） | `definitions/query_request.py` |
| ✅ 预聚合匹配与拦截 | `engine/preagg/` |
| ✅ 访问控制（行级、列级、角色级） | `definitions/access.py` |
| ✅ $expr / $field 表达式 | — |
| ✅ $or / $and 逻辑组合 | — |
| ✅ 多方言 SQL 生成（MySQL, PostgreSQL, SQLite, SQLServer） | — |
| ✅ 函数白名单（安全性） | — |
