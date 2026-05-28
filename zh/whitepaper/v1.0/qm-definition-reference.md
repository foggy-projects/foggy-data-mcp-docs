# QM 定义参考

本文面向需要编写或审查 Foggy Query Model（QM）的开发者，按定义对象和属性组织当前公开查询模型契约。TM 定义请参考 [TM 定义参考](./tm-definition-reference.md)，运行时查询语法请参考 [JSON Query DSL 语法参考](./query-dsl-syntax-reference.md)。

QM 是面向 LLM、应用和工具协议的查询契约。它基于一个或多个 TM，选择对外暴露的字段，定义计算字段、默认排序和治理规则。DSL 查询只能引用当前 QM 暴露的语义字段，而不是任意 TM 字段或数据库物理列。

## 1. QM 文件结构

QM 文件导出 `queryModel` 对象。

```javascript
const fs = loadTableModel('FactSalesModel');

export const queryModel = {
    name: 'SalesAnalysisQueryModel',
    caption: '销售分析',
    model: fs,

    columnGroups: [],
    orders: [],
    accesses: []
};
```

### 1.1 queryModel 顶层属性

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | 是 | 无 | QM 唯一标识 |
| `caption` | string | 否 | 无 | 显示名称 |
| `description` | string | 否 | 无 | 查询模型语义描述 |
| `model` | object | 是 | 无 | 关联的主 TM，通常为 `loadTableModel` 返回值 |
| `joins` | array | 否 | 无 | 多模型 QM 的显式关联定义 |
| `loader` | string | 否 | `v1` | 加载器版本；未配置或配置为 `v1` 时使用原有加载逻辑，`v2` 支持 `TableModelProxy` 和 `ColumnRef` |
| `dataSource` | object | 否 | 无 | 宿主注入的数据源对象；公开模型通常使用 TM 的 `dataSourceName` |
| `columnGroups` | array | 否 | 无 | 查询字段分组 |
| `orders` | array | 否 | 无 | 默认排序 |
| `accesses` | array | 否 | 无 | 行级权限或查询增强规则 |
| `memberPermissions` | array | 否 | 无 | 覆盖 TM 维度成员权限 |
| `ai` | object | 否 | 无 | 查询模型级 AI 元数据配置 |
| `deprecated` | boolean | 否 | `false` | 是否废弃 |
| `extData` | object | 否 | 无 | 自定义扩展元数据 |

## 2. 模型绑定

### 2.1 单模型绑定

```javascript
const fo = loadTableModel('FactOrderModel');

export const queryModel = {
    name: 'FactOrderQueryModel',
    model: fo,
    columnGroups: []
};
```

### 2.2 多模型绑定

