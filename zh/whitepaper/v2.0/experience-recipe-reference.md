# Experience Recipe 能力参考

> 版本口径：v2.0
>
> 状态：已签收
>
> 实现范围：Java/MCP minimum

Experience Recipe 是可治理的经验方案资产。它把已经签收的分析方案、必要参数、证据和治理条件沉淀下来，让 router / planner 在合适上下文中复用，而不是每次都重新发明复杂计划。

## 定位

Experience Recipe 适合：

- 高频复杂分析流程复用。
- 记录签收模型、字段、route、参数和边界。
- 在 namespace、tenant、permission、owner 条件满足时进行发现。
- 对缺参、冲突、未激活或权限不匹配场景保持可审计拒绝。

Recipe 不能绕过 TM/QM、权限、validator 或 signed contract。

## 已签能力

| 能力 | 说明 |
|---|---|
| exact registry lookup | `registryKey` 精确解析 |
| discoverable gate | 只从 validated 且 activeForDiscovery 的记录选择 |
| governance filter | namespace、tenant、permission、owner 过滤 |
| lifecycle gate | draft / candidate / rejected / deprecated 不进入运行时路由 |
| publish gate | 发布门要求状态和证据满足条件 |
| artifact refs | evidence artifact refs 可记录和回显 |
| hash / URI validation | artifact hash 格式和 URI 形态校验 |
| signature verifier SPI | strict 模式下缺 verifier 或 invalid signature fail closed |
| governance context injection | MCP 请求上下文可进入治理链路 |

## Runtime Lookup 语义

`dataset.search_experience_recipes` 的 `registryKey` exact lookup 仍然执行治理过滤：

- registry key 必须匹配。
- recipe 必须 validated。
- recipe 必须 active for discovery。
- namespace 必须匹配。
- tenant 必须匹配。
- permission tags 必须满足。
- owner delegation 必须满足。

精确 key 不会绕过权限，也不会让 draft、candidate、rejected 或 deprecated recipe 被返回。

## Evidence Artifact

v2.0 记录的是 artifact reference 和基础校验，不等于完整对象存储可信链路。

可记录：

- artifact refs。
- artifact hash 格式。
- URI 形态。
- publish response 回显。
- event audit。
- signature verifier SPI 结果。

不承诺：

- 真实 S3/OSS native resolver。
- 远端对象权限。
- KMS / 信任根。
- 密钥轮换或撤销。
- 完整管理后台。

## Fail-closed 规则

以下情况应返回空结果或阻断发布：

- registry key 不匹配。
- recipe 未 validated。
- recipe 未 activeForDiscovery。
- namespace / tenant / permission / owner 不匹配。
- publish 缺少必需 evidence artifacts。
- strict signature 模式下缺 verifier。
- verifier 返回 invalid signature。

## 不纳入 v2.0

Experience Recipe v2.0 不承诺：

- 完整 recipe 市场。
- 向量检索、全文检索或混合检索。
- recipe ranking。
- 产品管理台。
- 人工审核 UI。
- recipe 对引擎 validator 的绕过能力。

## 与 LLM Planner 的关系

Recipe 可以给 planner 提供结构化经验，但 planner 仍必须输出受治理 plan。命中 recipe 后仍要经过模型、权限、字段、规模和 signed contract 校验。

