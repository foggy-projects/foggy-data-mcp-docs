# JSON Query DSL Syntax

<DownloadButton filename="query-dsl.md" title="Download this document" />

This document describes the complete JSON Query DSL (Domain Specific Language) syntax for Foggy Dataset Model.

## 1. Overview

JSON Query DSL is a declarative query language that describes query conditions, field selection, grouping, sorting, and other operations in JSON format. The system parses the DSL and converts it to SQL for execution.

### 1.1 Request Structure

```json
{
    "page": 1,                          // Page number (starts from 1)
    "pageSize": 20,                     // Page size
    "param": {
        "columns": [...],               // Query columns
        "slice": [...],                 // Filter conditions
        "groupBy": [...],               // Grouping fields
        "orderBy": [...],               // Sorting fields
        "calculatedFields": [...],      // Dynamic calculated fields
        "returnTotal": true             // Whether to return totals
    }
}
```

---

## 2. Field Reference Format

### 2.1 Reference Types

| Format | Description | Example |
|--------|-------------|---------|
| `propertyName` | Fact table property | `orderId`, `orderStatus` |
| `measureName` | Measure field | `totalAmount`, `quantity` |
| `dimension$id` | Dimension ID | `customer$id` |
| `dimension$caption` | Dimension display value | `customer$caption` |
| `dimension$property` | Dimension property | `customer$customerType` |
| `dimension$hierarchy$id` | Parent-child hierarchy view | `team$hierarchy$id` |
| `nested.dimension$property` | Nested dimension property | `product.category$caption` |

### 2.2 Nested Dimension Reference

Nested dimension references use two separators: **`.` for dimension path navigation, `$` for property access**.

```json
{
    "columns": [
        "product$caption",                    // Level 1 dimension
        "product.category$caption",           // Level 2 dimension (. separates hierarchy)
        "product.category.group$caption"      // Level 3 dimension
    ]
}
```

If `alias` is defined in TM, you can also use alias references:

```json
{
    "columns": [
        "product$caption",                    // Level 1 dimension
        "productCategory$caption",            // Level 2 dimension (via alias)
        "categoryGroup$caption"               // Level 3 dimension (via alias)
    ]
}
```

> **Note**: Do NOT use multiple `$` instead of `.` (e.g., ~~`product$category$caption`~~) — `$` is only for separating dimension from property.

**Output column name mapping**: Dots in paths are automatically converted to underscores in response data:

| DSL Reference | Output Column Name |
|--------------|-------------------|
| `product$caption` | `product$caption` |
| `product.category$caption` | `product_category$caption` |
| `product.category.group$caption` | `product_category_group$caption` |
| `productCategory$caption` (alias) | `productCategory$caption` |

---

## 3. Filter Conditions (slice)

### 3.1 Basic Structure

**Single Condition:**
```json
{
    "field": "fieldName",
    "op": "operator",
    "value": "value",
    "maxDepth": 2           // Hierarchy depth limit (hierarchy operators only)
}
```

**OR Condition Group:**
```json
{
    "$or": [
        { "field": "field1", "op": "=", "value": "value1" },
        { "field": "field2", "op": "=", "value": "value2" }
    ]
}
```

**AND Condition Group:**
```json
{
    "$and": [
        { "field": "field1", "op": ">", "value": 100 },
        { "field": "field2", "op": "<", "value": 1000 }
    ]
}
```

### 3.2 Operator List

#### Comparison Operators

| Operator | Description | Value Type | Example |
|----------|-------------|------------|---------|
| `=` | Equal | any | `{ "op": "=", "value": "A" }` |
| `!=` / `<>` | Not equal | any | `{ "op": "!=", "value": "B" }` |
| `===` | Strict equal (no null special handling) | any | `{ "op": "===", "value": "A" }` |
| `>` | Greater than | number | `{ "op": ">", "value": 100 }` |
| `>=` | Greater or equal | number | `{ "op": ">=", "value": 100 }` |
| `<` | Less than | number | `{ "op": "<", "value": 1000 }` |
| `<=` | Less or equal | number | `{ "op": "<=", "value": 1000 }` |

> **`=` vs `===`**: `=` automatically converts to `IS NULL` when value is null, while `===` always generates `field = value` without null special handling.

#### Set Operators

| Operator | Description | Value Type | Example |
|----------|-------------|------------|---------|
| `in` | In list | array | `{ "op": "in", "value": ["A", "B", "C"] }` |
| `not in` / `nin` | Not in list | array | `{ "op": "not in", "value": ["X", "Y"] }` |

