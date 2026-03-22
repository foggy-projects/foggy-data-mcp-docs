# JSON 查询 DSL 语法

<DownloadButton filename="query-dsl.md" title="下载本文档" />

本文档详细介绍 Foggy Dataset Model 的 JSON 查询 DSL（Domain Specific Language）完整语法。

## 1. 概述

JSON 查询 DSL 是一种声明式的查询语言，通过 JSON 格式描述查询条件、字段选择、分组、排序等操作。系统会将 DSL 解析并转换为 SQL 执行。

### 1.1 请求结构

```json
{
    "page": 1,                          // 页码（从1开始）
    "pageSize": 20,                     // 每页条数
    "param": {
        "columns": [...],               // 查询列
        "slice": [...],                 // 过滤条件
        "groupBy": [...],               // 分组字段
        "orderBy": [...],               // 排序字段
        "calculatedFields": [...],      // 动态计算字段
        "returnTotal": true             // 是否返回汇总
    }
}
```

---

## 2. 字段引用格式

### 2.1 引用类型

| 格式 | 说明 | 示例 |
|------|------|------|
| `属性名` | 事实表属性 | `orderId`, `orderStatus` |
| `度量名` | 度量字段 | `totalAmount`, `quantity` |
| `维度$id` | 维度 ID | `customer$id` |
| `维度$caption` | 维度显示值 | `customer$caption` |
| `维度$属性` | 维度属性 | `customer$customerType` |
| `维度$hierarchy$id` | 父子维度层级视角 | `team$hierarchy$id` |
| `嵌套维度.子维度$属性` | 嵌套维度属性 | `product.category$caption` |

### 2.2 嵌套维度引用

嵌套维度引用使用两种分隔符：**`.` 负责维度层级导航，`$` 负责属性访问**。

```json
{
    "columns": [
        "product$caption",                    // 一级维度
        "product.category$caption",           // 二级维度（.分隔层级）
        "product.category.group$caption"      // 三级维度
    ]
}
```

如果 TM 中定义了 `alias`，也可以使用别名引用：

```json
{
    "columns": [
        "product$caption",                    // 一级维度
        "productCategory$caption",            // 二级维度（通过 alias）
        "categoryGroup$caption"               // 三级维度（通过 alias）
    ]
}
```

> **注意**：不能用多个 `$` 代替 `.`（如 ~~`product$category$caption`~~），`$` 只用于分隔维度和属性。

**输出列名映射**：路径中的 `.` 在响应数据中自动转为 `_`：

| DSL 引用 | 响应中的列名 |
|---------|---------|
| `product$caption` | `product$caption` |
| `product.category$caption` | `product_category$caption` |
| `product.category.group$caption` | `product_category_group$caption` |
| `productCategory$caption`（别名） | `productCategory$caption` |

---

## 3. 过滤条件 (slice)

### 3.1 基本结构

```json
{
    "field": "字段名",
    "op": "操作符",
    "value": "值",
    "maxDepth": 2           // 层级深度限制（仅层级操作符）
}
```

**逻辑组合**：使用 `$or` / `$and` 操作符组合多个条件：

```json
{
    "$or": [条件1, 条件2, ...]    // 条件用 OR 连接
}
{
    "$and": [条件1, 条件2, ...]   // 条件用 AND 连接
}
```

### 3.2 操作符列表

#### 3.2.1 比较操作符

| 操作符 | 说明 | value 类型 | 示例 |
|--------|------|-----------|------|
| `=` | 等于 | any | `{ "op": "=", "value": "A" }` |
| `!=` / `<>` | 不等于 | any | `{ "op": "!=", "value": "B" }` |
| `===` | 强制等于（忽略空值特殊处理） | any | `{ "op": "===", "value": "A" }` |
| `>` | 大于 | number | `{ "op": ">", "value": 100 }` |
| `>=` | 大于等于 | number | `{ "op": ">=", "value": 100 }` |
| `<` | 小于 | number | `{ "op": "<", "value": 1000 }` |
| `<=` | 小于等于 | number | `{ "op": "<=", "value": 1000 }` |

> **`=` vs `===`**：`=` 在值为 null 时会自动转换为 `IS NULL`，而 `===` 始终生成 `field = value`，不做空值特殊处理。

#### 3.2.2 集合操作符

| 操作符 | 说明 | value 类型 | 示例 |
|--------|------|-----------|------|
| `in` | 包含于 | array | `{ "op": "in", "value": ["A", "B", "C"] }` |
| `not in` / `nin` | 不包含于 | array | `{ "op": "not in", "value": ["X", "Y"] }` |
| `bit_in` | 位图包含 | number/array | `{ "op": "bit_in", "value": [1, 2, 4] }` |

