# 运维手册

## 启动检查

```bash
curl -fsS http://127.0.0.1:18066/readyz
curl -fsS http://127.0.0.1:18066/api/v1/capabilities
```

记录：版本、feature、`securityMode`、启动时间和部署 identity。`readyz` 通过只代表进程可用，不代表数据源、Bundle 或模型可查询。

## 数据源故障

1. 记录 namespace 和 datasource name，不记录密码。
2. 先读取 diagnostics，再执行单独的 datasource test。
3. 区分网络/DNS、凭据、驱动、权限和 schema 问题。
4. 数据源 binding 改变后重新 validate/refresh 依赖它的模型。
5. 不通过修改历史数据来让连接测试通过。

## 模型不可见或查询失败

按以下顺序排查：

```text
namespace 是否正确
  → Bundle 是否注册且 enabled
  → validate 是否通过
  → refresh 是否成功、generation 是否更新
  → list_models/describe 是否可见
  → query validate 的字段/权限/方言诊断
  → execute 的 trace、数据库和结果边界
```

不要先清理缓存、删除 Bundle 或重写历史资源。先保存只读响应和 generation，再在 disposable fixture 中复现。

## Runtime 错误码速查

错误响应中的 `error.code`、`error.phase` 和诊断类别优先于客户端自己的文字包装。以下是当前 Java Runtime 常见映射：

| 错误码 | 常见 phase | 先做什么 |
| --- | --- | --- |
| `MODEL_VALIDATE_FAILED` | `models.validate` | 先确认 namespace binding、TM/QM 路径和 `MODEL` 诊断；再看 `CASCADING` 级联错误。 |
| `MODEL_REFRESH_FAILED` | `models.refresh` | 保留原 catalog generation，检查 validate 与 source revision 是否一致；不要重复 refresh 碰运气。 |
| `MODEL_NOT_FOUND` | `models.describe` / `query.explain` | 重新执行 `list_models`，确认 namespace、Bundle enabled 和 refresh 状态。 |
| `QUERY_VALIDATE_FAILED` | `query.validate` | 用 describe 返回的闭集字段缩小 payload，检查模型 revision、权限和方言。 |
| `QUERY_EXECUTE_FAILED` | `query.execute` | 保留请求/trace id，区分语义编译、数据库连接、超时和结果边界。 |
| `QUERY_EXPLAIN_FAILED` | `query.explain` | 把 explain 当重新编译证据处理；不要用它替代历史 execution trace。 |
| `SQL_QUERY_FAILED` | `sql.query` | 只在受控只读运维面排查 datasource、SQL 方言和超时；不要绕过语义层。 |
| `BUNDLE_MODEL_NAME_CONFLICT` | `bundles` | 检查 canonical model name 冲突和 Bundle source revision，不能覆盖未知 live 资源。 |

CLI 层的 `2/3/4` 分别表示 Runtime API error、unsupported capability、transport error；它们不能替代响应中的 Runtime `error.code`。

## MCP 工具不可见

- 重新调用 `tools/list`，确认 endpoint、namespace 和客户端 header。
- 确认工具名称是否为当前名称：`dataset.export_with_xchart`、`dataset.export_with_echarts`，而不是旧的 `dataset.export_with_chart`。
- `dataset.list_models` 是首选发现工具；`dataset.get_metadata` 仅作为兼容/迁移入口。
- 如果只是 NL 工具不可见，检查 AI Provider，而不是误判为 Runtime 故障。

## 发布失败

保留 workspace、attempt、revision 和错误证据。只有服务端明确给出可安全恢复的 base，才执行对应 recover；出现 third-party drift 时停止自动修复，进入人工确认。artifact inventory 是只读观察，不执行 cleanup、repair 或 GC。

## 发布后回归

发布完成后重新验证：

1. `GET /api/v1/models` 和目标模型 describe；
2. 一条最小 validate query；
3. 一条最小 execute query；
4. `dataset.list_models` 和 `tools/list`；
5. 目标 namespace 的权限拒绝路径；
6. 日志和审计是否含 trace、revision、generation，且无秘密。

## 记录模板

```text
时间：
环境/实例：
namespace：
Runtime/launcher：
Bundle/source revision：
binding generation：
catalog generation：
request/trace id：
动作与结果：
诊断与后续：
```
