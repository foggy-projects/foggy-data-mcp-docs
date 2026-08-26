# 安全与治理

## 认证上下文分离

| 上下文 | 作用 | 不能做什么 |
| --- | --- | --- |
| `X-Foggy-Runtime-Code` | Runtime 管理面认证 | 不自动代表业务用户 |
| `Authorization` | 可选业务 opaque token | 不能提交或提升权限策略 |
| `X-NS` | namespace 隔离 | 不能绕过模型/数据源授权 |

管理 code 与业务 Authorization 必须分开存储、传递、轮换和审计。模型权限逻辑可以选择把 Authorization 解释为用户、租户或部门身份，但 Runtime 不假定 token 格式。

## Launcher 与生产边界

默认 `none-dev-test-only` 只适用于本地验证。生产至少完成：

- 管理 API 的 auth-code 或等效强认证；
- MCP endpoint 的网络边界和客户端身份校验；
- 数据源凭据使用 secret 管理，不进入日志、MCP 配置和错误响应；
- namespace 与业务租户的映射；
- 结构化审计：主体、namespace、模型、字段、revision、trace 和结果状态；
- SQL、FSScript、表探查和 Compose 等高风险入口的最小暴露；
- 备份、发布恢复和密钥轮换演练。

## 语义查询边界

普通 MCP 查询应使用模型感知 DSL。调用方不能通过请求体提交 `fieldAccess`、`deniedColumns`、`systemSlice` 或 `policySnapshotId` 等内部治理字段，也不能用原始 SQL 替代模型权限。

FSScript 模型代码属于受信发布内容，可以使用宿主提供的扩展能力；因此模型发布本身必须受管理权限、代码审查和审计保护。原始 FSScript execute 不是普通数据查询入口，应归入管理/作者面。

## 动态工具策略

namespace 可以配置可选的 `tools.config.js` 对工具进行筛选。它是工具暴露层的路由控制，不应被当作唯一安全边界：模型权限、Runtime 管理认证、网络隔离和审计仍必须独立生效。策略缺失或策略解析异常时的行为应以当前 bridge 版本和能力探测为准，生产配置不得依赖“隐藏工具名”实现授权。

## 图表与导出

- XChart 是 JVM 内生成路径，仍需遵守查询字段和行权限。
- ECharts 外部渲染服务是独立组件，必须限制网络、输入大小、超时和资源消耗。
- 导出结果按业务数据处理，不能因为“只是图表”而跳过审计和脱敏。

## 安全验证清单

1. 无管理 code 的 mutation 请求被拒绝（若实例启用 auth-code）。
2. 不同 namespace 的模型、数据源和缓存不能互相可见。
3. 业务 Authorization 不会被管理 code 替换或隐式升级。
4. 未声明 AI Provider 时，结构化工具仍可用，NL 工具不会伪装成已启用。
5. 权限解析失败时受保护模型 fail closed，并留下可关联审计证据。
6. 错误和 diagnostics 不包含密码、完整 token、绝对路径或底层秘密。

