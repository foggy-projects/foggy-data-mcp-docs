# JSON Query DSL 语法参考

本文只说明 Foggy JSON Query DSL 的语法对象和分析能力。它不讨论传输层、调用入口、分页外壳或结果包络。

DSL 在一个已选定的 QM 上执行。字段引用来自当前 QM 暴露的语义字段，而不是物理表列名。TM 字段来源见 [TM 定义参考](./tm-definition-reference.md)，QM 字段暴露规则见 [QM 定义参考](./qm-definition-reference.md)。

## 1. 核心 DSL 对象

核心 DSL 对象直接描述一次语义查询要做什么：选择哪些字段、如何过滤、如何聚合、如何排序，以及是否启用计算字段、时间窗口、透视分析或聚合后计算。

```json
{
  "columns": ["customer$caption", "salesAmount"],
  "slice": [
    { "field": "orderStatus", "op": "=", "value": "COMPLETED" }
  ],
  "groupBy": ["customer$caption"],
  "having": [
    { "field": "salesAmount", "op": ">=", "value": 10000 }
  ],
  "orderBy": ["-salesAmount"],
  "returnTotal": true
}
```

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `columns` | string[] | 否 | 未指定时由当前 QM 可见字段集合决定 | 返回字段、指标、计算字段或内联表达式 |
| `slice` | array | 否 | 无 | 行级过滤条件 |
| `having` | array | 否 | 无 | 聚合后过滤条件，只用于聚合字段或聚合别名 |
| `groupBy` | array | 否 | 无 | 分组字段 |
| `orderBy` | array | 否 | 无 | 排序字段 |
| `calculatedFields` | array | 否 | 无 | 查询时计算字段 |
| `postAggregateCalculations` | array | 否 | 无 | 聚合结果外层计算字段 |
| `timeWindow` | object | 否 | 无 | 时间窗口分析定义 |
| `pivot` | object | 否 | 无 | 多维透视分析定义；与 `columns`、`timeWindow` 互斥 |
| `returnTotal` | boolean | 否 | `false` | 声明需要总数或汇总数据 |
| `distinct` | boolean | 否 | `false` | 明细结果去重；不应与 `groupBy` 混用 |
| `withSubtotals` | boolean | 否 | `false` | 对分组聚合结果追加小计或总计行 |

## 2. 字段引用语法

DSL 字段引用的是当前 QM 暴露的语义字段名，而不是 TM 中所有字段的直通引用。字段可以来源于 TM property、TM measure、维度定义或 QM 扩展字段，但只有进入当前 QM 的可见字段集合，并通过权限治理后，才允许在 DSL 中使用。

| 格式 | 说明 | 示例 |
|------|------|------|
| `字段名` | 当前 QM 暴露的普通字段，来源可以是 TM property 或 QM 字段配置 | `orderId` |
| `指标名` | 当前 QM 暴露的指标字段，来源可以是 TM measure 或 QM 指标配置 | `salesAmount` |
| `维度$id` | 当前 QM 暴露的维度主键 | `customer$id` |
| `维度$caption` | 当前 QM 暴露的维度显示值 | `customer$caption` |
| `维度$属性` | 当前 QM 暴露的维度属性 | `customer$customerType` |
| `维度$hierarchy$id` | 当前 QM 暴露的父子维度层级视角 | `team$hierarchy$id` |
| `嵌套维度字段名$属性` | 当前 QM 暴露的嵌套维度属性，通常使用下划线路径或显式 alias | `product_category$caption`、`productCategory$caption` |
| `计算字段名` | 当前 QM 暴露的计算字段，或本次 DSL 中定义的查询时计算字段 | `profitRate` |

嵌套维度在 TM/QM 建模阶段可以使用 `.` 表示路径，例如 `product.category`。进入 DSL 查询请求后，应以当前 QM 暴露的最终字段名为准。Java 引擎当前常见的查询字段形式是下划线路径或显式 alias：

| DSL 引用 | 输出列名 |
|----------|----------|
| `product$caption` | `product$caption` |
| `product_category$caption` | `product_category$caption` |
| `product_category_group$caption` | `product_category_group$caption` |
| `productCategory$caption` | `productCategory$caption` |
| `categoryGroup$caption` | `categoryGroup$caption` |

## 3. columns

`columns` 决定返回字段集合。

```json
{
  "columns": [
    "orderId",
    "customer$caption",
    "salesAmount"
  ]
}
```