#### 3.2.3 模糊匹配操作符

| 操作符 | 说明 | 通配符处理 | 示例 |
|--------|------|-----------|------|
| `like` | 模糊匹配 | 自动加 `%...%` | `{ "op": "like", "value": "关键字" }` |
| `left_like` | 左匹配 | 自动加 `%...` | `{ "op": "left_like", "value": "后缀" }` |
| `right_like` | 右匹配 | 自动加 `...%` | `{ "op": "right_like", "value": "前缀" }` |
| `not like` | 不匹配 | 自动加 `%...%` | `{ "op": "not like", "value": "排除词" }` |
| `not left_like` | 不左匹配 | 自动加 `%...` | `{ "op": "not left_like", "value": "后缀" }` |
| `not right_like` | 不右匹配 | 自动加 `...%` | `{ "op": "not right_like", "value": "前缀" }` |

#### 3.2.4 空值操作符

| 操作符 | 说明 | value | 示例 |
|--------|------|-------|------|
| `is null` / `isNull` | 为空 | 不需要 | `{ "op": "is null" }` |
| `is not null` / `isNotNull` | 不为空 | 不需要 | `{ "op": "is not null" }` |
| `isNullAndEmpty` | 为空或空字符串 | 不需要 | `{ "op": "isNullAndEmpty" }` |
| `isNotNullAndEmpty` | 不为空且非空字符串 | 不需要 | `{ "op": "isNotNullAndEmpty" }` |

> **`isNullAndEmpty`** 生成 `(field IS NULL OR field = '')`，适用于需要同时判断 NULL 和空字符串的场景。

#### 3.2.5 范围操作符

| 操作符 | 说明 | 边界 | 示例 |
|--------|------|------|------|
| `[]` | 闭区间 | 包含两端 | `{ "op": "[]", "value": [100, 500] }` |
| `[)` | 左闭右开 | 包含左，不含右 | `{ "op": "[)", "value": ["2024-01-01", "2024-07-01"] }` |
| `(]` | 左开右闭 | 不含左，包含右 | `{ "op": "(]", "value": [0, 100] }` |
| `()` | 开区间 | 不含两端 | `{ "op": "()", "value": [0, 100] }` |

**范围操作符示例**：

```json
{
    "param": {
        "slice": [
            {
                "field": "orderDate$caption",
                "op": "[)",
                "value": ["2024-01-01", "2024-07-01"]
            }
        ]
    }
}
```

**生成的 SQL**：
```sql
WHERE order_date >= '2024-01-01' AND order_date < '2024-07-01'
```

#### 3.2.6 层级操作符（父子维度专用）

用于父子维度的层级查询，详见 [父子维度文档](./parent-child.md)。

| 操作符 | 说明 | 包含自身 | 示例 |
|--------|------|---------|------|
| `childrenOf` / `children_of` | 直接子节点 | 否 | `{ "op": "childrenOf", "value": "T001" }` |
| `descendantsOf` / `descendants_of` | 所有后代节点 | 否 | `{ "op": "descendantsOf", "value": "T001" }` |
| `selfAndDescendantsOf` / `self_and_descendants_of` | 自身及所有后代 | 是 | `{ "op": "selfAndDescendantsOf", "value": "T001" }` |
| `ancestorsOf` / `ancestors_of` | 所有祖先节点 | 否 | `{ "op": "ancestorsOf", "value": "T001" }` |
| `selfAndAncestorsOf` / `self_and_ancestors_of` | 自身及所有祖先 | 是 | `{ "op": "selfAndAncestorsOf", "value": "T001" }` |

> 向下查询（childrenOf/descendantsOf）通过 `closure.parentKey = value` 匹配，向上查询（ancestorsOf/selfAndAncestorsOf）通过 `closure.childKey = value` 匹配。

**层级深度限制**：

使用 `maxDepth` 参数限制查询的层级深度：

```json
{
    "field": "team$id",
    "op": "descendantsOf",
    "value": "T001",
    "maxDepth": 2          // 只查询2层以内的后代
}
```

**层级操作符示例**：

```json
{
    "param": {
        "columns": ["team$caption", "salesAmount"],
        "slice": [
            {
                "field": "team$id",
                "op": "childrenOf",
                "value": "T001"
            }
        ]
    }
}
```

**生成的 SQL**：
```sql
SELECT dim_team.caption, SUM(fact.sales_amount)
FROM fact_team_sales fact
LEFT JOIN team_closure closure ON fact.team_id = closure.child_id
LEFT JOIN dim_team ON closure.child_id = dim_team.id
WHERE closure.parent_id = 'T001'
  AND closure.distance = 1
GROUP BY dim_team.caption
```