#### Pattern Matching Operators

| Operator | Description | Wildcard Handling | Example |
|----------|-------------|-------------------|---------|
| `like` | Pattern match | Auto adds `%...%` | `{ "op": "like", "value": "keyword" }` |
| `left_like` | Left match | Auto adds `%...` | `{ "op": "left_like", "value": "suffix" }` |
| `right_like` | Right match | Auto adds `...%` | `{ "op": "right_like", "value": "prefix" }` |
| `not like` | Not match | Auto adds `%...%` | `{ "op": "not like", "value": "excluded" }` |
| `not left_like` | Not left match | Auto adds `%...` | `{ "op": "not left_like", "value": "suffix" }` |
| `not right_like` | Not right match | Auto adds `...%` | `{ "op": "not right_like", "value": "prefix" }` |

#### Null Operators

| Operator | Description | Value | Example |
|----------|-------------|-------|---------|
| `is null` / `isNull` | Is null | not needed | `{ "op": "is null" }` |
| `is not null` / `isNotNull` | Is not null | not needed | `{ "op": "is not null" }` |
| `isNullAndEmpty` | Is null or empty string | not needed | `{ "op": "isNullAndEmpty" }` |
| `isNotNullAndEmpty` | Is not null and not empty string | not needed | `{ "op": "isNotNullAndEmpty" }` |

> **`isNullAndEmpty`** generates `(field IS NULL OR field = '')`, useful when you need to check for both NULL and empty string values.

#### Range Operators

| Operator | Description | Boundaries | Example |
|----------|-------------|------------|---------|
| `[]` | Closed interval | Includes both | `{ "op": "[]", "value": [100, 500] }` |
| `[)` | Left-closed right-open | Includes left | `{ "op": "[)", "value": ["2024-01-01", "2024-07-01"] }` |
| `(]` | Left-open right-closed | Includes right | `{ "op": "(]", "value": [0, 100] }` |
| `()` | Open interval | Excludes both | `{ "op": "()", "value": [0, 100] }` |

#### Hierarchy Operators (Parent-Child Dimensions)

For hierarchical queries on parent-child dimensions. See [Parent-Child Dimensions](./parent-child.md) for details.

| Operator | Description | Includes Self | Example |
|----------|-------------|---------------|---------|
| `childrenOf` / `children_of` | Direct children | No | `{ "op": "childrenOf", "value": "T001" }` |
| `descendantsOf` / `descendants_of` | All descendants | No | `{ "op": "descendantsOf", "value": "T001" }` |
| `selfAndDescendantsOf` / `self_and_descendants_of` | Self and descendants | Yes | `{ "op": "selfAndDescendantsOf", "value": "T001" }` |
| `ancestorsOf` / `ancestors_of` | All ancestors | No | `{ "op": "ancestorsOf", "value": "T001" }` |
| `selfAndAncestorsOf` / `self_and_ancestors_of` | Self and ancestors | Yes | `{ "op": "selfAndAncestorsOf", "value": "T001" }` |

> Downward queries (childrenOf/descendantsOf) use `closure.parentKey = value`, upward queries (ancestorsOf/selfAndAncestorsOf) use `closure.childKey = value`.

**Hierarchy Depth Limit**:

Use the `maxDepth` parameter to limit query depth:

```json
{
    "field": "team$id",
    "op": "descendantsOf",
    "value": "T001",
    "maxDepth": 2          // Only query descendants within 2 levels
}
```

**Hierarchy Operator Example**:

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

**Generated SQL**:
```sql
SELECT dim_team.caption, SUM(fact.sales_amount)
FROM fact_team_sales fact
LEFT JOIN team_closure closure ON fact.team_id = closure.child_id
LEFT JOIN dim_team ON closure.child_id = dim_team.id
WHERE closure.parent_id = 'T001'
  AND closure.distance = 1
GROUP BY dim_team.caption
```

#### Vector Operators (Vector Models Only)

For semantic similarity search on vector models. **Only vector fields (type=VECTOR) support these operators**.

| Operator | Description | Example |
|----------|-------------|---------|
| `similar` | Similarity search | `{ "op": "similar", "value": { "text": "..." } }` |
| `hybrid` | Hybrid search (vector + keyword) | `{ "op": "hybrid", "value": { "text": "...", "keyword": "..." } }` |

**similar Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes* | Search text (auto-converted to vector) |
| `vector` | float[] | Yes* | Direct vector input (alternative to text) |
| `topK` | int | No | Number of results, default 10 |
| `minScore` | float | No | Minimum similarity score (0-1) |
| `groupBy` | string | No | Group by field for deduplication |
| `radius` | float | No | Minimum score for range search |