```javascript
const fo = loadTableModel('FactOrderModel');
const fp = loadTableModel('FactPaymentModel');

export const queryModel = {
    name: 'OrderPaymentQueryModel',
    model: fo,
    joins: [
        fo.leftJoin(fp).on(fo.orderId, fp.orderId)
    ],
    columnGroups: []
};
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `model` | object | 是 | 主 TM 的 `loadTableModel` 返回值 |
| `joins` | array | 否 | 由 `leftJoin` / `innerJoin` / `rightJoin` 等构造的关联定义 |
| `on` | function | 是 | 指定关联字段，可链式追加 `.and(...)` |

`joins` 是当前推荐的多模型 QM 写法。`onBuilder` 仍可作为 TM dimension 的高级自定义关联条件使用，但不建议作为新 QM 多模型绑定的主要示例。

## 3. 列组与列项

`columnGroups` 决定 QM 对外暴露的查询字段。只有进入 `columnGroups.items` 并通过治理规则的字段，才应被视为 DSL 可引用字段。

```javascript
columnGroups: [
    {
        caption: '指标',
        items: [
            { ref: fs.salesAmount },
            {
                name: 'profitRate',
                caption: '利润率(%)',
                formula: 'profitAmount / salesAmount * 100',
                type: 'NUMBER'
            }
        ]
    }
]
```

### 3.1 columnGroup 属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `caption` | string | 否 | 列组显示名称 |
| `items` | array | 是 | 列项列表 |

### 3.2 column item 属性

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `ref` | object/string | 否¹ | 无 | TM 字段引用，推荐使用 `loadTableModel` 返回的字段引用 |
| `name` | string | 否¹ | 普通字段可由 `ref` 派生 | 输出字段名或计算字段名；计算字段通常需要显式提供 |
| `caption` | string | 否 | 无 | 覆盖显示名称 |
| `description` | string | 否 | 无 | 字段说明 |
| `alias` | string | 否 | 可由 `ref` 派生 | 输出别名；未配置时通常使用 `ref` 的字段名 |
| `formula` | string | 否 | 无 | QM 计算字段公式 |
| `type` | string | 否 | 无 | 计算字段返回类型 |
| `partitionBy` | string[] | 否 | 无 | `formula` 计算字段的窗口函数分区字段 |
| `windowOrderBy` | object[] | 否 | 无 | `formula` 计算字段的窗口函数排序字段 |
| `windowFrame` | string | 否 | 无 | `formula` 计算字段的窗口帧定义 |
| `emptyDefault` | any | 否 | 无 | 计算字段为空时的默认值，常用于 `COALESCE` |
| `ai` | object | 否 | 无 | AI 元数据配置 |

¹ 普通字段通常使用 `ref`；计算字段通常使用 `name + formula`。

`partitionBy`、`windowOrderBy` 和 `windowFrame` 只用于带 `formula` 的 QM 计算字段。加载时这类列项会被转换为计算字段，执行时引擎先编译 `formula` 表达式，再按这些配置追加 `OVER (PARTITION BY ... ORDER BY ... frame)` 窗口子句。普通 `ref` 字段不会因为声明这些属性而变成窗口字段。

窗口配置引用的字段必须能被当前 QM 解析。`windowOrderBy.dir` 未配置时按升序处理；`windowFrame` 当前按 SQL frame 字符串透传给查询引擎。后续版本可以考虑把窗口配置作为 formula 能力的一部分统一包装，而不是作为 column item 的独立属性长期暴露。

## 4. 字段引用

QM 中通常通过 `loadTableModel` 的代理对象引用字段。

| 引用 | 说明 |
|------|------|
| `fs.orderId` | TM 属性 |
| `fs.salesAmount` | TM 指标 |
| `fs.customer` | 维度引用，通常展开为 `$id`、`$caption`、维度属性和嵌套维度；显式列会避免重复输出 |
| `fs.customer$caption` | 维度显示值 |
| `fs.customer$customerType` | 维度属性 |
| `fs.product.category$caption` | 嵌套维度属性 |

响应列名中，嵌套维度路径里的 `.` 通常转为 `_`：

| QM 引用 | 响应列名 |
|---------|----------|
| `fs.product$caption` | `product$caption` |
| `fs.product.category$caption` | `product_category$caption` |
| `fs.product.category.group$caption` | `product_category_group$caption` |

DSL 请求应使用当前 QM 暴露的最终字段名。例如当前 QM 暴露 `product_category$caption` 时，DSL 中应引用 `product_category$caption`，而不是物理列名或未暴露的 TM 内部路径。

## 5. 默认排序

### 5.1 orders

```javascript
orders: [
    { name: 'salesDate$caption', order: 'desc', nullLast: true }
]
```

| 属性 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `name` | string | 否¹ | 无 | 排序字段名 |
| `ref` | object/string | 否¹ | 无 | 排序字段引用，支持 `loadTableModel` 字段引用或字符串 |
| `order` | string | 是 | 无 | `asc` 或 `desc` |
| `nullLast` | boolean | 否 | `false` | 空值排在最后 |
| `nullFirst` | boolean | 否 | `false` | 空值排在最前 |

¹ `name` 和 `ref` 至少提供一个；同时提供时以 `ref` 为准。

## 6. 权限与治理属性

语义层治理分为 QM 文件内声明和宿主运行时注入两类。QM 文件负责声明静态模型契约；用户、公司、物理列黑名单等上下文通常由宿主系统在调用查询时注入。

### 6.1 accesses

QM 的 `accesses` 用于在查询构建阶段注入治理规则，例如行级过滤、租户边界或业务范围限制。

```javascript
accesses: [
    {
        queryBuilder: (context) => {
            const query = context.query;
            query.and(fs.companyId, context.securityContext?.companyId);
        }
    }
]
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `dimension` | string | 维度名，用于声明维度级访问规则 |
| `property` | string | 属性名，用于声明属性级访问规则 |
| `dimensionDataSql` | function | 维度数据权限 SQL 生成函数 |
| `queryBuilder` | function | 接收 `context`，在查询构建阶段注入条件 |
| `context.query` | object | 查询构建器 |
| `context.securityContext` | object | 安全上下文 |
| `context.request` | object | 原始查询请求 |