字段必须存在于当前 QM 可见字段集合中。未暴露或无权限字段会被拒绝。

`columns` 也可以引用计算字段或内联表达式：

```json
{
  "columns": [
    "customer$caption",
    "YEAR(orderDate) AS orderYear",
    "SUM(salesAmount) AS totalSales"
  ],
  "groupBy": ["customer$caption", "orderYear"]
}
```

复杂计算更适合放入 `calculatedFields` 或 QM 预定义计算字段，便于复核和复用。

## 4. slice

`slice` 是行级过滤条件数组。数组内多个条件默认按 AND 组合。

```json
{
  "field": "salesAmount",
  "op": ">=",
  "value": 1000
}
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field` | string | 是 | 字段引用 |
| `op` | string | 是 | 操作符 |
| `value` | any | 视操作符而定 | 字面值、数组、字段引用或对象 |
| `maxDepth` | integer | 否 | 父子维度层级操作符的深度限制 |

### 4.1 比较操作符

| 操作符 | 说明 | value 类型 |
|--------|------|------------|
| `=` | 等于；值为 `null` 时可转换为空值判断 | any |
| `===` | 强制等于，不做空值特殊处理 | any |
| `!=` / `<>` | 不等于 | any |
| `>` | 大于 | number/date |
| `>=` | 大于等于 | number/date |
| `<` | 小于 | number/date |
| `<=` | 小于等于 | number/date |

```json
{ "field": "salesAmount", "op": ">", "value": 1000 }
```

### 4.2 集合操作符

| 操作符 | 说明 | value 类型 |
|--------|------|------------|
| `in` | 包含于集合 | array |
| `not in` / `nin` | 不包含于集合 | array |
| `bit_in` | 位图包含 | number/array |

```json
{ "field": "orderStatus", "op": "in", "value": ["PAID", "DONE"] }
```

### 4.3 模糊匹配操作符

| 操作符 | 说明 | 通配符处理 |
|--------|------|------------|
| `like` | 模糊匹配 | `%value%` |
| `left_like` | 左匹配 | `%value` |
| `right_like` | 右匹配 | `value%` |
| `not like` | 不匹配 | `NOT LIKE %value%` |
| `not left_like` | 不左匹配 | `NOT LIKE %value` |
| `not right_like` | 不右匹配 | `NOT LIKE value%` |

```json
{ "field": "customer$caption", "op": "like", "value": "上海" }
```

### 4.4 空值操作符

| 操作符 | 说明 | value |
|--------|------|-------|
| `isNull` | 为空 | 不需要 |
| `isNotNull` | 不为空 | 不需要 |
| `isNullAndEmpty` | 为空或空字符串 | 不需要 |
| `isNotNullAndEmpty` | 不为空且非空字符串 | 不需要 |

```json
{ "field": "cancelReason", "op": "isNotNull" }
```

当前公开 DSL 文档只暴露 camelCase 空值操作符。部分历史别名可以作为运行时兼容能力保留，但不建议在公开资料、MCP 工具提示或 Skill/playbook 中主动使用。调用方应以本节列出的操作符为准。

操作符命名仍保留历史兼容边界。后续如统一公开命名规范，需要评估以下内容：

- 为每类操作符指定推荐写法，减少历史别名、snake_case 和 camelCase 混用。
- 为已有别名保留兼容期，避免破坏现有查询请求。
- 对空值、模糊匹配、层级操作符分别定义 canonical name 与 alias 策略。
- 如果调整 `like` / `not like` 的通配符责任，需要同时评估调用方是否自行拼接 `%`，以及对现有工具提示和模型生成稳定性的影响。

### 4.5 范围操作符

| 操作符 | 说明 | 边界 |
|--------|------|------|
| `[]` | 闭区间 | 包含左右边界 |
| `[)` | 左闭右开 | 包含左边界，不包含右边界 |
| `(]` | 左开右闭 | 不包含左边界，包含右边界 |
| `()` | 开区间 | 不包含左右边界 |

```json
{
  "field": "orderDate$caption",
  "op": "[)",
  "value": ["2026-01-01", "2026-02-01"]
}
```

日期范围通常建议使用左闭右开 `[)`，减少月底、时分秒和时区边界带来的歧义。

### 4.6 层级操作符

层级操作符用于父子维度。