**hybrid Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | Search text (auto-converted to vector) |
| `keyword` | string | No | Keyword filter |
| `topK` | int | No | Number of results, default 10 |
| `vectorWeight` | float | No | Vector weight, default 0.7 |
| `keywordWeight` | float | No | Keyword weight, default 0.3 |

**Vector Search Example**:

```json
{
    "param": {
        "columns": ["docId", "title", "content", "_score"],
        "slice": [
            {
                "field": "embedding",
                "op": "similar",
                "value": {
                    "text": "sales performance analysis",
                    "topK": 10,
                    "minScore": 0.6
                }
            },
            { "field": "category", "op": "=", "value": "report" }
        ]
    }
}
```

**Hybrid Search Example**:

```json
{
    "param": {
        "columns": ["docId", "title", "_score"],
        "slice": [
            {
                "field": "embedding",
                "op": "hybrid",
                "value": {
                    "text": "sales analysis",
                    "keyword": "report",
                    "topK": 10
                }
            }
        ]
    }
}
```

> Vector search results are sorted by similarity in descending order. The `_score` field indicates similarity (0-1).

### 3.3 Logical Combination ($or / $and)

Conditions within `slice` array are connected with **AND** by default. Use `$or` or `$and` operators to explicitly specify logical combinations.

**MongoDB-style Operators:**

| Operator | Description | Example |
|----------|-------------|---------|
| `$or` | OR logical group | `{ "$or": [cond1, cond2] }` matches when **any** condition is true |
| `$and` | AND logical group | `{ "$and": [cond1, cond2] }` matches when **all** conditions are true |

**Example: Find orders where customer type is "VIP" OR order amount > 10000**

```json
{
    "param": {
        "slice": [
            {
                "$or": [
                    { "field": "customer$customerType", "op": "=", "value": "VIP" },
                    { "field": "totalAmount", "op": ">", "value": 10000 }
                ]
            }
        ]
    }
}
```

**Example: Find orders where status is "COMPLETED" AND (customer type is "VIP" OR amount > 10000)**

```json
{
    "param": {
        "slice": [
            { "field": "orderStatus", "op": "=", "value": "COMPLETED" },
            {
                "$or": [
                    { "field": "customer$customerType", "op": "=", "value": "VIP" },
                    { "field": "totalAmount", "op": ">", "value": 10000 }
                ]
            }
        ]
    }
}
```

**Nested Conditions:**

`$or` and `$and` can be nested:

```json
{
    "$or": [
        {
            "$and": [
                { "field": "region", "op": "=", "value": "East" },
                { "field": "totalAmount", "op": ">=", "value": 10000 }
            ]
        },
        {
            "$and": [
                { "field": "region", "op": "=", "value": "West" },
                { "field": "totalAmount", "op": ">=", "value": 5000 }
            ]
        }
    ]
}
```

### 3.4 Field-to-Field Comparison ($field / $expr)

Compare values between two fields directly without creating calculated fields. Two syntaxes are provided:

#### $field Reference

Use `{"$field": "fieldName"}` as value to reference another field instead of a literal value:

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

**Generated SQL**:
```sql
WHERE sales_amount > cost_amount
```

**Supported comparison operators**:

| Operator | Example |
|----------|---------|
| `=` | `{"field": "a", "op": "=", "value": {"$field": "b"}}` |
| `!=` | `{"field": "a", "op": "!=", "value": {"$field": "b"}}` |
| `>` | `{"field": "a", "op": ">", "value": {"$field": "b"}}` |
| `>=` | `{"field": "a", "op": ">=", "value": {"$field": "b"}}` |
| `<` | `{"field": "a", "op": "<", "value": {"$field": "b"}}` |
| `<=` | `{"field": "a", "op": "<=", "value": {"$field": "b"}}` |

#### $expr Expression

Use `$expr` for more complex field comparison expressions:

```json
{
    "param": {
        "slice": [
            { "$expr": "salesAmount > costAmount" }
        ]
    }
}
```

**Supports arithmetic operations**:

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

**Generated SQL**:
```sql
WHERE (sales_amount > (cost_amount * 1.2))
  AND (profit_amount >= (discount_amount + 100))
```

#### Combining with Other Conditions

`$field` and `$expr` can be combined with regular conditions and logical groups:

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

**Using within $or conditions**:

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

#### Use Cases

