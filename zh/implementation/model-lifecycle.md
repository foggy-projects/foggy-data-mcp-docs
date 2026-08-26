# 模型与 Bundle 生命周期

## 运行时身份

模型不应只用模型名识别。排查和缓存至少记录：

- namespace；
- 数据源 identity 与 binding generation；
- Bundle/resource revision；
- model catalog generation；
- backend provider identity。

遗漏这些维度会产生跨 namespace 串读或过期模型问题。

## Bundle 生命周期

```text
资源注册/更新
  → canonical name 冲突检查
  → persist registry
  → explicit validate
  → explicit refresh
  → atomic catalog generation
```

注册不等于可查询。TM/QM/FSScript 解析或 admission 失败时，变更应被拒绝；不能先部分写入再靠后台修复。

## Validate 与 Refresh

| 动作 | 作用 | 是否替换当前 catalog |
| --- | --- | :---: |
| validate | 构造 candidate、解析资源、返回结构/语义诊断 | 否 |
| refresh | 重新构造并 admission candidate，原子发布 generation | 是，成功时 |

刷新失败时，原已发布 generation 保持可用。成功刷新后要确认 namespace、source revision、binding generation 和 catalog generation 一致。

## Authoring workspace

Authoring workspace 用于在不直接修改 live catalog 的情况下保存草稿、diff、完整验证和受治理 candidate query。实施时遵循：

1. 一个 workspace 固定 namespace 和一个 enabled Runtime-managed external Bundle。
2. save/delete 需要 expected head，并以 revision/hash 标识内容。
3. 内容变化会使之前的 validation evidence 失效；源 Bundle 或 namespace revision 漂移时进入 `STALE`。
4. candidate query 只接受 exact current、完整验证通过的 revision。
5. candidate 不使用共享 L1/L2 cache、pre-aggregation 或 hybrid query，也不发布 live catalog。

## Publish、Promotion 与 Recovery

开发发布必须从 exact validated candidate 开始，形成 immutable artifact，再切换 Bundle source、registry 和 full-Namespace refresh。任何一步无法证明恢复到 exact base 时，保留 evidence 并进入 `RECOVERY_REQUIRED`，不自动覆盖未知的 live 变化。

生产 promotion 需要显式开启，且 imported release package 必须在目标环境重新 validate；开发环境的验证结果不能直接继承为生产数据源和权限的验证结果。rollback 只接受同一 package/candidate/apply attempt 且 live identity 未发生第三方漂移的情况。

## 变更证据

每次模型变更至少保存：

- namespace、Bundle 名称和 source/revision identity；
- validate 结果、错误诊断和验证时间；
- refresh/publish 的 catalog generation；
- 发布人、管理认证审计和关联 trace id；
- 失败时的恢复状态与 `safeToAutoRepair` 判断。

历史 artifact inventory 是只读诊断，不等于 retention 或删除授权。不要把“不可达”报告自动转成清理动作。

