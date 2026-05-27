# TM 定义参考

本文面向需要编写或审查 Foggy Table Model（TM）的开发者，按定义对象和属性组织当前公开语义建模契约。本文只描述 TM 定义本身；QM 暴露字段和 DSL 查询语法请分别参考 [QM 定义参考](./qm-definition-reference.md) 和 [JSON Query DSL 语法参考](./query-dsl-syntax-reference.md)。

TM 描述物理数据如何进入 Foggy 语义层，包括物理表、字段、维度关系、指标、类型和公式。TM 字段不等于 DSL 可查询字段；字段需要进入当前 QM 的可见字段集合后，才可被查询调用方引用。预聚合属于查询引擎优化能力，本文只保留入口说明，详细能力见 [预聚合能力参考](./pre-aggregation-reference.md)。

## 1. TM 文件结构

TM 文件使用 JavaScript 模块语法，导出 `model` 对象。

```javascript
export const model = {
    name: 'FactSalesModel',
    caption: '销售事实表',
    description: '销售订单明细数据',
    tableName: 'fact_sales',
    idColumn: 'sales_key',

    dimensions: [],
    properties: [],
    measures: []
};
```

### 1.1 model 顶层属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | TM 唯一标识，QM 通过该名称引用 |
| `caption` | string | 否 | 模型显示名称，可作为 AI 元数据 |
| `description` | string | 否 | 模型语义描述，可作为 AI 上下文 |
| `tableName` | string | 是¹ | 物理表名、视图名或集合名 |
| `viewSql` | string | 否¹ | 视图 SQL，与 `tableName` 二选一 |
| `schema` | string | 否 | 数据库 schema |
| `idColumn` | string | 否 | 主键列名 |
| `type` | string | 否 | 模型类型，常见值为 `jdbc`、`mongo`、`vector` |
| `dataSource` | object | 否 | 宿主注入的数据源对象；公开模型通常优先使用 `dataSourceName` |
| `dataSourceName` | string | 否 | 命名数据源引用 |
| `mongoTemplate` | string | 否 | MongoDB 模板或连接配置引用，`type: 'mongo'` 时使用 |
| `vectorConfig` | object | 否 | 向量模型配置，`type: 'vector'` 时使用 |
| `dimensions` | array | 否 | 维度关系定义 |
| `properties` | array | 否 | 非聚合字段定义 |
| `measures` | array | 否 | 可聚合指标定义 |
| `preAggregations` | array | 否 | 预聚合定义，详见 [预聚合能力参考](./pre-aggregation-reference.md) |
| `autoLoadDimensions` | boolean | 否 | 是否自动加载维度 |
| `autoLoadMeasures` | boolean | 否 | 是否自动加载度量 |
| `ai` | object | 否 | 模型级 AI 元数据配置 |
| `deprecated` | boolean | 否 | 是否标记为废弃 |
| `extData` | object | 否 | 自定义扩展元数据 |

¹ `tableName` 和 `viewSql` 通常二选一。

## 2. 维度定义

维度定义事实表与维度表之间的语义关系。引擎根据维度定义生成关联查询，LLM 不需要直接推断 JOIN 路径。

```javascript
dimensions: [
    {
        name: 'customer',
        caption: '客户',
        tableName: 'dim_customer',
        foreignKey: 'customer_key',
        primaryKey: 'customer_key',
        captionColumn: 'customer_name',
        properties: [
            { column: 'customer_type', caption: '客户类型', type: 'STRING' },
            { column: 'province', caption: '省份', type: 'STRING' }
        ]
    }
]
```