| 操作符 | 说明 | 是否包含自身 |
|--------|------|--------------|
| `childrenOf` / `children_of` | 直接子节点 | 否 |
| `descendantsOf` / `descendants_of` | 所有后代节点 | 否 |
| `selfAndDescendantsOf` / `self_and_descendants_of` | 自身及所有后代 | 是 |
| `ancestorsOf` / `ancestors_of` | 所有祖先节点 | 否 |
| `selfAndAncestorsOf` / `self_and_ancestors_of` | 自身及所有祖先 | 是 |

```json
{
  "field": "team$id",
  "op": "selfAndDescendantsOf",
  "value": "TEAM001",
  "maxDepth": 3
}
```

`maxDepth` 只在父子维度的层级操作符下生效，包括 `childrenOf`、`descendantsOf`、`selfAndDescendantsOf`、`ancestorsOf` 和 `selfAndAncestorsOf`。普通比较、集合、模糊匹配等操作符不会使用该参数。`维度$hierarchy$id = value` 这种层级视角精确匹配也不读取 `maxDepth`；如果需要限制层级深度，应改用对应的层级操作符并显式传入 `maxDepth`。

深度按父子维度闭包表的 `distance` 计算。对不包含自身的操作符，`maxDepth: 3` 表示 `distance BETWEEN 1 AND 3`；对包含自身的操作符，表示 `distance <= 3`。`childrenOf` 默认只查询直接子节点，传入大于 `1` 的 `maxDepth` 时会扩展为指定深度内的后代范围。

## 5. 逻辑组合

### 5.1 $or

```json
{
  "$or": [
    { "field": "orderStatus", "op": "=", "value": "PAID" },
    { "field": "orderStatus", "op": "=", "value": "DONE" }
  ]
}
```

### 5.2 $and

```json
{
  "$and": [
    { "field": "salesAmount", "op": ">=", "value": 1000 },
    { "field": "profitAmount", "op": ">", "value": 0 }
  ]
}
```

`$or` 和 `$and` 可以嵌套。`slice` 顶层数组本身默认是 AND。

### 5.3 等值条件简写

在 `slice` 行级过滤中，当对象只有一个非保留字段时，可简写为等值条件。

```json
{ "orderStatus": "COMPLETED" }
```

等价于：

```json
{ "field": "orderStatus", "op": "=", "value": "COMPLETED" }
```

保留字段包括 `field`、`op`、`value`、`$or`、`$and`、`$expr`、`maxDepth`。

## 6. 字段间比较与表达式条件

### 6.1 $field

`$field` 表示将另一个字段作为比较值。

```json
{
  "field": "salesAmount",
  "op": ">",
  "value": { "$field": "costAmount" }
}
```

### 6.2 $expr

`$expr` 用于表达更复杂的字段间计算条件。

```json
{ "$expr": "salesAmount > costAmount * 1.2" }
```

`$expr` 应只引用 QM 可见字段和 DSL 支持的表达式能力。

## 7. groupBy

`groupBy` 定义分组字段，可以使用字符串简写或对象格式。

```json
{
  "groupBy": [
    "customer$customerType",
    { "field": "orderDate$month" }
  ]
}
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `field` | string | 是 | 分组字段 |
| `agg` | string | 否 | 对该字段或指标使用的聚合方式 |

### 7.1 聚合类型

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
| `NONE` | 不聚合，加入分组 |

## 8. orderBy

`orderBy` 定义排序字段。

```json
{
  "orderBy": [
    "-salesAmount",
    { "field": "customer$caption", "dir": "asc", "nullLast": true }
  ]
}
```

### 8.1 字符串简写

| 格式 | 说明 |
|------|------|
| `"fieldName"` | 默认升序 |
| `"fieldName asc"` | 升序 |
| `"fieldName desc"` | 降序 |
| `"-fieldName"` | 降序 |

### 8.2 对象格式

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `field` | string | 是 | 无 | 排序字段 |
| `dir` | string | 否 | `asc` | `asc` 或 `desc` |
| `nullFirst` | boolean | 否 | `false` | NULL 值排在最前 |
| `nullLast` | boolean | 否 | `false` | NULL 值排在最后 |

## 9. calculatedFields

`calculatedFields` 用于在 DSL 中定义临时计算字段。定义后的字段可按其执行阶段在 `columns`、`slice`、`groupBy`、`orderBy` 或 `having` 中引用。

```json
{
  "calculatedFields": [
    {
      "name": "profitRate",
      "caption": "利润率",
      "expression": "profitAmount / salesAmount * 100",
      "type": "NUMBER",
      "emptyDefault": 0
    }
  ],
  "columns": ["customer$caption", "profitRate"]
}
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 计算字段名 |
| `caption` | string | 否 | 显示名称 |
| `description` | string | 否 | 字段说明 |
| `expression` | string | 是 | 计算表达式 |
| `agg` | string | 否 | 聚合类型 |
| `type` | string | 否 | 返回类型 |
| `partitionBy` | string[] | 否 | 窗口函数分区字段 |
| `windowOrderBy` | object[] | 否 | 窗口函数排序 |
| `windowFrame` | string | 否 | 窗口帧定义 |
| `emptyDefault` | any | 否 | 表达式结果为空时的默认值 |