#### 3.2.7 向量操作符（向量模型专用）

用于向量模型的语义相似度检索，**仅向量字段（type=VECTOR）支持**。

| 操作符 | 说明 | 示例 |
|--------|------|------|
| `similar` | 相似度搜索 | `{ "op": "similar", "value": { "text": "..." } }` |
| `hybrid` | 混合搜索（向量+关键词） | `{ "op": "hybrid", "value": { "text": "...", "keyword": "..." } }` |

**similar 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是* | 搜索文本（自动转向量）|
| `vector` | float[] | 是* | 直接传向量（与text二选一）|
| `topK` | int | 否 | 返回条数，默认10 |
| `minScore` | float | 否 | 最低相似度(0-1) |
| `groupBy` | string | 否 | 按字段分组去重 |
| `radius` | float | 否 | 范围搜索最低分数 |

**hybrid 参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `text` | string | 是 | 搜索文本（自动转向量）|
| `keyword` | string | 否 | 关键词过滤 |
| `topK` | int | 否 | 返回条数，默认10 |
| `vectorWeight` | float | 否 | 向量权重，默认0.7 |
| `keywordWeight` | float | 否 | 关键词权重，默认0.3 |

**向量搜索示例**：

```json
{
    "param": {
        "columns": ["docId", "title", "content", "_score"],
        "slice": [
            {
                "field": "embedding",
                "op": "similar",
                "value": {
                    "text": "销售业绩分析",
                    "topK": 10,
                    "minScore": 0.6
                }
            },
            { "field": "category", "op": "=", "value": "report" }
        ]
    }
}
```

**混合搜索示例**：

```json
{
    "param": {
        "columns": ["docId", "title", "_score"],
        "slice": [
            {
                "field": "embedding",
                "op": "hybrid",
                "value": {
                    "text": "销售分析",
                    "keyword": "报告",
                    "topK": 10
                }
            }
        ]
    }
}
```

> 向量搜索结果按相似度降序排列，`_score` 字段表示相似度(0-1)。

### 3.3 逻辑组合 ($or / $and)

slice 数组中的条件默认使用 AND 连接。使用 `$or` 和 `$and` 操作符可以显式控制条件的逻辑组合。

#### 3.3.1 $or 操作符

将多个条件用 OR 连接：

```json
{
    "param": {
        "slice": [
            {
                "$or": [
                    { "field": "orderStatus", "op": "=", "value": "COMPLETED" },
                    { "field": "orderStatus", "op": "=", "value": "SHIPPED" }
                ]
            }
        ]
    }
}
```

**生成的 SQL**：
```sql
WHERE (order_status = 'COMPLETED' OR order_status = 'SHIPPED')
```

#### 3.3.2 $and 操作符

将多个条件用 AND 连接（用于在 $or 内部显式分组）：

```json
{
    "param": {
        "slice": [
            {
                "$or": [
                    { "field": "customer$customerType", "op": "=", "value": "VIP" },
                    {
                        "$and": [
                            { "field": "totalAmount", "op": ">=", "value": 1000 },
                            { "field": "orderCount", "op": ">=", "value": 5 }
                        ]
                    }
                ]
            }
        ]
    }
}
```

**生成的 SQL**：
```sql
WHERE (customer_type = 'VIP' OR (total_amount >= 1000 AND order_count >= 5))
```

#### 3.3.3 混合使用

`$or` 和 `$and` 可以任意嵌套，实现复杂的条件组合：

```json
{
    "param": {
        "slice": [
            { "field": "orderStatus", "op": "=", "value": "COMPLETED" },
            {
                "$or": [
                    { "field": "totalAmount", "op": ">=", "value": 1000 },
                    { "field": "customer$customerType", "op": "=", "value": "VIP" }
                ]
            }
        ]
    }
}
```

**生成的 SQL**：
```sql
WHERE order_status = 'COMPLETED'
  AND (total_amount >= 1000 OR customer_type = 'VIP')
```

### 3.4 等值条件简写

对于等值条件（`op: "="`），支持简写格式：

**简写格式**：当对象只有一个键值对，且键不是保留字时，自动解析为等值条件。

```json
// 简写格式
{ "orderStatus": "COMPLETED" }

// 等价于完整格式
{ "field": "orderStatus", "op": "=", "value": "COMPLETED" }
```

**混合使用示例**：

```json
{
    "slice": [
        { "orderStatus": "COMPLETED" },
        { "customer$customerType": "VIP" },
        { "field": "totalAmount", "op": ">=", "value": 1000 }
    ]
}
```

> **注意**：保留字段名（`field`, `op`, `value`, `$or`, `$and`, `$expr`, `maxDepth`）不能作为简写格式的字段名。