### 2.1 dimension 属性

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 维度名，DSL 中通过 `维度名$属性` 引用 |
| `caption` | string | 否 | 显示名称 |
| `description` | string | 否 | 语义描述 |
| `tableName` | string | 是¹ | 维度表名 |
| `viewSql` | string | 否¹ | 维度视图 SQL |
| `schema` | string | 否 | 维度表 schema |
| `dataSource` | object | 否 | 宿主注入的数据源对象；默认继承 TM 数据源 |
| `foreignKey` | string | 是 | 当前表或父维度表上的外键列 |
| `primaryKey` | string | 是 | 维度表主键列 |
| `captionColumn` | string | 否 | `维度名$caption` 对应的显示列 |
| `captionDef` | object | 否 | caption 的公式或方言定义 |
| `keyCaption` | string | 否 | 维度主键显示名称 |
| `keyDescription` | string | 否 | 维度主键描述 |
| `type` | string | 否 | 维度类型，如 `NORMAL`、`DAY`、`DATETIME`、`DICT`、`BOOL`、`DOUBLE`、`INTEGER` |
| `properties` | array | 否 | 维度属性列表 |
| `dimensions` | array | 否 | 嵌套子维度列表 |
| `alias` | string | 否 | 维度别名，用于缩短引用路径 |
| `forceIndex` | string | 否 | 强制索引名称 |
| `dimensionDataSql` | function | 否 | 维度数据权限 SQL 生成函数 |
| `onBuilder` | function | 否 | 自定义关联条件构建函数 |
| `memberPermission` | object | 否 | 维度成员查询权限，见 [2.5](#_2-5-维度成员权限) |
| `ai` | object | 否 | 维度级 AI 元数据配置 |
| `deprecated` | boolean | 否 | 是否废弃 |
| `extData` | object | 否 | 自定义扩展元数据 |

¹ `tableName` 和 `viewSql` 通常二选一。

### 2.2 captionDef

`captionDef` 用于定义 `维度名$caption` 的来源。它适合处理 JSON 翻译字段、跨方言表达式或不能直接用单列表达的显示值。

```javascript
{
    name: 'product',
    tableName: 'product_template',
    foreignKey: 'product_id',
    primaryKey: 'id',
    captionDef: {
        column: 'name',
        dialectFormulaDef: {
            postgresql: {
                builder: (alias) => `${alias}.name ->> 'en_US'`
            }
        },
        formulaDef: {
            builder: (alias) => `${alias}.name`
        }
    }
}
```

优先级为：`captionDef.dialectFormulaDef` > `captionDef.formulaDef` > `captionDef.column` > 外层 `captionColumn`。

### 2.3 嵌套维度引用

嵌套维度使用 `.` 表示建模路径，使用 `$` 表示属性访问。

| 语法 | 说明 |
|------|------|
| `product$caption` | 访问一级维度 `product` 的显示值 |
| `product.category$caption` | 访问 `product -> category` 的显示值 |
| `product.category.group$caption` | 访问三级嵌套维度的显示值 |
| `productCategory$caption` | 使用 TM 中定义的 `alias` 访问维度 |

响应列名中，嵌套维度路径里的 `.` 通常转为 `_`，例如 `product.category$caption` 对应 `product_category$caption`。面向 DSL 调用方时，应以当前 QM 暴露的最终字段名为准。

### 2.4 父子维度属性

父子维度用于组织架构、品类树等层级结构。

父子维度依赖闭包表表达祖先和后代关系。维度主表仍提供成员本身的 `primaryKey`、`captionColumn` 和普通属性；闭包表提供层级关系，供成员查询和 DSL 层级操作使用。

```javascript
{
    name: 'team',
    caption: '团队',
    tableName: 'dim_team',
    foreignKey: 'team_id',
    primaryKey: 'id',
    captionColumn: 'name',
    closureTableName: 'dim_team_closure',
    parentKey: 'ancestor_id',
    childKey: 'descendant_id'
}
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `closureTableName` | string | 是 | 闭包表名称，用于存储祖先和后代关系 |
| `closureTableSchema` | string | 否 | 闭包表 schema；未配置时使用当前维度或数据源默认 schema |
| `parentKey` | string | 是 | 闭包表祖先列，指向维度主表的 `primaryKey` |
| `childKey` | string | 是 | 闭包表后代列，指向维度主表的 `primaryKey` |

父子维度配合 DSL 的 `childrenOf`、`descendantsOf`、`selfAndDescendantsOf` 等操作符使用。是否允许这些层级操作，可以通过 `memberPermission.patch.hierarchyEnabled` 和 `memberPermission.patch.allowedHierarchyOps` 控制。

建模时需要确保闭包表中至少能表达直接父子和自包含关系；如果宿主系统只维护邻接表，需要先由同步任务或数据库作业生成闭包表。

### 2.5 维度成员权限

维度可声明 `memberPermission`，控制 synthetic member-QM 或成员查询时可见的成员字段、强制过滤、排序和层级操作范围。QM 可通过 `memberPermissions[]` 对指定维度做覆盖。

```javascript
{
    name: 'product',
    tableName: 'dim_product',
    foreignKey: 'product_key',
    primaryKey: 'product_key',
    captionColumn: 'product_name',
    properties: [
        { column: 'brand', caption: '品牌' }
    ],
    memberPermission: {
        patch: {
            visibleColumns: ['id', 'caption', 'brand'],
            forcedSlice: [
                { field: 'enabled', op: '=', value: true }
            ],
            forcedOrderBy: [{ field: 'caption', dir: 'ASC' }],
            hierarchyEnabled: true,
            allowedHierarchyOps: ['childrenOf', 'descendantsOf']
        },
        queryBuilder: (context) => {
            context.query.and(context.member.enabled, true);
        }
    }
}
```

## 3. 属性定义

`properties` 描述非聚合字段，通常用于明细字段、枚举字段、状态字段、日期字段等。

```javascript
properties: [
    {
        column: 'order_status',
        caption: '订单状态',
        description: '订单生命周期状态',
        type: 'STRING'
    }
]
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `column` | string | 是 | 物理列名 |
| `name` | string | 否 | 语义字段名，默认由 `column` 转换得到 |
| `alias` | string | 否 | 字段别名 |
| `caption` | string | 否 | 显示名称 |
| `description` | string | 否 | 字段语义描述 |
| `type` | string | 否 | 数据类型 |
| `format` | string | 否 | 格式化模板 |
| `dictRef` | string/object | 否 | 字典引用 |
| `aggregationFormula` | string | 否 | 自定义聚合表达式，供特定聚合场景使用 |
| `formulaDef` | object | 否 | 计算字段定义 |
| `dialectFormulaDef` | object | 否 | 方言专属计算字段定义，优先级高于 `formulaDef` |
| `dimensions` | number | 否 | 向量字段维度，`type: 'VECTOR'` 时使用 |
| `metric` | string | 否 | 向量距离度量，如 `cosine`、`euclidean`、`dotProduct` |
| `semanticScaleFactor` | number/string | 否 | 语义缩放因子，例如物理分转换为语义元 |
| `semanticUnit` | string | 否 | 缩放后的语义单位，如 `yuan` |
| `semanticUnitLabel` | string | 否 | 语义单位显示名，如 `元` |
| `ai` | object | 否 | AI 元数据配置 |
| `deprecated` | boolean | 否 | 是否废弃 |
| `extData` | object | 否 | 自定义扩展元数据 |

## 4. 指标定义

`measures` 描述可聚合字段。`aggregation` 是默认聚合方式，查询时可以在 DSL 中覆盖。

```javascript
measures: [
    {
        column: 'sales_amount',
        caption: '销售金额',
        type: 'MONEY',
        aggregation: 'sum'
    }
]
```

| 属性 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `column` | string | 否¹ | 物理列名 |
| `name` | string | 否 | 指标名，默认由 `column` 转换得到 |
| `alias` | string | 否 | 指标别名 |
| `caption` | string | 否 | 显示名称 |
| `description` | string | 否 | 指标语义描述 |
| `type` | string | 否 | 数据类型 |
| `aggregation` | string | 是 | 默认聚合方式 |
| `formulaDef` | object | 否 | 计算指标定义 |
| `dialectFormulaDef` | object | 否 | 方言专属计算指标定义，优先级高于 `formulaDef` |
| `semanticScaleFactor` | number/string | 否 | 语义缩放因子，例如物理分转换为语义元 |
| `semanticUnit` | string | 否 | 缩放后的语义单位，如 `yuan` |
| `semanticUnitLabel` | string | 否 | 语义单位显示名，如 `元` |
| `ai` | object | 否 | AI 元数据配置 |
| `deprecated` | boolean | 否 | 是否废弃 |
| `extData` | object | 否 | 自定义扩展元数据 |

¹ `count` 类型指标可以不绑定具体 `column`。

### 4.1 聚合方式

| 值 | 说明 |
|----|------|
| `sum` / `SUM` | 求和 |
| `avg` / `AVG` | 平均值 |
| `count` / `COUNT` | 计数 |
| `count_distinct` / `COUNT_DISTINCT` | 去重计数 |
| `max` / `MAX` | 最大值 |
| `min` / `MIN` | 最小值 |
| `GROUP_CONCAT` | 字符串聚合，使用前应验证目标数据库方言 |
| `STDDEV_POP` | 总体标准差 |
| `STDDEV_SAMP` | 样本标准差 |
| `VAR_POP` | 总体方差 |
| `VAR_SAMP` | 样本方差 |
| `none` / `NONE` | 不聚合 |

## 5. 公式与 AI 元数据

### 5.1 formulaDef

`formulaDef` 用于在 TM 中为绑定到物理列的字段或指标提供 SQL 表达式。当前 Java 引擎仍要求 TM property/measure 声明 `column`；如果需要不依赖单个物理列的纯计算输出，应优先在 QM column item 中使用 `formula`。

| 属性 | 类型 | 说明 |
|------|------|------|
| `builder` | function | SQL 构建函数，参数通常为表别名 |
| `value` | string | 公式表达式 |
| `description` | string | 公式说明 |

```javascript
{
    name: 'amountInWan',
    column: 'amount',
    caption: '金额（万元）',
    type: 'MONEY',
    formulaDef: {
        builder: (alias) => `${alias}.amount / 10000`,
        description: '金额单位换算'
    }
}
```

### 5.2 dialectFormulaDef

`dialectFormulaDef` 用于为不同数据库方言提供不同 SQL 构建逻辑。它可用于属性、指标和维度 `captionDef`，优先级高于通用 `formulaDef`。

```javascript
{
    name: 'localizedName',
    column: 'name',
    caption: '本地化名称',
    type: 'STRING',
    dialectFormulaDef: {
        postgresql: {
            builder: (alias) => `${alias}.name ->> 'en_US'`
        },
        mysql: {
            builder: (alias) => `JSON_UNQUOTE(JSON_EXTRACT(${alias}.name, '$.en_US'))`
        }
    },
    formulaDef: {
        builder: (alias) => `${alias}.name`
    }
}
```

### 5.3 semanticScaleFactor

`semanticScaleFactor` 用于声明物理存储单位和语义查询单位之间的比例。例如 ERP 系统把金额以“分”存储，对外分析希望以“元”查询，可以在物理列字段上声明缩放因子。

```javascript
{
    column: 'amount_cent',
    name: 'amount',
    caption: '金额',
    type: 'MONEY',
    aggregation: 'sum',
    semanticScaleFactor: 100,
    semanticUnit: 'yuan',
    semanticUnitLabel: '元'
}
```

该能力适用于直接绑定物理列的 property 或 measure。不要把 `semanticScaleFactor` 与 `formulaDef` / `dialectFormulaDef` 混用；复杂换算应使用公式字段显式建模。

### 5.4 ai

`ai` 用于补充面向 LLM 的字段说明。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `enabled` | boolean | `true` | 是否向 AI 上下文暴露；显式设为 `false` 时不暴露 |
| `prompt` | string | 无 | 供 AI 使用的语义提示；填写后可作为字段说明的补充或替代 |
| `levels` | number[] | `[1]` | 字段可见或推荐等级 |

## 6. 数据类型

| 类型 | 别名 | 说明 | 常见用途 |
|------|------|------|----------|
| `STRING` | - | 短字符串 | 编码、ID、名称 |
| `TEXT` | `VARCHAR`、`CHAR`、`CLOB` | 文本 | 长文本、备注 |
| `INTEGER` | - | 整数 | 计数、枚举 |
| `BIGINT` | `LONG` | 长整数 | 大数值主键 |
| `MONEY` | - | 金额小数 | 金额、价格 |
| `NUMBER` | `DECIMAL`、`NUMERIC`、`DOUBLE`、`FLOAT` | 数值小数 | 比率、数量、通用数值 |
| `DATETIME` | `TIMESTAMP`、`TIME` | 日期时间 | 时间戳 |
| `DAY` | `DATE` | 日期 | yyyy-MM-dd |
| `BOOL` | `Boolean` | 布尔值 | 是/否标志 |
| `DICT` | - | 字典值 | 枚举编码 |
| `VECTOR` | - | 向量 | 语义检索字段 |

`VECTOR`、`mongo`、预聚合等高级能力依赖具体引擎或扩展模块；公开语法中可以建模，但上线前应在目标运行时验证。预聚合的匹配、刷新和运行边界见 [预聚合能力参考](./pre-aggregation-reference.md)。

## 7. 命名规则

| 对象 | 建议命名 | 示例 |
|------|----------|------|
| TM 文件 | `{ModelName}.tm` | `FactSalesModel.tm` |
| TM `name` | PascalCase | `FactSalesModel` |
| 字段 `name` | camelCase | `salesAmount` |
| JDBC `column` | snake_case | `sales_amount` |
| 维度属性引用 | `$` 分隔 | `customer$caption` |
| 嵌套维度建模路径 | `.` 导航 | `product.category$caption` |

JDBC 字段名通常由 `snake_case` 自动转为 `camelCase`，例如 `order_count` 转为 `orderCount`。当 `column` 自动转换后的名称已经符合期望时，可以省略 `name`；只有在 `_id`、缩写列名或需要自定义语义名时再显式声明 `name`。
