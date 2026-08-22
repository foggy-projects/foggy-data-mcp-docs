# Tools Overview

Foggy MCP provides a series of data query and analysis tools for AI assistants to call.

## Tool List

| Tool | Description | Category |
|------|-------------|----------|
| [`dataset.list_models`](./metadata.md#list_models) | Preferred model discovery and routing overview | Metadata |
| [`dataset.describe_model_internal`](./metadata.md#describe_model_internal) | Get model field details | Metadata |
| [`dataset.query_model`](./query.md) | Execute structured query, timeWindow, and pivot | Query |
| [`dataset.compose_script`](./query.md) | Execute governed Compose/cross-model query | Query |
| [`dataset.explain_query`](./query.md) | Return query definition, recompilation, and evidence | Explain |
| [`dataset_nl.query`](./nl-query.md) | Natural language data query | Natural Language |
| `chart.generate` | Generate data charts | Visualization |
| `dataset.export_with_xchart` | Export with JVM-native XChart | Export |
| `dataset.export_with_echarts` | Export with an ECharts render service | Export |
| `dataset.get_metadata` | Legacy metadata entry point | Compatibility |

## Tool Categories

### Metadata Tools

Used to get meta-information about semantic layer models and fields:

- **list_models** - Preferred model list and routing overview
- **describe_model_internal** - Get detailed field definitions of a single model

`dataset.get_metadata` remains for compatibility and migration; new integrations should not use it as the first step.

Suitable for understanding data structure before querying.

### Query Tools

Used to execute structured data queries:

- **query_model** - Supports filtering, sorting, grouping, aggregation, calculated fields, `timeWindow`, and `pivot`
- **compose_script** - Use for cross-model Join/Union, derived, or multi-stage composition
- **explain_query** - Return definition, recompilation, and optional SQL/physical-name evidence; recompilation is not a historical execution trace

Requires understanding of semantic layer models and query syntax, provides precise query control.

### Natural Language Tools

Used for intelligent data queries:

- **dataset_nl.query** - Describe query requirements in natural language

No technical knowledge needed, suitable for regular business users.

### Visualization Tools

Used to generate charts:

- **chart.generate** - Generate trend charts, bar charts, pie charts based on data

### Export Tools

Used to export data:

- **export_with_xchart** - JVM-native export with no external render service
- **export_with_echarts** - ECharts export through an external render service

## Role Permissions

Different endpoints provide different tool sets:

### Permission Matrix

| Tool | Admin | Analyst | Business |
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

### Endpoint Description

| Endpoint | Role | Tool Scope |
|----------|------|------------|
| `/mcp/admin/rpc` | Admin | All tools |
| `/mcp/analyst/rpc` | Analyst | Metadata + Query + Visualization |
| `/mcp/business/rpc` | Business User | Natural language only |

## Typical Workflows

### Analyst Workflow

```
1. list_models            → Get model routing overview
2. describe_model_internal → View model field details
3. query_model / compose_script → Execute single-model or composed query
4. explain_query          → Inspect recompilation evidence (optional)
5. chart.generate / export → Generate chart or export (optional)
```

### Business User Workflow

```
1. dataset_nl.query      → Describe requirements in natural language, done in one step
```

## Tool Call Examples

### MCP Protocol Call

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

Treat `tools/list` on the running endpoint as the source of truth; the visible tool set can vary by namespace, endpoint, and tool policy. `dataset.get_metadata` is retained only for compatibility migration and must not be a new client's first call.

### Response Format

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

## Error Handling

Tool calls may return the following errors:

| Error Code | Description |
|------------|-------------|
| `-32600` | Invalid request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |

### Error Response Example

```json
{
  "jsonrpc": "2.0",
  "id": "1",
  "error": {
    "code": -32602,
    "message": "Missing required parameter: model"
  }
}
```

## Performance Tips

1. **Discover models first**: Use `list_models`, then `describe_model_internal` when field details are needed
2. **Use pagination**: Use `start` and `limit` parameters for large data queries
3. **Add filter conditions**: Avoid full table scans, use `slice` to filter data
4. **Select necessary fields**: Only query needed `columns` to reduce data transfer
5. **Use the right advanced mode**: Use `timeWindow` for YoY/MoM/rolling analysis and `pivot` for cross-tabs; do not combine them in one request

## Next Steps

- [Metadata Tools](./metadata.md) - Get model and field information
- [Query Tools](./query.md) - Execute structured queries
- [Natural Language Query](./nl-query.md) - Intelligent data queries
- [Extensions](./extensions.md) - Data Viewer and optional extensions