### 3.5 HAVING 条件（聚合过滤）

当查询包含分组（groupBy）时，对聚合字段的过滤会自动识别并放入 HAVING 子句：

```json
{
    "param": {
        "columns": ["customer$customerType", "SUM(totalAmount) AS totalSales"],
        "slice": [
            { "field": "orderStatus", "op": "=", "value": "COMPLETED" },
            { "field": "totalSales", "op": ">=", "value": 10000 }
        ],
        "groupBy": [
            { "field": "customer$customerType" }
        ]
    }
}
```

**生成的 SQL**：
```sql
SELECT customer_type, SUM(total_amount) AS totalSales
FROM fact_order
WHERE order_status = 'COMPLETED'
GROUP BY customer_type
HAVING SUM(total_amount) >= 10000
```

**注意**：`$or` 条件组中不能同时包含聚合字段和普通字段，因为无法在 WHERE 和 HAVING 间使用 OR。

### 3.6 字段间比较 ($field / $expr)

支持直接比较两个字段的值，无需创建计算字段。提供两种语法：

#### 3.6.1 $field 引用

使用 `{"$field": "字段名"}` 作为 value，表示引用另一个字段而非字面值：

```json
{
    "param": {
        "slice": [
            {
                "field": "salesAmount",
                "op": ">",
                "value": { "$field": "costAmount" }
            }
        ]
    }
}
```

**生成的 SQL**：
```sql
WHERE sales_amount > cost_amount
```

**支持所有比较操作符**：

| 操作符 | 示例 |
|--------|------|
| `=` | `{"field": "a", "op": "=", "value": {"$field": "b"}}` |
| `!=` | `{"field": "a", "op": "!=", "value": {"$field": "b"}}` |
| `>` | `{"field": "a", "op": ">", "value": {"$field": "b"}}` |
| `>=` | `{"field": "a", "op": ">=", "value": {"$field": "b"}}` |
| `<` | `{"field": "a", "op": "<", "value": {"$field": "b"}}` |
| `<=` | `{"field": "a", "op": "<=", "value": {"$field": "b"}}` |

#### 3.6.2 $expr 表达式

使用 `$expr` 定义更复杂的字段间比较表达式：

```json
{
    "param": {
        "slice": [
            { "$expr": "salesAmount > costAmount" }
        ]
    }
}
```

**支持算术运算**：

```json
{
    "param": {
        "slice": [
            { "$expr": "salesAmount > costAmount * 1.2" },
            { "$expr": "profitAmount >= discountAmount + 100" }
        ]
    }
}
```

**生成的 SQL**：
```sql
WHERE (sales_amount > (cost_amount * 1.2))
  AND (profit_amount >= (discount_amount + 100))
```

#### 3.6.3 与其他条件组合

`$field` 和 `$expr` 可以与普通条件和逻辑组合一起使用：

```json
{
    "param": {
        "slice": [
            { "orderStatus": "COMPLETED" },
            { "field": "salesAmount", "op": ">", "value": { "$field": "costAmount" } },
            { "field": "quantity", "op": ">=", "value": 10 }
        ]
    }
}
```

**在 $or 条件中使用**：

```json
{
    "param": {
        "slice": [
            {
                "$or": [
                    { "$expr": "salesAmount > costAmount * 1.5" },
                    { "field": "discountAmount", "op": ">", "value": 100 }
                ]
            }
        ]
    }
}
```

**生成的 SQL**：
```sql
WHERE ((sales_amount > (cost_amount * 1.5)) OR discount_amount > 100)
```

#### 3.6.4 使用场景

| 场景 | 推荐语法 | 示例 |
|------|----------|------|
| 简单字段比较 | `$field` | 销售金额大于成本 |
| 带运算的比较 | `$expr` | 利润率超过 20%（`salesAmount > costAmount * 1.2`）|
| 多字段运算 | `$expr` | 净额大于成本（`salesAmount - discountAmount > costAmount`）|

---

## 4. 分组 (groupBy)

### 4.1 基本格式

**完整格式**：

```json
{
    "param": {
        "groupBy": [
            { "field": "customer$customerType" },
            { "field": "orderDate$year" },
            { "field": "orderDate$month" }
        ]
    }
}
```

**简写格式**：对于只需指定字段名的分组，可使用字符串数组：

```json
{
    "param": {
        "groupBy": ["customer$customerType", "orderDate$year", "orderDate$month"]
    }
}
```

**混合使用**：简写格式和完整格式可以混合：

```json
{
    "param": {
        "groupBy": [
            "customer$customerType",
            { "field": "totalAmount", "agg": "AVG" }
        ]
    }
}
```

### 4.2 自定义聚合方式

