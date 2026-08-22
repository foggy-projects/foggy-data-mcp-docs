# Architecture Overview

Foggy MCP Service implements the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) protocol, providing data query capabilities for AI assistants.

The current Java bridge is namespace-aware. Use `X-NS` to select the isolated model/datasource context and discover the actual tool surface with `tools/list`. The preferred routing is `dataset.list_models` → `dataset.describe_model_internal` → `dataset.query_model` or `dataset.compose_script`; `dataset.get_metadata` is retained for compatibility. `dataset.export_with_xchart` is JVM-native, while `dataset.export_with_echarts` uses an optional external render service.

## Overall Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AI Clients                                │
│  (Claude Desktop / Cursor / Custom Agent)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ MCP Protocol (JSON-RPC 2.0)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Foggy MCP Service Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ /mcp/admin   │  │ /mcp/analyst │  │ /mcp/business│          │
│  │  All Tools   │  │ Pro Tools    │  │  NL Query    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                              │                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    MCP Tool Dispatcher                     │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐            │  │
│  │  │ Metadata   │ │ Query Tool │ │ NL Query   │  ...       │  │
│  │  │ Tools      │ │            │ │ Tool       │            │  │
│  │  └────────────┘ └────────────┘ └────────────┘            │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Foggy Dataset Model                            │
│              (TM/QM Model Engine, Semantic Query Layer)          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Database                                  │
│         MySQL / PostgreSQL / SQL Server / SQLite / MongoDB       │
└─────────────────────────────────────────────────────────────────┘
```

## Component Description

### MCP Service Layer

Provides JSON-RPC 2.0 interface, handling AI client requests:

- **Endpoint Management** - Multiple endpoints with different permission levels
- **Tool Registration** - Register and manage available MCP tools
- **Request Routing** - Route requests to corresponding tool handlers

### Tool Dispatcher

Responsible for distributing tool calls:

- **Metadata Tools** - Query model and field information
- **Query Tools** - Execute DSL structured queries
- **NL Query Tools** - Handle natural language queries
- **Chart Tools** - Generate data visualization charts

### Dataset Model Layer

Core semantic layer engine:

- **TM Engine** - Parse and load table models
- **QM Engine** - Parse and load query models
- **Query Builder** - Build SQL queries from DSL
- **Multi-Database Adapter** - Adapt to different databases

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      AI Client Request                           │
│         {"method": "tools/call", "name": "dataset.query"}        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     1. JSON-RPC Parsing                          │
│                  Parse request, validate format                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    2. Permission Check                           │
│            Verify endpoint permissions, check access rights      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    3. Tool Dispatch                              │
│               Route to corresponding tool handler                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    4. DSL Parsing                                │
│          Parse JSON DSL, validate field and model                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    5. SQL Generation                             │
│       TM/QM engine generates SQL, handle auto-JOIN               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    6. Query Execution                            │
│           Execute SQL, return results                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    7. Result Formatting                          │
│           Format results to MCP response format                  │
└─────────────────────────────────────────────────────────────────┘
```

## Security Architecture

### Multi-Layer Defense

```
┌─────────────────────────────────────────────────────────────────┐
│                   Layer 1: Endpoint Permissions                  │
│            Different endpoints provide different tool sets       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Layer 2: Model Access Control                  │
│               QM defines accessible models and fields            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Layer 3: DSL Validation                        │
│            All queries must go through DSL parsing               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Layer 4: Parameterized Queries                 │
│        Use PreparedStatement to prevent SQL injection            │
└─────────────────────────────────────────────────────────────────┘
```

## Request headers and trust boundaries

| Header | Purpose | Required |
| --- | --- | :---: |
| `X-NS` | Select the namespace and isolate models, datasources, and query context | Recommended |
| `Authorization` | Optional opaque business identity passed to policy logic | No |
| `X-Foggy-Runtime-Code` | Runtime management authentication when auth-code is enabled | Deployment-dependent |
| `X-Trace-Id` | Correlate an AI session across tool calls | No |
| `X-Request-Id` | Correlate one HTTP request | No |

Business `Authorization` cannot replace or elevate the management code, and query payloads cannot self-submit column or row policy parameters. Rediscover models after switching `X-NS`.

## Next Steps

- [Tools Overview](../tools/overview.md) - Understand all available tools
- [Claude Desktop Integration](../integration/claude-desktop.md) - Configure Claude Desktop
- [API Usage](../integration/api.md) - Direct API calls