| Scenario | Recommended Syntax | Example |
|----------|-------------------|---------|
| Simple field comparison | `$field` | Sales amount greater than cost |
| Comparison with arithmetic | `$expr` | Profit rate over 20% (`salesAmount > costAmount * 1.2`) |
| Multi-field arithmetic | `$expr` | Net amount greater than cost (`salesAmount - discountAmount > costAmount`) |

---

## 4. Grouping (groupBy)

### 4.1 Basic Format

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

### 4.2 Aggregation Types

| Type | Description |
|------|-------------|
| `SUM` | Sum |
| `AVG` | Average |
| `COUNT` | Count |
| `COUNTD` / `COUNT_DISTINCT` | Distinct count |
| `MAX` | Maximum |
| `MIN` | Minimum |
| `GROUP_CONCAT` | String concatenation |
| `STDDEV_POP` | Population standard deviation |
| `STDDEV_SAMP` | Sample standard deviation |
| `VAR_POP` | Population variance |
| `VAR_SAMP` | Sample variance |
| `NONE` | No aggregation (added to GROUP BY) |

---

## 5. Sorting (orderBy)

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

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `field` | string | Yes | Sort field name |
| `dir` | string | No | `asc` (ascending) / `desc` (descending), default `asc` |
| `nullFirst` | boolean | No | NULL values first |
| `nullLast` | boolean | No | NULL values last |

---

## 6. Dynamic Calculated Fields (calculatedFields)

```json
{
    "param": {
        "calculatedFields": [
            {
                "name": "profitRate",
                "caption": "Profit Rate",
                "expression": "profitAmount / salesAmount * 100",
                "agg": "SUM"
            }
        ],
        "columns": ["product$caption", "profitRate"]
    }
}
```

### 6.2 Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `name` | string | Yes | Calculated field name (used for reference) |
| `caption` | string | No | Display name |
| `expression` | string | Yes | Calculation expression |
| `description` | string | No | Field description |
| `agg` | string | No | Aggregation type (SUM/AVG/COUNT/COUNTD/MAX/MIN etc.) |
| `type` | string | No | Return type (NUMBER/INTEGER/TEXT) |
| `partitionBy` | string[] | No | Window function partition fields |
| `windowOrderBy` | object[] | No | Window function ordering, format: `[{"field": "xxx", "dir": "desc"}]` |
| `windowFrame` | string | No | Window frame definition, e.g. `"ROWS BETWEEN 6 PRECEDING AND CURRENT ROW"` |

### 6.3 Supported Expressions

#### Arithmetic Operations
- `+`, `-`, `*`, `/`, `%`

#### Math Functions
- `ABS(x)` - Absolute value
- `ROUND(x, n)` - Round to n decimal places
- `CEIL(x)` / `CEILING(x)` - Round up
- `FLOOR(x)` - Round down
- `MOD(x, y)` - Modulo
- `POWER(x, y)` / `POW(x, y)` - Exponentiation
- `SQRT(x)` - Square root
- `SIGN(x)` - Sign function (returns 1 for positive, -1 for negative, 0 for zero)
- `TRUNCATE(x, n)` / `TRUNC(x, n)` - Truncate to n decimal places

#### Date Functions
- `YEAR(date)` - Extract year
- `MONTH(date)` - Extract month
- `DAY(date)` - Extract day
- `HOUR(datetime)` - Extract hour
- `MINUTE(datetime)` - Extract minute
- `SECOND(datetime)` - Extract second
- `DATE(datetime)` - Extract date part
- `TIME(datetime)` - Extract time part
- `NOW()` - Current datetime
- `CURRENT_DATE()` - Current date
- `CURRENT_TIME()` - Current time
- `CURRENT_TIMESTAMP()` - Current timestamp
- `DATE_ADD(date, interval)` - Date addition
- `DATE_SUB(date, interval)` - Date subtraction
- `DATEDIFF(date1, date2)` - Date difference
- `TIMESTAMPDIFF(unit, date1, date2)` - Timestamp difference
- `DATE_FORMAT(date, format)` - Date formatting
- `STR_TO_DATE(str, format)` - String to date
- `EXTRACT(unit FROM date)` - Extract date part