可以在 groupBy 中覆盖默认的聚合方式：

```json
{
    "param": {
        "groupBy": [
            { "field": "product$category" },
            { "field": "totalAmount", "agg": "AVG" }
        ]
    }
}
```

### 4.3 聚合类型

| 类型 | 说明 |
|------|------|
| `SUM` | 求和 |
| `AVG` | 平均值 |
| `COUNT` | 计数 |
| `COUNTD` / `COUNT_DISTINCT` | 去重计数 |
| `MAX` | 最大值 |
| `MIN` | 最小值 |
| `GROUP_CONCAT` | 字符串连接 |
| `STDDEV_POP` | 总体标准差 |
| `STDDEV_SAMP` | 样本标准差 |
| `VAR_POP` | 总体方差 |
| `VAR_SAMP` | 样本方差 |
| `NONE` | 不聚合（加入 GROUP BY） |

---

## 5. 排序 (orderBy)

### 5.1 基本格式

**完整格式**：

```json
{
    "param": {
        "orderBy": [
            { "field": "totalAmount", "dir": "desc" },
            { "field": "orderId", "dir": "asc" }
        ]
    }
}
```

**简写格式**：支持多种字符串简写：

| 格式 | 说明 | 示例 |
|------|------|------|
| `"fieldName"` | 默认升序 | `"orderId"` → asc |
| `"fieldName asc"` | 升序 | `"orderId asc"` |
| `"fieldName desc"` | 降序 | `"totalAmount desc"` |
| `"-fieldName"` | 降序（负号前缀） | `"-totalAmount"` |

```json
{
    "param": {
        "orderBy": ["-totalAmount", "orderId"]
    }
}
```

**混合使用**：

```json
{
    "param": {
        "orderBy": [
            "-totalAmount",
            { "field": "orderId", "dir": "asc", "nullLast": true }
        ]
    }
}
```

### 5.2 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field` | string | 是 | 排序字段名 |
| `dir` | string | 否 | `asc`（升序）/ `desc`（降序），默认 `asc` |
| `nullFirst` | boolean | 否 | NULL 值排在最前 |
| `nullLast` | boolean | 否 | NULL 值排在最后 |

---

## 6. 动态计算字段 (calculatedFields)

允许在查询时定义计算字段，可在 columns、slice、groupBy、orderBy 中引用。

### 6.1 基本结构

```json
{
    "param": {
        "calculatedFields": [
            {
                "name": "profitRate",
                "caption": "利润率",
                "expression": "profitAmount / salesAmount * 100",
                "agg": "SUM"
            }
        ],
        "columns": ["product$caption", "profitRate"]
    }
}
```

### 6.2 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 计算字段名（用于引用） |
| `caption` | string | 否 | 显示名称 |
| `expression` | string | 是 | 计算表达式 |
| `description` | string | 否 | 字段描述 |
| `agg` | string | 否 | 聚合类型（SUM/AVG/COUNT/COUNTD/MAX/MIN 等） |
| `type` | string | 否 | 返回类型（NUMBER/INTEGER/TEXT） |
| `partitionBy` | string[] | 否 | 窗口函数分区字段列表 |
| `windowOrderBy` | object[] | 否 | 窗口函数排序，格式：`[{"field": "xxx", "dir": "desc"}]` |
| `windowFrame` | string | 否 | 窗口帧定义，如 `"ROWS BETWEEN 6 PRECEDING AND CURRENT ROW"` |

### 6.3 支持的表达式

#### 算术运算
- `+`, `-`, `*`, `/`, `%`

#### 数学函数
- `ABS(x)` - 绝对值
- `ROUND(x, n)` - 四舍五入
- `CEIL(x)` / `CEILING(x)` - 向上取整
- `FLOOR(x)` - 向下取整
- `MOD(x, y)` - 取模
- `POWER(x, y)` / `POW(x, y)` - 幂运算
- `SQRT(x)` - 平方根
- `SIGN(x)` - 符号函数（正数返回1，负数返回-1，零返回0）
- `TRUNCATE(x, n)` / `TRUNC(x, n)` - 截断到指定小数位

#### 日期函数
- `YEAR(date)` - 提取年份
- `MONTH(date)` - 提取月份
- `DAY(date)` - 提取日期
- `HOUR(datetime)` - 提取小时
- `MINUTE(datetime)` - 提取分钟
- `SECOND(datetime)` - 提取秒
- `DATE(datetime)` - 提取日期部分
- `TIME(datetime)` - 提取时间部分
- `NOW()` - 当前时间
- `CURRENT_DATE()` - 当前日期
- `CURRENT_TIME()` - 当前时间
- `CURRENT_TIMESTAMP()` - 当前时间戳
- `DATE_ADD(date, interval)` - 日期加法
- `DATE_SUB(date, interval)` - 日期减法
- `DATEDIFF(date1, date2)` - 日期差
- `TIMESTAMPDIFF(unit, date1, date2)` - 时间戳差值
- `DATE_FORMAT(date, format)` - 日期格式化
- `STR_TO_DATE(str, format)` - 字符串转日期
- `EXTRACT(unit FROM date)` - 提取日期部分