权限规则在引擎侧执行，不依赖 LLM 自行遵守提示词。

### 6.2 运行时治理参数

运行时治理参数通常不直接写入 `.tm` 或 `.qm` 文件，而是由 MCP 服务、应用 API、Odoo Bridge 等宿主在查询请求上下文中注入。

| 参数 | 说明 |
|------|------|
| `fieldAccess` | QM 字段白名单；为空列表表示无字段可见，`null` 表示不启用字段白名单 |
| `deniedColumns` | 物理列黑名单，用于阻止查询访问指定表列 |
| `systemSlice` | 系统强制过滤条件，如公司、租户、组织范围 |
| `securityContext` | 当前用户、公司、角色等宿主安全上下文 |

LLM 不应自行构造或覆盖这些安全参数。Compose Script 和 DSL 查询应使用宿主暴露的受限 API，由引擎合并治理上下文并生成最终查询。

### 6.3 memberPermissions

QM 可通过 `memberPermissions[]` 覆盖 TM 维度上的 `memberPermission`，用于某个查询模型需要更窄的成员可见范围时使用。

```javascript
memberPermissions: [
    {
        dimension: 'product',
        patch: {
            visibleColumns: ['id', 'caption'],
            forcedSlice: [
                { field: 'enabled', op: '=', value: true }
            ]
        }
    }
]
```

| 属性 | 类型 | 说明 |
|------|------|------|
| `dimension` | string | 被覆盖的 TM 维度名 |
| `patch` | object | 静态成员权限补丁 |
| `queryBuilder` | function | 动态成员权限构建函数 |

`patch.visibleColumns` 控制成员查询返回字段；`patch.forcedSlice` 注入强制过滤；`patch.forcedOrderBy` 注入强制排序；`patch.hierarchyEnabled` 和 `patch.allowedHierarchyOps` 控制层级成员操作范围。QM 中的成员权限用于覆盖或收窄 TM 维度上的默认成员权限。

## 7. 命名规则

| 对象 | 建议命名 | 示例 |
|------|----------|------|
| QM 文件 | `{QueryModelName}.qm` | `SalesAnalysisQueryModel.qm` |
| QM `name` | PascalCase | `SalesAnalysisQueryModel` |
| 字段 `name` | camelCase | `salesAmount` |
| 维度属性引用 | `$` 分隔 | `customer$caption` |
| 嵌套维度响应字段 | `_` 连接路径段 | `product_category$caption` |

## 8. 与 DSL 的关系

QM 定义字段集合和治理边界；JSON Query DSL 在运行时引用这些字段。

| QM 暴露字段 | DSL 引用 |
|------------|----------|
| TM property `order_id -> orderId` | `"orderId"` |
| TM measure `sales_amount -> salesAmount` | `"salesAmount"` |
| dimension `customer.captionColumn` | `"customer$caption"` |
| dimension property `customer_type` | `"customer$customerType"` |
| QM calculated field `profitRate` | `"profitRate"` |

查询 DSL 语法见 [JSON Query DSL 语法参考](./query-dsl-syntax-reference.md)。
