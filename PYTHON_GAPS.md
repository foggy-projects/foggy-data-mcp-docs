# Python 实现差异清单

> 本文档列出 **foggy-data-mcp-bridge-python** 相对于 Java 版本（foggy-data-mcp-bridge）的功能差异。
> 生成日期：2026-03-22

---

## 1. 缺失的操作符

### 1.1 NOT LIKE 系列（高优先级）

Java 支持 3 种 NOT LIKE 变体，Python **完全缺失**。

| 操作符 | 功能 | Java 实现 | Python 状态 |
|--------|------|-----------|-------------|
| `not like` | 不匹配（自动 %...%） | `NotLikeExpressionFormula.java` | **❌ 缺失** |
| `not left_like` | 不左匹配（自动 %...） | 同上 | **❌ 缺失** |
| `not right_like` | 不右匹配（自动 ...%） | 同上 | **❌ 缺失** |

**建议实现位置**：`src/foggy/dataset_model/engine/formula/__init__.py` → `get_default_registry()`

**参考 Java 代码**：`foggy-dataset-model/.../engine/formula/NotLikeExpressionFormula.java`

---

### 1.2 空值组合判断

| 操作符 | SQL 效果 | Java 实现 | Python 状态 |
|--------|---------|-----------|-------------|
| `isNullAndEmpty` | `(field IS NULL OR field = '')` | `IsNullAndEmptySqlFormula.java` | **❌ 缺失** |
| `isNotNullAndEmpty` | `(field IS NOT NULL AND field <> '')` | `IsNotNullAndEmptySqlFormula.java` | **❌ 缺失** |

---

### 1.3 强制等于

| 操作符 | 功能 | Java 实现 | Python 状态 |
|--------|------|-----------|-------------|
| `===` (force_eq) | 忽略空值特殊处理的等值比较 | `ForceEqSqlFormula.java` | **❌ 缺失** |

---

### 1.4 位操作符

| 操作符 | 功能 | Java 实现 | Python 状态 |
|--------|------|-----------|-------------|
| `bit_in` | 位图包含检测 | `BitInExpressionFormula.java` | **❌ 缺失** |

---

## 2. 缺失的向量搜索支持（高优先级）

Java 有完整的向量模型查询引擎，Python 完全缺失。

| 功能 | Java 实现 | Python 状态 |
|------|-----------|-------------|
| `similar` 操作符（语义相似度搜索） | `VectorModelQueryEngine.java` | **❌ 缺失** |
| `hybrid` 操作符（混合搜索：向量+关键词） | 同上 | **❌ 缺失** |
| VECTOR 列类型支持 | `DbColumnType.VECTOR` | **❌ 缺失** |
| Milvus 集成 | `MilvusDataSource` | **❌ 缺失** |

---

## 3. 函数白名单

Java 通过 `AllowedFunctions.java` 定义了严格的函数白名单（54个函数），Python 未发现显式的函数白名单机制。

**建议**：实现函数白名单以防止 SQL 注入。

### 3.1 Java 中已实现但 Python 需确认的函数

#### 窗口函数（8个）
- `ROW_NUMBER()`, `RANK()`, `DENSE_RANK()`, `NTILE()`
- `LAG()`, `LEAD()`, `FIRST_VALUE()`, `LAST_VALUE()`

> Python 已支持窗口函数的 partition_by / window_order_by / window_frame 参数定义，但需确认 SQL 生成是否完整。

#### 统计聚合函数（5个）
- `COUNTD` / `COUNT_DISTINCT` — 去重计数
- `STDDEV_POP` — 总体标准差
- `STDDEV_SAMP` — 样本标准差
- `VAR_POP` — 总体方差
- `VAR_SAMP` — 样本方差

#### 字符串函数（需确认是否支持）
- `CONCAT_WS`, `SUBSTR`, `LEFT`, `RIGHT`, `LTRIM`, `RTRIM`
- `CHAR_LENGTH`, `REPLACE`, `INSTR`, `LOCATE`, `LPAD`, `RPAD`

#### 日期函数（需确认是否支持）
- `HOUR`, `MINUTE`, `SECOND`, `TIME`, `CURRENT_TIME`, `CURRENT_TIMESTAMP`
- `TIMESTAMPDIFF`, `DATE_FORMAT`, `STR_TO_DATE`, `EXTRACT`

#### 条件与类型函数（需确认是否支持）
- `NVL`, `ISNULL`, `IF`, `CASE`, `CAST`, `CONVERT`

---

## 4. $field 字段引用（需确认）

Java 通过 `CondRequestDef._isFieldReference()` 支持字段间比较：

```json
{
    "field": "salesAmount",
    "op": ">",
    "value": { "$field": "costAmount" }
}
```

**Python 状态**：通过 `product$caption` 语法支持维度属性引用，但 `$field` 作为 value 的字段间比较需确认是否完整支持。

**参考 Java 代码**：`CondRequestDef.java` → `_isFieldReference()` / `_getReferencedField()`

---

## 5. 已确认 Python 已支持的功能

以下功能 Python 已实现，无需额外工作：

| 功能 | Python 位置 |
|------|------------|
| ✅ 基础操作符（15个） | `engine/formula/__init__.py` |
| ✅ 层级操作符（7个，含 ancestorsOf 系列） | `engine/hierarchy/__init__.py` |
| ✅ 窗口函数参数（partition_by, window_order_by, window_frame） | `definitions/query_request.py` |
| ✅ 预聚合匹配与拦截 | `engine/preagg/` |
| ✅ 访问控制（行级、列级、角色级） | `definitions/access.py` |
| ✅ $expr 表达式（直通传递） | `test_java_alignment.py` |
| ✅ $or / $and 逻辑组合 | — |
| ✅ 多方言 SQL 生成（MySQL, PostgreSQL, SQLite, SQLServer） | — |

---

## 6. 实施优先级建议

### P0 — 必须实现
1. **NOT LIKE 系列**（not like, not left_like, not right_like）— 基础查询能力缺失
2. **isNullAndEmpty / isNotNullAndEmpty** — 常用空值判断

### P1 — 建议实现
3. **bit_in** — 位图包含检测
4. **force_eq (===)** — 强制等值比较
5. **函数白名单机制** — 安全性要求

### P2 — 按需实现
6. **向量搜索**（similar/hybrid）— 取决于是否需要 Python 版支持 Milvus
7. **$field 字段引用完整性验证**
8. **补充缺失的函数支持**（字符串、日期、条件函数）

---

## 7. 关键代码文件参考

### Python 操作符注册
```
src/foggy/dataset_model/engine/formula/__init__.py  (Line 308-357)
```

### Java 参考实现
```
foggy-dataset-model/src/main/java/com/foggyframework/dataset/db/model/engine/formula/
├── NotLikeExpressionFormula.java
├── IsNullAndEmptySqlFormula.java
├── IsNotNullAndEmptySqlFormula.java
├── ForceEqSqlFormula.java
├── BitInExpressionFormula.java
└── hierarchy/
    ├── AncestorsOfOperator.java
    └── SelfAndAncestorsOfOperator.java

foggy-dataset-model/src/main/java/com/foggyframework/dataset/db/model/engine/expression/
└── AllowedFunctions.java
```