#### 字符串函数
- `CONCAT(s1, s2, ...)` - 字符串连接
- `CONCAT_WS(sep, s1, s2, ...)` - 带分隔符的字符串连接
- `SUBSTRING(s, start, len)` / `SUBSTR(s, start, len)` - 截取子串
- `LEFT(s, n)` - 左截取 n 个字符
- `RIGHT(s, n)` - 右截取 n 个字符
- `UPPER(s)` - 转大写
- `LOWER(s)` - 转小写
- `TRIM(s)` - 去除两端空白
- `LTRIM(s)` - 去除左侧空白
- `RTRIM(s)` - 去除右侧空白
- `LENGTH(s)` - 字节长度
- `CHAR_LENGTH(s)` - 字符长度
- `REPLACE(s, from, to)` - 字符串替换
- `INSTR(s, substr)` - 查找子串位置
- `LOCATE(substr, s)` - 查找子串位置
- `LPAD(s, len, pad)` - 左侧填充
- `RPAD(s, len, pad)` - 右侧填充

#### 条件与类型函数
- `COALESCE(v1, v2, ...)` - 返回第一个非空值
- `NULLIF(v1, v2)` - 如果相等返回 NULL
- `IFNULL(v, default)` / `NVL(v, default)` / `ISNULL(v)` - 空值处理
- `IF(condition, trueVal, falseVal)` - 条件判断
- `CASE WHEN ... THEN ... ELSE ... END` - 条件分支
- `CAST(v AS type)` / `CONVERT(v, type)` - 类型转换

#### 窗口函数

窗口函数在计算字段中使用，需配合 `partitionBy`、`windowOrderBy`、`windowFrame` 参数：

| 函数 | 说明 |
|------|------|
| `ROW_NUMBER()` | 行号（每行唯一） |
| `RANK()` | 排名（并列跳号） |
| `DENSE_RANK()` | 排名（并列不跳号） |
| `NTILE(n)` | 将数据分为 n 个桶 |
| `LAG(field, offset)` | 前向偏移取值 |
| `LEAD(field, offset)` | 后向偏移取值 |
| `FIRST_VALUE(field)` | 窗口内第一个值 |
| `LAST_VALUE(field)` | 窗口内最后一个值 |

**窗口函数示例**：

```json
{
    "param": {
        "calculatedFields": [
            {
                "name": "salesRank",
                "caption": "销售排名",
                "expression": "RANK()",
                "partitionBy": ["region$caption"],
                "windowOrderBy": [{"field": "salesAmount", "dir": "desc"}]
            },
            {
                "name": "movingAvg",
                "caption": "7日移动平均",
                "expression": "AVG(salesAmount)",
                "partitionBy": ["product$id"],
                "windowOrderBy": [{"field": "salesDate$caption", "dir": "asc"}],
                "windowFrame": "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW"
            },
            {
                "name": "prevDaySales",
                "caption": "前日销售额",
                "expression": "LAG(salesAmount, 1)",
                "partitionBy": ["product$id"],
                "windowOrderBy": [{"field": "salesDate$caption", "dir": "asc"}]
            }
        ],
        "columns": ["salesDate$caption", "product$caption", "salesAmount", "salesRank", "movingAvg", "prevDaySales"]
    }
}
```

> **注意**：窗口函数不会触发 GROUP BY，它在每行数据上独立计算。

### 6.4 计算字段示例

```json
{
    "param": {
        "calculatedFields": [
            {
                "name": "avgOrderAmount",
                "caption": "平均订单金额",
                "expression": "totalAmount / orderCount"
            },
            {
                "name": "salesGrowth",
                "caption": "销售增长率",
                "expression": "(currentSales - lastYearSales) / lastYearSales * 100"
            },
            {
                "name": "orderYear",
                "caption": "订单年份",
                "expression": "YEAR(orderDate)"
            }
        ],
        "columns": ["customer$caption", "avgOrderAmount", "salesGrowth"],
        "slice": [
            { "field": "salesGrowth", "op": ">", "value": 10 }
        ]
    }
}
```

---

## 7. 内联表达式

除了使用 `calculatedFields` 定义计算字段，还可以直接在 `columns` 中使用内联表达式。

### 7.1 语法格式

