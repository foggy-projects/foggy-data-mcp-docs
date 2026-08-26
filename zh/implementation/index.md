---
title: Foggy 实施手册
last_reviewed: 2026-08-22
status: working-manual
---

# Foggy 实施手册

本手册面向负责部署、建模、接入 MCP 客户端和维护运行时的工程团队。它描述当前 Java Runtime 的实施路径，不替代已经冻结的 v1.0/v2.0 白皮书语义契约。

> 当前基线：`foggy-runtime-launcher v0.1.17`、Java 17+、已发布框架版本 `9.2.0`。Launcher 默认是本地开发/测试发行物，生产环境必须另行完成认证、网络、数据源和密钥治理。

## 推荐交付顺序

| 阶段 | 必须完成 | 主要证据 |
| --- | --- | --- |
| 运行时 | 启动、`readyz`、能力探测 | `/readyz`、`/api/v1/capabilities` |
| 数据源 | 注册、连接测试、namespace 绑定 | datasource diagnostics、test 结果 |
| 语义层 | Bundle 注册、模型验证、刷新 | validate/refresh 响应与 generation |
| MCP | 配置 endpoint、`X-NS`、工具发现 | `tools/list`、一次受治理查询 |
| 上线 | 管理认证、业务身份、审计、故障恢复 | 生产检查单和演练记录 |

## 手册导航

- [运行时快速部署](./quick-start.md)：用 Launcher 或源码启动并完成第一次探测。
- [能力基线与证据矩阵](./capability-matrix.md)：区分已验证、条件、未执行和已禁用能力。
- [Runtime API 操作](./runtime-api.md)：数据源、Bundle、模型、查询和 Compose 的操作顺序。
- [Runtime API 与 MCP 示例](./runtime-api-examples.md)：可复制的 curl、CLI 和 JSON-RPC 验收请求。
- [MCP 工具与查询路由](./mcp-operations.md)：工具发现、单模型/跨模型路由和证据解释。
- [模型与 Bundle 生命周期](./model-lifecycle.md)：注册、验证、刷新、authoring、发布与恢复。
- [安全与治理](./security-governance.md)：namespace、管理认证、业务 Authorization 和脚本边界。
- [运维手册](./operations-runbook.md)：启动检查、诊断、变更记录和失败处置。

## 文档状态约定

- `stable`：已发布并冻结的公开契约，只做错误、链接、术语和风险口径修订。
- `working-manual`：实施手册，随当前 Java Runtime 的可验证能力更新。
- `DRAFT / NOT FROZEN`：3.0 白皮书草案，等待产品/架构负责人确认；不构成兼容承诺。

3.0 白皮书目前明确保持 `DRAFT / NOT FROZEN`。在确认前，实施团队应以 Runtime 的能力探测、接口 schema 和实际验证结果为准，不应把草案内容当作稳定版本要求。