### 9.1 表达式能力

| 类别 | 示例 |
|------|------|
| 算术运算 | `a + b`、`a - b`、`a * b`、`a / b` |
| 数学函数 | `ABS(x)`、`ROUND(x, 2)`、`CEIL(x)`、`FLOOR(x)` |
| 日期函数 | `YEAR(date)`、`MONTH(date)`、`DATEDIFF(a, b)` |
| 字符串函数 | `CONCAT(a, b)`、`SUBSTRING(s, 1, 3)`、`LOWER(s)` |
| 条件函数 | `COALESCE(a, b)`、`NULLIF(a, b)`、`CASE WHEN ... END` |
| 窗口函数 | `RANK()`、`DENSE_RANK()`、`LAG(field, 1)` |

### 9.2 窗口函数字段

```json
{
  "name": "salesRank",
  "caption": "销售排名",
  "expression": "RANK()",
  "partitionBy": ["region$caption"],
  "windowOrderBy": [
    { "field": "salesAmount", "dir": "desc" }
  ]
}
```

`partitionBy`、`windowOrderBy`、`windowFrame` 共同定义窗口边界。

## 10. having 与聚合过滤

`slice` 用于聚合前的行级过滤，`having` 用于聚合后的过滤。聚合字段、聚合别名和聚合计算字段应优先放入 `having`。

```json
{
  "columns": ["customer$caption", "salesAmount"],
  "groupBy": ["customer$caption"],
  "having": [
    { "field": "salesAmount", "op": ">=", "value": 10000 }
  ]
}
```

行级字段和聚合字段属于不同执行阶段，不应放在同一个 `$or` 或 `$and` 逻辑组中。需要同时表达时，应拆成 `slice` 和 `having`：

```json
{
  "columns": ["customer$caption", "salesAmount"],
  "slice": [
    { "field": "orderStatus", "op": "=", "value": "COMPLETED" }
  ],
  "groupBy": ["customer$caption"],
  "having": [
    { "field": "salesAmount", "op": ">", "value": 10000 }
  ]
}
```

部分运行时可以把 `slice` 中的纯聚合条件兼容提升为聚合过滤，但规范写法仍然是显式使用 `having`。

## 11. postAggregateCalculations

`postAggregateCalculations` 在分组聚合结果外层计算新字段。当前稳定形态主要用于 `ratioToTotal`。

```json
{
  "columns": ["customer$caption", "salesAmount", "salesShare"],
  "groupBy": ["customer$caption"],
  "postAggregateCalculations": [
    {
      "name": "salesShare",
      "kind": "ratioToTotal",
      "measure": "salesAmount",
      "scope": "grandTotal",
      "format": "percent"
    }
  ],
  "orderBy": ["-salesShare"]
}
```

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | 是 | 无 | 输出字段名 |
| `kind` | string | 是 | 无 | 当前支持 `ratioToTotal` |
| `measure` | string | 是 | 无 | 已选中的聚合指标或聚合别名 |
| `scope` | string | 否 | `grandTotal` | 当前稳定范围为 `grandTotal` |
| `format` | string | 否 | `ratio` | `ratio` 或 `percent` |

也可以使用 `calculatedFields` 的表达式简写：

```json
{
  "calculatedFields": [
    {
      "name": "salesShare",
      "expression": "ratio_to_total(salesAmount)"
    }
  ],
  "columns": ["customer$caption", "salesAmount", "salesShare"],
  "groupBy": ["customer$caption"]
}
```