```
表达式 AS 别名
```

### 7.2 示例

```json
{
    "param": {
        "columns": [
            "customer$caption",
            "YEAR(orderDate) AS orderYear",
            "SUM(totalAmount) AS totalSales",
            "totalAmount / quantity AS unitPrice"
        ],
        "groupBy": [
            { "field": "customer$caption" },
            { "field": "orderYear" }
        ]
    }
}
```

系统会自动将内联表达式转换为 `calculatedFields`，并识别聚合类型。

---

## 8. 分页参数

### 8.1 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `page` | integer | 否 | 1 | 页码，从 1 开始 |
| `pageSize` | integer | 否 | 10 | 每页条数 |
| `start` | integer | 否 | 0 | 起始记录数（与 page 二选一） |
| `limit` | integer | 否 | 10 | 返回条数（与 pageSize 二选一） |

### 8.2 示例

**使用 page/pageSize**：
```json
{
    "page": 2,
    "pageSize": 20,
    "param": { ... }
}
```

**使用 start/limit**：
```json
{
    "start": 20,
    "limit": 20,
    "param": { ... }
}
```

---

## 9. 响应结构

### 9.1 响应体

```json
{
    "code": 0,
    "data": {
        "items": [
            {
                "orderId": "ORD001",
                "customer$caption": "客户A",
                "totalAmount": 1299.00
            }
        ],
        "total": 100,
        "totalData": {
            "total": 100,
            "totalAmount": 129900.00
        }
    },
    "msg": "success"
}
```

### 9.2 响应字段

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | integer | 状态码，0 表示成功 |
| `data.items` | array | 明细数据列表（分页后的数据） |
| `data.total` | integer | 符合条件的总记录数 |
| `data.totalData` | object | 汇总数据（仅当 `returnTotal=true`） |
| `msg` | string | 消息 |

### 9.3 totalData 说明

- 包含 `columns` 中指定的度量字段的聚合值
- 是对**所有符合条件的数据**进行聚合，不受分页影响
- 只有设置 `returnTotal=true` 时才返回

---

## 10. 完整示例

### 10.1 明细查询

```json
POST /jdbc-model/query-model/v2/FactOrderQueryModel

{
    "page": 1,
    "pageSize": 20,
    "param": {
        "columns": [
            "orderId",
            "orderStatus",
            "orderTime",
            "customer$caption",
            "customer$customerType",
            "product$caption",
            "totalAmount"
        ],
        "slice": [
            { "field": "orderStatus", "op": "in", "value": ["COMPLETED", "SHIPPED"] },
            { "field": "orderTime", "op": "[)", "value": ["2024-01-01", "2024-07-01"] },
            { "field": "totalAmount", "op": ">=", "value": 100 }
        ],
        "orderBy": [
            { "field": "orderTime", "dir": "desc" }
        ],
        "returnTotal": true
    }
}
```

### 10.2 分组汇总查询

```json
POST /jdbc-model/query-model/v2/FactOrderQueryModel

{
    "page": 1,
    "pageSize": 100,
    "param": {
        "columns": [
            "orderDate$year",
            "orderDate$month",
            "customer$customerType",
            "totalQuantity",
            "totalAmount"
        ],
        "slice": [
            { "field": "orderDate$caption", "op": "[)", "value": ["2024-01-01", "2024-07-01"] }
        ],
        "groupBy": [
            { "field": "orderDate$year" },
            { "field": "orderDate$month" },
            { "field": "customer$customerType" }
        ],
        "orderBy": [
            { "field": "orderDate$year", "dir": "desc" },
            { "field": "orderDate$month", "dir": "asc" }
        ]
    }
}
```

### 10.3 带计算字段的分析查询

```json
POST /jdbc-model/query-model/v2/FactSalesQueryModel

{
    "page": 1,
    "pageSize": 50,
    "param": {
        "calculatedFields": [
            {
                "name": "profitRate",
                "caption": "利润率(%)",
                "expression": "profitAmount / salesAmount * 100"
            },
            {
                "name": "avgPrice",
                "caption": "平均单价",
                "expression": "salesAmount / salesQuantity"
            }
        ],
        "columns": [
            "product$category",
            "salesQuantity",
            "salesAmount",
            "profitAmount",
            "profitRate",
            "avgPrice"
        ],
        "slice": [
            { "field": "salesDate$caption", "op": "[)", "value": ["2024-01-01", "2024-07-01"] },
            { "field": "profitRate", "op": ">=", "value": 20 }
        ],
        "groupBy": [
            { "field": "product$category" }
        ],
        "orderBy": [
            { "field": "profitRate", "dir": "desc" }
        ]
    }
}
```

### 10.4 父子维度层级查询