#### String Functions
- `CONCAT(s1, s2, ...)` - String concatenation
- `CONCAT_WS(sep, s1, s2, ...)` - Concatenation with separator
- `SUBSTRING(s, start, len)` / `SUBSTR(s, start, len)` - Extract substring
- `LEFT(s, n)` - Left substring of n characters
- `RIGHT(s, n)` - Right substring of n characters
- `UPPER(s)` - Convert to uppercase
- `LOWER(s)` - Convert to lowercase
- `TRIM(s)` - Remove leading and trailing whitespace
- `LTRIM(s)` - Remove leading whitespace
- `RTRIM(s)` - Remove trailing whitespace
- `LENGTH(s)` - Byte length
- `CHAR_LENGTH(s)` - Character length
- `REPLACE(s, from, to)` - String replacement
- `INSTR(s, substr)` - Find substring position
- `LOCATE(substr, s)` - Find substring position
- `LPAD(s, len, pad)` - Left pad
- `RPAD(s, len, pad)` - Right pad

#### Conditional and Type Functions
- `COALESCE(v1, v2, ...)` - Return first non-null value
- `NULLIF(v1, v2)` - Return NULL if equal
- `IFNULL(v, default)` / `NVL(v, default)` / `ISNULL(v)` - Null handling
- `IF(condition, trueVal, falseVal)` - Conditional expression
- `CASE WHEN ... THEN ... ELSE ... END` - Case expression
- `CAST(v AS type)` / `CONVERT(v, type)` - Type conversion

#### Window Functions

Window functions are used in calculated fields with `partitionBy`, `windowOrderBy`, and `windowFrame` parameters:

| Function | Description |
|----------|-------------|
| `ROW_NUMBER()` | Row number (unique per row) |
| `RANK()` | Rank (gaps on ties) |
| `DENSE_RANK()` | Rank (no gaps on ties) |
| `NTILE(n)` | Divide data into n buckets |
| `LAG(field, offset)` | Value from preceding row |
| `LEAD(field, offset)` | Value from following row |
| `FIRST_VALUE(field)` | First value in window |
| `LAST_VALUE(field)` | Last value in window |

**Window Function Example**:

```json
{
    "param": {
        "calculatedFields": [
            {
                "name": "salesRank",
                "caption": "Sales Rank",
                "expression": "RANK()",
                "partitionBy": ["region$caption"],
                "windowOrderBy": [{"field": "salesAmount", "dir": "desc"}]
            },
            {
                "name": "movingAvg",
                "caption": "7-Day Moving Average",
                "expression": "AVG(salesAmount)",
                "partitionBy": ["product$id"],
                "windowOrderBy": [{"field": "salesDate$caption", "dir": "asc"}],
                "windowFrame": "ROWS BETWEEN 6 PRECEDING AND CURRENT ROW"
            },
            {
                "name": "prevDaySales",
                "caption": "Previous Day Sales",
                "expression": "LAG(salesAmount, 1)",
                "partitionBy": ["product$id"],
                "windowOrderBy": [{"field": "salesDate$caption", "dir": "asc"}]
            }
        ],
        "columns": ["salesDate$caption", "product$caption", "salesAmount", "salesRank", "movingAvg", "prevDaySales"]
    }
}
```

> **Note**: Window functions do not trigger GROUP BY; they compute independently on each row.

---

## 7. Pagination

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (starts from 1) |
| `pageSize` | integer | 10 | Page size |
| `start` | integer | 0 | Start record (alternative to page) |
| `limit` | integer | 10 | Record limit (alternative to pageSize) |

---

## 8. Response Structure

```json
{
    "code": 0,
    "data": {
        "items": [...],
        "total": 100,
        "totalData": {
            "total": 100,
            "totalAmount": 129900.00
        }
    },
    "msg": "success"
}
```

---

## 9. Complete Examples

### Detail Query

```json
{
    "page": 1,
    "pageSize": 20,
    "param": {
        "columns": ["orderId", "customer$caption", "product$caption", "totalAmount"],
        "slice": [
            { "field": "orderStatus", "op": "in", "value": ["COMPLETED", "SHIPPED"] },
            { "field": "orderTime", "op": "[)", "value": ["2024-01-01", "2024-07-01"] }
        ],
        "orderBy": [{ "field": "orderTime", "dir": "desc" }]
    }
}
```

### Aggregation Query

```json
{
    "page": 1,
    "pageSize": 100,
    "param": {
        "columns": ["customer$customerType", "totalQuantity", "totalAmount"],
        "groupBy": [{ "field": "customer$customerType" }],
        "orderBy": [{ "field": "totalAmount", "dir": "desc" }]
    }
}
```

---

## Next Steps

- [TM Syntax Manual](./tm-syntax.md) - Table model definition
- [QM Syntax Manual](./qm-syntax.md) - Query model definition
- [Parent-Child Dimensions](./parent-child.md) - Hierarchy dimension details
- [Calculated Fields](./calculated-fields.md) - Complex calculation logic
- [Query API](../api/query-api.md) - HTTP API reference