聚合后计算字段可以用于结果阶段排序或过滤。过滤聚合后计算字段时，不要在同一个逻辑组里混合基础字段和聚合后字段。

## 12. timeWindow

`timeWindow` 用声明式方式表达常见时间分析，不要求调用方手写窗口函数或自连接。

```json
{
  "columns": ["orderDate$month", "salesAmount"],
  "groupBy": ["orderDate$month"],
  "timeWindow": {
    "field": "orderDate$id",
    "grain": "month",
    "comparison": "yoy",
    "range": "[)",
    "value": ["2025-01-01", "2026-01-01"],
    "targetMetrics": ["salesAmount"]
  }
}
```

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `field` | string | 是 | 无 | 时间轴字段 |
| `grain` | string | 是 | 无 | `day`、`week`、`month`、`quarter`、`year` |
| `comparison` | string | 是 | 无 | `yoy`、`mom`、`wow`、`ytd`、`mtd`、`rolling_7d`、`rolling_30d`、`rolling_90d` |
| `range` | string | 否 | `[)` | `[)` 或 `[]` |
| `value` | string[] | 否 | 空数组 | 时间范围边界；传入时必须正好包含开始和结束两个元素 |
| `targetMetrics` | string[] | 否 | 当前查询中的可用指标集合 | 需要应用时间窗口的聚合指标 |
| `rollingAggregator` | string | 否 | `sum` | 滚动窗口聚合方式：`sum`、`avg`、`count`、`min`、`max` |

不同 `comparison` 对 `grain` 有兼容性要求。不兼容的组合应失败，而不是猜测执行。

| comparison | 支持的 grain |
|------------|--------------|
| `yoy` | `week`、`month`、`quarter`、`year` |
| `mom` | `month` |
| `wow` | `day`、`week` |
| `ytd` | `day`、`week`、`month`、`quarter` |
| `mtd` | `day` |
| `rolling_7d` / `rolling_30d` | `day` |
| `rolling_90d` | `day`、`week` |

## 13. pivot

`pivot` 用于多维透视分析，例如行列交叉表、行轴或列轴维度转置、小计/总计、树形行轴、父级占比和列基准比值。

开启 `pivot` 时，透视轴和度量由 `pivot.rows`、`pivot.columns`、`pivot.metrics` 定义，不再使用顶层 `columns` 表达返回字段，也不使用顶层 `groupBy` 表达透视分组。

```json
{
  "slice": [
    { "field": "orderStatus", "op": "=", "value": "COMPLETED" }
  ],
  "pivot": {
    "rows": ["region$caption"],
    "columns": ["orderDate$month"],
    "metrics": ["salesAmount"],
    "outputFormat": "grid"
  }
}
```

### 13.1 pivot 对象

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `rows` | array | 是 | 无 | 行轴维度定义 |
| `columns` | array | 否 | 无 | 列轴维度定义 |
| `metrics` | array | 是 | 无 | 原生度量或受控派生指标 |
| `properties` | string[] | 否 | 无 | 随维度带出的附加属性，不改变聚合粒度 |
| `options` | object | 否 | 无 | 透视计算选项 |
| `layout` | object | 否 | `metricPlacement: "columns"` | 透视结果布局 |
| `outputFormat` | string | 否 | `tree` | `flat`、`tree` 或 `grid`；建议显式指定 |

`pivot` 可以与顶层 `slice` 和 `calculatedFields` 配合使用。`slice` 仍表示聚合前过滤；`calculatedFields` 可为透视度量或排序提供临时字段。

`pivot` 与顶层 `columns` 互斥，也与 `timeWindow` 互斥。需要同时做时间窗口分析和透视展示时，应拆成不同查询流程，而不是放进同一个 DSL 对象。

### 13.2 轴字段

`rows` 和 `columns` 的元素可以是字段字符串，也可以是对象。

```json
{
  "pivot": {
    "rows": [
      "category$caption",
      {
        "field": "product$caption",
        "orderBy": ["-salesAmount"],
        "limit": 10,
        "having": [
          { "metric": "salesAmount", "op": ">", "value": 10000 }
        ]
      }
    ],
    "metrics": ["salesAmount"],
    "outputFormat": "flat"
  }
}
```

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `field` | string | 是 | 无 | 轴字段引用 |
| `orderBy` | string[] | 否 | 无 | 轴成员排序，`-metricName` 表示降序 |
| `limit` | integer | 否 | 无 | 在隐式父级分组内截断 Top N |
| `having` | array | 否 | 无 | 轴级聚合过滤，先过滤再 Top N |
| `hierarchyMode` | string | 否 | 普通维度 | `tree` 表示启用父子维度树形行轴 |
| `expandDepth` | integer | 否 | `-1` | 树形行轴展开深度；仅 `hierarchyMode: "tree"` 生效，`-1` 表示展开到叶子节点 |