```json
POST /jdbc-model/query-model/v2/FactTeamSalesQueryModel

{
    "page": 1,
    "pageSize": 100,
    "param": {
        "columns": [
            "team$caption",
            "salesAmount"
        ],
        "slice": [
            {
                "field": "team$id",
                "op": "selfAndDescendantsOf",
                "value": "T001"
            }
        ],
        "groupBy": [
            { "field": "team$caption" }
        ],
        "orderBy": [
            { "field": "salesAmount", "dir": "desc" }
        ]
    }
}
```

### 10.5 复杂嵌套条件查询

```json
POST /jdbc-model/query-model/v2/FactOrderQueryModel

{
    "page": 1,
    "pageSize": 20,
    "param": {
        "columns": [
            "orderId",
            "orderStatus",
            "customer$caption",
            "product$category",
            "totalAmount"
        ],
        "slice": [
            { "field": "orderTime", "op": "[)", "value": ["2024-01-01", "2024-07-01"] },
            {
                "$or": [
                    { "field": "customer$customerType", "op": "=", "value": "VIP" },
                    { "field": "totalAmount", "op": ">=", "value": 1000 }
                ]
            },
            { "field": "product$category", "op": "in", "value": ["数码电器", "家居用品"] }
        ],
        "orderBy": [
            { "field": "totalAmount", "dir": "desc" }
        ]
    }
}
```

**生成的 SQL 条件**：
```sql
WHERE order_time >= '2024-01-01' AND order_time < '2024-07-01'
  AND (customer_type = 'VIP' OR total_amount >= 1000)
  AND category IN ('数码电器', '家居用品')
ORDER BY total_amount DESC
```

### 10.6 HAVING 条件示例

```json
POST /jdbc-model/query-model/v2/FactOrderQueryModel

{
    "page": 1,
    "pageSize": 50,
    "param": {
        "calculatedFields": [
            {
                "name": "orderCount",
                "expression": "COUNT(*)",
                "agg": "COUNT"
            },
            {
                "name": "totalSales",
                "expression": "SUM(totalAmount)",
                "agg": "SUM"
            }
        ],
        "columns": [
            "customer$customerType",
            "orderCount",
            "totalSales"
        ],
        "slice": [
            { "field": "orderStatus", "op": "=", "value": "COMPLETED" },
            { "field": "totalSales", "op": ">=", "value": 50000 },
            { "field": "orderCount", "op": ">=", "value": 10 }
        ],
        "groupBy": [
            { "field": "customer$customerType" }
        ],
        "orderBy": [
            { "field": "totalSales", "dir": "desc" }
        ]
    }
}
```

**生成的 SQL**：
```sql
SELECT customer_type, COUNT(*) AS orderCount, SUM(total_amount) AS totalSales
FROM fact_order
WHERE order_status = 'COMPLETED'
GROUP BY customer_type
HAVING SUM(total_amount) >= 50000 AND COUNT(*) >= 10
ORDER BY totalSales DESC
```

---

## 11. 错误处理

### 11.1 错误码

| 错误码 | 说明 |
|--------|------|
| `0` | 成功 |
| `400` | 请求参数错误 |
| `403` | 无权限访问 |
| `404` | 查询模型不存在 |
| `500` | 服务器内部错误 |

### 11.2 常见错误

#### 字段不存在
```json
{
    "code": 400,
    "msg": "未在查询模型FactOrderQueryModel中找到列: invalidField",
    "data": null
}
```

#### $or 条件混合聚合字段
```json
{
    "code": 400,
    "msg": "$or 条件组中不能同时包含聚合字段(totalSales)和普通字段(orderStatus)",
    "data": null
}
```

---

## 12. 最佳实践

### 12.1 性能优化

- 只查询需要的字段，避免 `columns: ["*"]`
- 合理使用索引字段作为过滤条件
- 对于大数据量的分组汇总，考虑预聚合
- 单次查询建议不超过 1000 条

### 12.2 条件优化

- 优先使用等值条件（`=`、`in`）
- 范围条件尽量使用左闭右开 `[)` 格式
- 对于日期字段，推荐使用 `$caption` 进行过滤

### 12.3 安全性

- 字段访问受 QM 中 accesses 配置控制
- 敏感字段可通过 accesses 限制访问
- 所有条件参数都经过参数化处理，防止 SQL 注入

---

## 下一步

- [TM 语法手册](./tm-syntax.md) - 表格模型定义
- [QM 语法手册](./qm-syntax.md) - 查询模型定义
- [父子维度](./parent-child.md) - 层级结构维度
- [计算字段](./calculated-fields.md) - 计算字段详解
- [DSL 查询 API](../api/query-api.md) - HTTP API 接口
