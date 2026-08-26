# Runtime API 操作

Runtime API 是管理、建模和直接查询的 REST 面。具体请求 schema 以运行实例的 `/api/v1/capabilities` 和当前 bridge 的接口文档为准。

可直接复制的请求见[Runtime API 与 MCP 示例](./runtime-api-examples.md)；已验证与未验证能力的边界见[能力基线与证据矩阵](./capability-matrix.md)。

## 请求上下文

| 上下文 | 用途 |
| --- | --- |
| `X-NS` | 指定 namespace，隔离数据源、Bundle、模型和查询 |
| `X-Foggy-Runtime-Code` | 仅在部署启用 `auth-code` 时用于 Runtime 管理认证 |
| `Authorization` | 数据面可选的 opaque 业务身份；由模型权限逻辑解释，不等于管理 code |
| trace/request id | 关联日志、审计和客户端错误 |

优先显式传递 `X-NS`，不要依赖默认或空 namespace。管理认证和业务身份必须分开保存、分开轮换。

## 典型操作顺序

### 1. 数据源

```text
注册/更新 datasource
  → 连接测试
  → 绑定 namespace
  → 查看 diagnostics
```

相关入口包括：

- `GET/POST /api/v1/datasources`
- `POST /api/v1/datasources/{name}/test`
- `GET /api/v1/datasources/diagnostics`
- `PUT /api/v1/namespaces/{namespace}/datasource`

连接测试通过不代表模型已经可查询；它只证明当前数据源配置可以建立连接。diagnostics 不应返回密码、完整连接串或其他秘密。

新 namespace 通常没有默认 datasource binding。必须在 `models/validate` 前完成 binding；否则会得到 `MODEL_VALIDATE_FAILED`，而不是通过反复 refresh 解决。

### 2. Bundle 与模型

```text
Bundle register/update
  → POST /api/v1/models/validate
  → POST /api/v1/models/refresh
  → GET /api/v1/models
  → POST /api/v1/models/{model}/describe
```

Bundle 注册只登记资源来源，不等于模型已经编译成功。`validate` 返回 candidate 和诊断，不替换当前可查询 catalog；`refresh` 在验证通过后原子发布新的 catalog generation。刷新失败时，已发布 generation 应保持可用。

### 3. 查询与解释

- `POST /api/v1/query/{model}/validate`：只验证 query payload。
- `POST /api/v1/query/{model}/execute`：执行受治理语义查询。
- `POST /api/v1/query/{model}/explain`：返回定义、编译和可选 SQL/物理名证据。
- `POST /api/v1/compose/validate|preview|execute`：处理跨模型或组合式查询。
- `POST /api/v1/tables/list`、`/tables/inspect`：数据源表探查，应归入受控运维面。
- `POST /api/v1/sql/query`：只在明确的管理/内部边界内使用，不把它当成 MCP 普通用户查询接口。

Explain 的重新编译证据不是历史执行的实际 trace。对外报告时要区分“本次重新编译得到的计划/SQL”和“实际执行记录”。

## 变更请求的安全顺序

1. 读取当前 namespace、Bundle、binding generation 和 model catalog generation。
2. 使用 expected revision/generation 完成 validate，保存诊断。
3. 只有验证结果与目标 revision 完全一致时才 refresh/publish。
4. refresh 后重新读取 models/describe，并执行一条最小查询。
5. 记录变更人、namespace、source revision、catalog generation 和结果。

不要通过反复 refresh 来“修复”历史数据或旧运行状态。发现旧状态异常时先做只读诊断，另建 disposable fixture 验证修复方案。

## Authoring 与发布 API

当前 Runtime 还提供 workspace、candidate query、发布、恢复、release package、production promotion 和 rollback 入口，例如：

- `/api/v1/authoring/workspaces`
- `/api/v1/authoring/workspaces/{workspaceId}/validate`
- `/api/v1/authoring/workspaces/{workspaceId}/publish`
- `/api/v1/authoring/workspaces/{workspaceId}/publish/recover`
- `/api/v1/authoring/workspaces/{workspaceId}/release-package`
- `/api/v1/authoring/workspaces/{workspaceId}/promote`
- `/api/v1/authoring/workspaces/{workspaceId}/rollback`

这些接口是管理面。发布前必须拥有 exact current、完整验证通过的 candidate；失败时优先恢复并保留 evidence，不能猜测性覆盖第三方变更。