轴级 `having` 的条件格式为：

```json
{ "metric": "salesAmount", "op": ">=", "value": 10000 }
```

轴级 `having` 当前支持 `>`、`>=`、`<`、`<=`、`=`、`!=`。

### 13.3 metrics

`metrics` 支持原生度量字符串和受控派生指标对象。

| 形式 | 示例 | 说明 |
|------|------|------|
| 原生度量 | `"salesAmount"` | 当前 QM 暴露的度量字段 |
| `parentShare` | `{ "name": "productShare", "type": "parentShare", "of": "salesAmount", "axis": "rows" }` | 子级值 / 父级聚合值 |
| `baselineRatio` | `{ "name": "monthIndex", "type": "baselineRatio", "of": "salesAmount", "axis": "columns", "baseline": "first" }` | 当前列值 / 首列或末列基准值 |

`parentShare` 用于 rows 轴相邻层级之间的父级占比。`of` 引用的原生度量必须同时出现在 `metrics` 中，且适合做可加汇总。

```json
{
  "pivot": {
    "rows": ["category$caption", "product$caption"],
    "metrics": [
      "salesAmount",
      {
        "name": "productShare",
        "type": "parentShare",
        "of": "salesAmount",
        "axis": "rows"
      }
    ],
    "outputFormat": "flat"
  }
}
```

`baselineRatio` 用于 columns 轴上的首列或末列基准比值。使用 `baselineRatio` 时，`columns` 轴不能为空，`axis` 必须是 `columns`，`baseline` 必须是 `first` 或 `last`，`of` 引用的原生度量必须同时出现在 `metrics` 中。

```json
{
  "pivot": {
    "rows": ["region$caption"],
    "columns": ["orderDate$month"],
    "metrics": [
      "salesAmount",
      {
        "name": "monthIndex",
        "type": "baselineRatio",
        "of": "salesAmount",
        "axis": "columns",
        "baseline": "first"
      }
    ],
    "outputFormat": "flat"
  }
}
```

`pivot.metrics` 当前不支持 `expr`。需要计算型度量时，应优先使用 QM 预定义计算字段或顶层 `calculatedFields`。

### 13.4 options

```json
{
  "pivot": {
    "rows": ["region$caption"],
    "columns": ["orderDate$month"],
    "metrics": ["salesAmount"],
    "options": {
      "rowSubtotals": true,
      "columnSubtotals": true,
      "grandTotal": true
    },
    "outputFormat": "grid"
  }
}
```

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `crossjoin` | boolean | `false` | 对行列轴成员做稀疏补全 |
| `rowSubtotals` | boolean | `false` | 生成行轴小计 |
| `columnSubtotals` | boolean | `false` | 生成列轴小计 |
| `grandTotal` | boolean | `false` | 生成总计 |

这些选项属于 `pivot.options`，不同于顶层 `withSubtotals`。普通 `groupBy` 聚合使用顶层 `withSubtotals`，透视分析使用 `pivot.options`。

### 13.5 tree 行轴

树形透视用于父子维度行轴。

```json
{
  "pivot": {
    "rows": [
      {
        "field": "team$hierarchy$id",
        "hierarchyMode": "tree",
        "expandDepth": 3
      }
    ],
    "metrics": ["salesAmount"],
    "outputFormat": "tree"
  }
}
```

树形行轴的当前边界：

- `hierarchyMode: "tree"` 只支持 `rows` 轴，不支持 `columns` 轴。
- 使用树形行轴时，`outputFormat` 必须是 `tree`。
- `rows` 中最多只能有一个树形字段。
- 树形行轴不要与 `crossjoin`、`rowSubtotals`、`columnSubtotals`、`grandTotal`、`parentShare` 或 `baselineRatio` 组合使用。

### 13.6 layout 和 outputFormat

`layout.metricPlacement` 控制度量在结果中的摆放位置。

| 值 | 说明 |
|----|------|
| `columns` | 度量放在列头叶子层 |
| `rows` | 度量转为固定指标行 |

