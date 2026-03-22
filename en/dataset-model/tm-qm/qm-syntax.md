# QM Syntax Manual

<DownloadButton filename="qm-syntax.md" title="Download this document" />

QM (Query Model) defines query views based on TM, including queryable fields and UI configurations.

## 1. Basic Structure

QM files use JavaScript syntax, exporting a `queryModel` object:

```javascript
export const queryModel = {
    name: 'FactOrderQueryModel',    // Query model name (required)
    caption: 'Order Query',          // Display name
    model: 'FactOrderModel',         // Associated TM model name (required)

    columnGroups: [...],             // Column group definitions
    orders: [...]                    // Default sorting
};
```

### 1.1 Basic Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Unique query model identifier |
| `caption` | string | No | Display name |
| `description` | string | No | Model description (used for AI analysis context) |
| `model` | string/array | Yes | Associated TM model (single or multiple) |
| `loader` | string | No | Loader version (`"v2"` for V2 loader) |
| `columnGroups` | array | No | Column group definitions |
| `orders` | array | No | Default sorting |
| `conds` | array | No | Pre-defined query conditions, see [Chapter 9](#_9-pre-defined-query-conditions-conds) |
| `accesses` | array | No | Access control list, see [Authorization](../api/authorization.md) |
| `deprecated` | boolean | No | Mark as deprecated |

---

## 2. Single Model Association

The most common case is QM associating with a single TM:

```javascript
export const queryModel = {
    name: 'FactOrderQueryModel',
    model: 'FactOrderModel',   // Directly use TM name
    columnGroups: [...]
};
```

---

## 3. Multi-Model Association

When associating multiple fact tables, use `loadTableModel` to load models and reference fields via `ref`.

```javascript
// Load models
const fo = loadTableModel('FactOrderModel');
const fp = loadTableModel('FactPaymentModel');

export const queryModel = {
    name: 'OrderPaymentJoinQueryModel',
    caption: 'Order Payment Join Query',

    // Multi-model configuration
    model: [
        {
            name: fo,
            alias: 'fo'                    // Table alias
        },
        {
            name: fp,
            alias: 'fp',
            onBuilder: () => {             // JOIN condition
                return 'fo.order_id = fp.order_id';
            }
        }
    ],

    columnGroups: [
        {
            caption: 'Order Info',
            items: [
                { ref: fo.orderId },           // V2: Use ref for reference
                { ref: fo.orderStatus },
                { ref: fo.customer }           // Dimension ref, auto-expands to $id and $caption
            ]
        },
        {
            caption: 'Payment Info',
            items: [
                { ref: fp.paymentId },
                { ref: fp.payAmount }
            ]
        }
    ]
};
```

### 3.1 Multi-Model Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string/proxy | Yes | TM model name or loadTableModel proxy |
| `alias` | string | Yes | Table alias to distinguish fields from different models |
| `onBuilder` | function | No | JOIN condition builder (required for 2nd model onwards) |

---

## 4. Column Group Definition (columnGroups)

Column groups organize query fields for UI display. After loading a model with `loadTableModel`, reference fields via `ref`:

```javascript
const fo = loadTableModel('FactOrderModel');

columnGroups: [
    {
        caption: 'Order Info',
        items: [
            { ref: fo.orderId },
            { ref: fo.orderStatus }
        ]
    },
    {
        caption: 'Customer Dimension',
        items: [
            { ref: fo.customer },              // Auto-expands to $id + $caption
            { ref: fo.customer$customerType }  // Dimension attribute
        ]
    }
]
```

**Advantages of ref syntax**:
- IDE support for code completion and type checking
- Auto-updates references during refactoring
- Compile-time error detection

### 4.1 Auto-Expansion of Dimension References

When `ref` points to a dimension (without `$` suffix), it auto-expands to two columns:

```javascript
{ ref: fo.customer }
// Equivalent to auto-generating:
// customer$id
// customer$caption
```

### 4.2 Column Group Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `caption` | string | No | Group name |
| `name` | string | No | Group identifier |
| `items` | array | Yes | Column item list |

### 4.3 Column Item Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ref` | object | Yes | Field reference (using loadTableModel proxy) |
| `name` | string | No | Column unique identifier (defaults to ref) |
| `caption` | string | No | Override display name from TM |
| `description` | string | No | Column description (for AI analysis context) |
| `alias` | string | No | Output column alias |
| `formula` | string | No | QM calculated field formula |
| `type` | string | No | Calculated field return type |
| `partitionBy` | string[] | No | Window function PARTITION BY list |
| `windowOrderBy` | object[] | No | Window function ORDER BY |
| `windowFrame` | string | No | Window frame definition |
| `ai` | object | No | AI configuration (enabled, prompt, levels) |
| `deprecated` | boolean | No | Mark as deprecated |
| `ui` | object | No | UI configuration |

### 4.4 UI Configuration

| Field | Type | Description |
|-------|------|-------------|
| `fixed` | string | Fixed position: `left` / `right` |
| `width` | number | Column width (pixels) |
| `align` | string | Alignment: `left` / `center` / `right` |
| `visible` | boolean | Default visibility |

---

## 5. Field Reference Format

After loading models with `loadTableModel`, reference fields via proxy objects:

```javascript
const fo = loadTableModel('FactOrderModel');

// Fact table properties
fo.orderId
fo.orderStatus

// Measures
fo.totalAmount

// Dimensions (auto-expand to $id + $caption)
fo.customer

// Dimension attributes
fo.customer$customerType
fo.customer$province

// Nested dimensions (using . path syntax)
fo.product.category$caption
fo.product.category.group$caption
```

### 5.1 Nested Dimension References

**Syntax rule**: `.` handles dimension path navigation, `$` handles property access — each has a distinct role:

```
fo.product.category$caption
   ├─────────────┘  └──┘
   │  dimension path (.sep)  property ($sep)
```

**Three reference formats**:

```javascript
// Format 1: Full path (precise, no alias needed)
{ ref: fo.product.category$caption }
{ ref: fo.product.category.group$caption }

// Format 2: Alias (recommended, requires alias defined in TM)
{ ref: fo.productCategory$caption }     // alias: 'productCategory'
{ ref: fo.categoryGroup$caption }       // alias: 'categoryGroup'

// Format 3: Underscore format in DSL queries (output column name format)
columns: ["product_category$caption", "product_category_group$caption"]
```

> **Note**: Do NOT use multiple `$` instead of `.` (e.g., ~~`product$category$caption`~~) — the parser treats everything after the first `$` as the property name, causing lookup failure.

**Path syntax explanation**:

- `fo.product` → Level 1 dimension
- `fo.product.category` → Level 2 dimension (sub-dimension of product)
- `fo.product.category$caption` → caption attribute of level 2 dimension
- `fo.product.category$id` → id of level 2 dimension
- `fo.product.category.group$caption` → caption of level 3 dimension

**Output column name format**:

Dots in paths are automatically converted to underscores in output, avoiding JavaScript property name conflicts:

| QM Reference | Output Column Name |
|-------------|-------------------|
| `fo.product$caption` | `product$caption` |
| `fo.product.category$caption` | `product_category$caption` |
| `fo.product.category.group$caption` | `product_category_group$caption` |

---

## 6. Default Sorting (orders)

Define default sorting rules for queries:

```javascript
orders: [
    { name: 'orderTime', order: 'desc' },
    { name: 'orderId', order: 'asc' }
]
```

### 6.1 Sorting Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Sort field name |
| `order` | string | Yes | Sort direction: `asc` (ascending) / `desc` (descending) |

---

## 7. Calculated Fields

You can define calculated fields in QM:

```javascript
columnGroups: [
    {
        caption: 'Calculated Fields',
        items: [
            {
                name: 'profitRate',
                caption: 'Profit Rate',
                formula: 'profitAmount / salesAmount * 100',
                type: 'NUMBER'
            },
            {
                name: 'avgPrice',
                caption: 'Average Price',
                formula: 'totalAmount / totalQuantity',
                type: 'MONEY'
            }
        ]
    }
]
```

### 8.1 Calculated Field Configuration

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Calculated field name |
| `caption` | string | No | Display name |
| `formula` | string | Yes | Calculation formula |
| `type` | string | No | Result data type |

---

## 8. Complete Examples

### 8.1 Basic Query Model

```javascript
// FactOrderQueryModel.qm

const fo = loadTableModel('FactOrderModel');

export const queryModel = {
    name: 'FactOrderQueryModel',
    caption: 'Order Query',
    model: fo,

    columnGroups: [
        {
            caption: 'Order Info',
            items: [
                { ref: fo.orderId },
                { ref: fo.orderStatus },
                { ref: fo.orderTime }
            ]
        },
        {
            caption: 'Customer Info',
            items: [
                { ref: fo.customer },
                { ref: fo.customer$customerType },
                { ref: fo.customer$province }
            ]
        },
        {
            caption: 'Product Info',
            items: [
                { ref: fo.product },
                { ref: fo.product$category },
                { ref: fo.product$unitPrice }
            ]
        },
        {
            caption: 'Measures',
            items: [
                { ref: fo.totalQuantity },
                { ref: fo.totalAmount },
                { ref: fo.profitAmount }
            ]
        }
    ],

    orders: [
        { name: 'orderTime', order: 'desc' }
    ]
};
```

### 8.2 Multi-Fact Table Association

```javascript
// OrderPaymentQueryModel.qm

const order = loadTableModel('FactOrderModel');
const payment = loadTableModel('FactPaymentModel');

export const queryModel = {
    name: 'OrderPaymentQueryModel',
    caption: 'Order Payment Query',

    model: [
        {
            name: order,
            alias: 'order'
        },
        {
            name: payment,
            alias: 'payment',
            onBuilder: () => 'order.order_id = payment.order_id'
        }
    ],

    columnGroups: [
        {
            caption: 'Order Info',
            items: [
                { ref: order.orderId },
                { ref: order.orderStatus },
                { ref: order.totalAmount }
            ]
        },
        {
            caption: 'Payment Info',
            items: [
                { ref: payment.paymentId },
                { ref: payment.paymentMethod },
                { ref: payment.paymentAmount },
                { ref: payment.paymentTime }
            ]
        },
        {
            caption: 'Customer Info',
            items: [
                { ref: order.customer },
                { ref: order.customer$customerType }
            ]
        }
    ],

    orders: [
        { name: 'payment.paymentTime', order: 'desc' }
    ]
};
```

### 8.3 Query Model with Calculated Fields

```javascript
// SalesAnalysisQueryModel.qm

const fs = loadTableModel('FactSalesModel');

export const queryModel = {
    name: 'SalesAnalysisQueryModel',
    caption: 'Sales Analysis',
    model: fs,

    columnGroups: [
        {
            caption: 'Dimensions',
            items: [
                { ref: fs.salesDate$year },
                { ref: fs.salesDate$month },
                { ref: fs.product$category },
                { ref: fs.customer$customerType }
            ]
        },
        {
            caption: 'Base Measures',
            items: [
                { ref: fs.salesQuantity },
                { ref: fs.salesAmount },
                { ref: fs.costAmount },
                { ref: fs.profitAmount }
            ]
        },
        {
            caption: 'Calculated Metrics',
            items: [
                {
                    name: 'profitRate',
                    caption: 'Profit Rate (%)',
                    formula: 'profitAmount / salesAmount * 100',
                    type: 'NUMBER'
                },
                {
                    name: 'avgOrderAmount',
                    caption: 'Average Order Value',
                    formula: 'salesAmount / COUNT(*)',
                    type: 'MONEY'
                }
            ]
        }
    ],

    orders: [
        { name: 'salesDate$year', order: 'desc' },
        { name: 'salesDate$month', order: 'desc' }
    ]
};
```

---

## 9. Pre-defined Query Conditions (conds)

Pre-defined query conditions allow declaring commonly used filter conditions in QM, so clients can use them directly without manually building slices.

### 9.1 Basic Structure

```javascript
export const queryModel = {
    name: 'FactOrderQueryModel',
    model: fo,

    conds: [
        {
            name: 'orderStatus',
            field: 'orderStatus',
            type: 'DICT',
            queryType: '='
        },
        {
            name: 'orderDateRange',
            field: 'orderDate$caption',
            type: 'DATE_RANGE',
            queryType: '[)'
        },
        {
            name: 'customerType',
            field: 'customer$customerType',
            type: 'DIM',
            queryType: '='
        },
        {
            name: 'minAmount',
            field: 'totalAmount',
            type: 'DOUBLE',
            queryType: '>='
        }
    ],

    columnGroups: [...]
};
```

### 9.2 Condition Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Condition name |
| `field` | string | Yes | Corresponding query field |
| `column` | string | No | Corresponding database column name |
| `type` | string | No | Condition type |
| `queryType` | string | No | Default query operator |

### 9.3 Condition Types (type)

| Type | Description | Use Case |
|------|-------------|----------|
| `DICT` | Dictionary type | Fields with dictionary mappings |
| `DIM` | Dimension type | Dimension attribute filtering |
| `BOOL` | Boolean type | Yes/No filtering |
| `DATE_RANGE` | Date range | Date interval filtering |
| `DAY_RANGE` | Day range | Day interval filtering |
| `COMMON` | Common type | Default type |
| `DOUBLE` | Double | Numeric range filtering |
| `INTEGER` | Integer | Integer value filtering |

---

## 10. Window Function Columns

Column items support window function configuration, allowing window calculations to be defined directly in QM:

```javascript
columnGroups: [
    {
        caption: 'Ranking Analysis',
        items: [
            { ref: fo.salesDate },
            { ref: fo.product },
            { ref: fo.salesAmount },
            {
                name: 'salesRank',
                caption: 'Sales Rank',
                formula: 'RANK()',
                partitionBy: ['salesDate$caption'],
                windowOrderBy: [{ field: 'salesAmount', dir: 'desc' }]
            },
            {
                name: 'movingAvg7d',
                caption: '7-Day Moving Average',
                formula: 'AVG(salesAmount)',
                partitionBy: ['product$id'],
                windowOrderBy: [{ field: 'salesDate$caption', dir: 'asc' }],
                windowFrame: 'ROWS BETWEEN 6 PRECEDING AND CURRENT ROW'
            }
        ]
    }
]
```

> Window functions compute independently on each row and do not trigger GROUP BY. See [DSL Query Syntax - Window Functions](./query-dsl.md#_6-3-supported-expressions) for details.

---

## 11. Naming Conventions

### 11.1 File Naming

- QM files: `{TMModelName}QueryModel.qm`
- Example: `FactOrderQueryModel.qm`

### 11.2 Model Naming

- Query model name: `{TMModelName}QueryModel`
- Example: `FactOrderQueryModel`

---

## Next Steps

- [TM Syntax Manual](./tm-syntax.md) - Table model definitions
- [JSON Query DSL](./query-dsl.md) - Complete DSL query syntax (recommended)
- [Parent-Child Dimensions](./parent-child.md) - Hierarchical dimensions
- [Calculated Fields](./calculated-fields.md) - Calculated field details
- [Query API](../api/query-api.md) - HTTP API reference
- [Row-Level Security](../api/authorization.md) - Row-level data isolation
