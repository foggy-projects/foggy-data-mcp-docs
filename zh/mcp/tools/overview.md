# 工具概述

Foggy MCP 提供一系列数据查询和分析工具，供 AI 助手调用。

## 工具列表

| 工具 | 说明 | 分类 |
|------|------|------|
| [`dataset.list_models`](./metadata.md#list_models) | 首选模型发现和路由概览 | 元数据 |
| [`dataset.describe_model_internal`](./metadata.md#describe_model_internal) | 获取模型详细字段信息 | 元数据 |
| [`dataset.query_model`](./query.md) | 执行结构化数据查询 | 查询 |
| [`dataset.compose_script`](./query.md) | 执行 Compose/跨模型受治理查询 | 查询 |
| [`dataset.explain_query`](./query.md) | 获取查询定义、重编译和证据解释 | 解释 |
| [`dataset_nl.query`](./nl-query.md) | 自然语言数据查询 | 自然语言 |
| `chart.generate` | 生成数据图表 | 可视化 |
| `dataset.export_with_xchart` | 使用 JVM 原生 XChart 导出 | 导出 |
| `dataset.export_with_echarts` | 使用 ECharts 渲染服务导出 | 导出 |
| `dataset.get_metadata` | 兼容旧版本的元数据入口 | 兼容 |

## 工具分类

### 元数据工具

用于获取语义层模型和字段的元信息：

- **list_models** - 首选的模型列表和路由概览
- **describe_model_internal** - 获取单个模型的详细字段定义

`dataset.get_metadata` 保留用于兼容和迁移，新集成不要再把它作为第一步。

适合在查询前了解数据结构。

### 查询工具

用于执行结构化数据查询：

- **query_model** - 支持复杂过滤、排序、分组、聚合
- **compose_script** - 用于跨模型 Join/Union、derived 或多阶段组合查询
- **explain_query** - 返回定义、重新编译和可选 SQL/物理名证据；重新编译证据不是历史执行 trace

需要了解语义层模型和查询语法，提供精确的查询控制。

### 自然语言工具

用于智能数据查询：

- **dataset_nl.query** - 用自然语言描述查询需求

无需了解技术细节，适合普通业务用户。

### 可视化工具

用于生成图表：

- **chart.generate** - 根据数据生成趋势图、柱状图、饼图等

### 导出工具

用于导出数据：

- **export_with_xchart** - 使用 JVM 原生 XChart 导出，不要求外部渲染服务
- **export_with_echarts** - 使用 ECharts 导出，需要外部渲染服务

## 角色权限

不同端点提供不同的工具集：

### 权限矩阵

| 工具 | Admin | Analyst | Business |
|------|:-----:|:-------:|:--------:|
| `dataset.list_models` | ✅ | ✅ | ❌ |
| `dataset.describe_model_internal` | ✅ | ✅ | ❌ |
| `dataset.query_model` | ✅ | ✅ | ❌ |
| `dataset.compose_script` | ✅ | ✅ | ❌ |
| `dataset.explain_query` | ✅ | ✅ | ❌ |
| `chart.generate` | ✅ | ✅ | ❌ |
| `dataset.export_with_xchart` | ✅ | ✅ | ❌ |
| `dataset.export_with_echarts` | ✅ | ✅ | ❌ |
| `dataset_nl.query` | ✅ | ❌ | ✅ |

### 端点说明

| 端点 | 角色 | 工具范围 |
|------|------|----------|
| `/mcp/admin/rpc` | 管理员 | 全部工具 |
| `/mcp/analyst/rpc` | 分析师 | 元数据 + 查询 + 可视化 |
| `/mcp/business/rpc` | 业务用户 | 仅自然语言 |

## 典型工作流

### 分析师工作流

```
1. list_models            → 获取模型路由概览
2. describe_model_internal → 查看模型字段详情
3. query_model / compose_script → 执行单模型或组合查询
4. explain_query          → 查看重新编译证据（可选）
5. chart.generate / export → 生成图表或导出（可选）
```

### 业务用户工作流

```
1. dataset_nl.query      → 自然语言描述需求，一步完成
```

## 工具调用示例

### MCP 协议调用

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "method": "tools/call",
  "params": {
    "name": "dataset.list_models",
    "arguments": {}
  }
}
```

以运行实例的 `tools/list` 为准；namespace、endpoint 或工具策略不同，实际可见工具可能不同。`dataset.get_metadata` 仅保留作兼容迁移，不应作为新客户端的首轮调用。

### 响应格式

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{...}"
      }
    ]
  }
}
```

## 错误处理

工具调用可能返回以下错误：

| 错误码 | 说明 |
|--------|------|
| `-32600` | 无效请求 |
| `-32601` | 方法不存在 |
| `-32602` | 无效参数 |
| `-32603` | 内部错误 |

### 错误响应示例

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "error": {
    "code": -32602,
    "message": "缺少必要参数: model"
  }
}
```

## 性能建议

1. **先发现模型**：查询前使用 `list_models`，需要字段详情时再使用 `describe_model_internal`
2. **使用分页**：大数据量查询时使用 `start` 和 `limit` 参数
3. **添加过滤条件**：避免全表扫描，使用 `slice` 过滤数据
4. **选择必要字段**：只查询需要的 `columns`，减少数据传输

## 下一步

- [元数据工具](./metadata.md) - 获取模型和字段信息
- [查询工具](./query.md) - 执行结构化查询
- [自然语言查询](./nl-query.md) - 智能数据查询
- [扩展工具](./extensions.md) - Data Viewer 等可选扩展