`outputFormat` 控制透视结果形态。

| 值 | 说明 |
|----|------|
| `flat` | 扁平行结果，适合继续程序化处理 |
| `grid` | 行头、列头、单元格矩阵形态 |
| `tree` | 树形行轴结果 |

### 13.7 pivot 语法边界

- `pivot` 与顶层 `columns` 不能同时出现。
- `pivot` 与 `timeWindow` 不能同时出现。
- 透视轴排序、截断和轴级过滤应写在轴字段对象中，不要用顶层 `orderBy` 或 `having` 表达。
- `parentShare` 和 `baselineRatio` 是输出派生指标，不能参与轴级 `having`、`orderBy` 或 `limit`。
- `parentShare` 和 `baselineRatio` 当前只适合基于可加度量进行计算；不可加度量应失败。
- 透视轴成员过多时，引擎会拒绝执行。应通过 `slice`、轴级 `limit` 或更窄的维度降低结果规模。

## 14. 执行选项

### 14.1 returnTotal

`returnTotal` 声明调用方需要总数或汇总数据。它只表达 DSL 意图，不定义具体结果包络。

```json
{
  "columns": ["customer$caption", "salesAmount"],
  "groupBy": ["customer$caption"],
  "returnTotal": true
}
```

### 14.2 distinct

`distinct` 用于明细结果去重，适合“列出所有客户类型”这类非聚合查询。

```json
{
  "columns": ["customer$customerType"],
  "distinct": true
}
```

### 14.3 withSubtotals

`withSubtotals` 用于分组聚合结果的小计或总计。

```json
{
  "columns": ["region$caption", "customer$customerType", "salesAmount"],
  "groupBy": ["region$caption", "customer$customerType"],
  "withSubtotals": true
}
```

## 15. 语法边界

JSON Query DSL 的设计目标是结构化、可校验、可审计。它不是物理 SQL 的透传格式。

- 字段必须来自当前 QM 的可见字段集合。
- 权限过滤和上下文切片由引擎注入。
- 方言转换由引擎完成，DSL 不直接暴露数据库方言。
- 不支持的字段、操作符、时间窗口组合或表达式应关闭式失败，而不是猜测执行。
- 跨多个中间结果的编排、二次结果集成和更高阶分析流程不属于单个 JSON Query DSL 对象本身。
- 向量检索类操作符不纳入本文当前公开语法，后续可作为单独能力评估和发布。

## 16. 常用语法片段

### 16.1 明细查询

```json
{
  "columns": ["orderId", "orderStatus", "customer$caption", "salesAmount"],
  "slice": [
    { "field": "orderStatus", "op": "=", "value": "COMPLETED" }
  ],
  "orderBy": ["-salesAmount"]
}
```

### 16.2 分组聚合

```json
{
  "columns": ["customer$customerType", "salesAmount"],
  "groupBy": ["customer$customerType"],
  "orderBy": ["-salesAmount"]
}
```

### 16.3 计算字段

```json
{
  "calculatedFields": [
    {
      "name": "profitRate",
      "expression": "profitAmount / salesAmount * 100",
      "type": "NUMBER",
      "emptyDefault": 0
    }
  ],
  "columns": ["product$caption", "salesAmount", "profitAmount", "profitRate"],
  "orderBy": ["-profitRate"]
}
```

### 16.4 层级查询

```json
{
  "columns": ["team$caption", "salesAmount"],
  "slice": [
    {
      "field": "team$id",
      "op": "selfAndDescendantsOf",
      "value": "TEAM001"
    }
  ],
  "groupBy": ["team$caption"]
}
```

### 16.5 聚合后占比

```json
{
  "columns": ["team$caption", "salesAmount", "salesShare"],
  "groupBy": ["team$caption"],
  "postAggregateCalculations": [
    {
      "name": "salesShare",
      "kind": "ratioToTotal",
      "measure": "salesAmount",
      "format": "percent"
    }
  ],
  "orderBy": ["-salesShare"]
}
```

### 16.6 透视分析

```json
{
  "pivot": {
    "rows": ["region$caption"],
    "columns": ["orderDate$month"],
    "metrics": ["salesAmount"],
    "options": {
      "rowSubtotals": true,
      "columnSubtotals": true,
      "grandTotal": true
    },
    "outputFormat": "grid"
  }
}
```
