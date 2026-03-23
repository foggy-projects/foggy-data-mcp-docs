---
layout: home
hero:
  name: Foggy Data MCP
  text: AI 原生语义层框架
  tagline: 让 AI 助手通过 MCP 协议安全、准确地查询业务数据 —— 无需暴露数据库结构
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/mcp/guide/quick-start
    - theme: alt
      text: JSON Query DSL
      link: /zh/dataset-model/tm-qm/query-dsl
    - theme: alt
      text: GitHub
      link: https://github.com/foggy-projects/foggy-data-mcp-bridge

features:
  - icon: 🧠
    title: 语义层引擎
    details: TM/QM 模型抽象数据库表结构，AI 只需理解业务语义。自动处理多表 JOIN、方言转换、权限注入。
    link: /zh/dataset-model/guide/introduction
    linkText: 了解语义层
  - icon: 🔍
    title: JSON Query DSL
    details: 声明式查询语言，54+ 内置函数，20+ 操作符，窗口函数，层级查询，预聚合 —— 一套 DSL 适配所有数据库。
    link: /zh/dataset-model/tm-qm/query-dsl
    linkText: DSL 语法参考
  - icon: 🤖
    title: MCP 协议集成
    details: 原生 MCP Server，开箱即用对接 Claude Desktop、Cursor、Trae CN。自然语言查询，自动生成图表。
    link: /zh/mcp/guide/introduction
    linkText: MCP 工具
  - icon: 🔒
    title: 安全优先
    details: DSL 查询消除 SQL 注入。行级 / 列级 / 角色级三层访问控制，运行时权限注入，只读设计。
    link: /zh/dataset-model/api/authorization
    linkText: 权限控制
  - icon: 🌐
    title: 多数据库方言
    details: MySQL、PostgreSQL、SQL Server、SQLite、MongoDB —— 同一份 DSL 查询，引擎自动翻译为目标方言 SQL。
    link: /zh/dataset-query/guide/multi-database
    linkText: 方言支持
  - icon: 📝
    title: Model-as-Code
    details: 使用 FSScript（类 JavaScript）编写 TM/QM 模型。支持变量、函数、闭包、模块导入、动态逻辑。
    link: /zh/fsscript/guide/introduction
    linkText: FSScript 引擎
---

<div class="vp-doc" style="max-width: 960px; margin: 0 auto; padding: 0 1.5rem;">

<!-- Stats -->
<div class="stats-bar">
  <div class="stat-item">
    <span class="stat-number">54+</span>
    <span class="stat-label">内置函数</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">20+</span>
    <span class="stat-label">查询操作符</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">5</span>
    <span class="stat-label">数据库方言</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">2</span>
    <span class="stat-label">语言实现</span>
  </div>
</div>

<!-- Problem vs Solution -->
<div class="section-header">
  <h2>为什么需要语义层？</h2>
  <p>让 AI 直接写 SQL 查询数据库，存在严重的安全和准确性风险</p>
</div>

<div class="comparison">
  <div class="comparison-bad">
    <h4>❌ AI 直接写 SQL</h4>
    <ul>
      <li>AI 可能生成 DELETE / UPDATE 语句</li>
      <li>必须将完整 Schema 暴露给 AI</li>
      <li><code>order_status=3</code> 是什么意思？AI 不知道</li>
      <li>多表 JOIN 容易出错，调试成本高</li>
      <li>不同数据库方言需要不同 SQL</li>
    </ul>
  </div>
  <div class="comparison-good">
    <h4>✅ 语义层 + DSL 查询</h4>
    <ul>
      <li>DSL 只读设计，杜绝危险操作</li>
      <li>AI 只接触业务语义，不知道表结构</li>
      <li>语义层定义字段含义和关联</li>
      <li>引擎自动处理 JOIN 和聚合</li>
      <li>一套 DSL 适配所有数据库方言</li>
    </ul>
  </div>
</div>

<!-- Architecture -->
<div class="architecture-flow">

```
              AI 助手 (Claude / Cursor / Trae)
                        │
                   MCP 协议调用
                        │
                        ▼
┌─────────────────────────────────────────────┐
│            Foggy MCP Server                 │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │ 元数据工具 │  │ 查询工具  │  │ 图表工具  │ │
│  └───────────┘  └──────────┘  └──────────┘ │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│           语义层引擎 (Semantic Layer)         │
│                                             │
│  TM 表模型 ──→ 维度/度量/关联 ──→ QM 查询模型 │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ DSL 解析  │ │ 权限注入  │ │ 方言 SQL 生成│ │
│  └──────────┘ └──────────┘ └─────────────┘ │
└─────────────────────┬───────────────────────┘
                      │
         ┌────────────┼────────────┐
         ▼            ▼            ▼
      MySQL      PostgreSQL    SQL Server ...
```

</div>

<!-- Three Pillars -->
<div class="section-header">
  <h2>三大核心能力</h2>
</div>

<div class="pillars">
  <div class="pillar">
    <span class="pillar-tag tag-semantic">SEMANTIC LAYER</span>
    <h3>🧠 语义建模</h3>
    <ul>
      <li><a href="/zh/dataset-model/tm-qm/tm-syntax">TM 表模型</a> — 维度、度量、属性</li>
      <li><a href="/zh/dataset-model/tm-qm/qm-syntax">QM 查询模型</a> — 列定义、排序、权限</li>
      <li><a href="/zh/dataset-model/tm-qm/calculated-fields">计算字段</a> — 派生指标和表达式</li>
      <li><a href="/zh/dataset-model/tm-qm/parent-child">父子维度</a> — 层级和闭包表</li>
      <li><a href="/zh/dataset-model/advanced/pre-aggregation">预聚合</a> — 加速大数据量查询</li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-dsl">QUERY DSL</span>
    <h3>🔍 DSL 查询</h3>
    <ul>
      <li><a href="/zh/dataset-model/tm-qm/query-dsl">JSON Query DSL</a> — 声明式查询语法</li>
      <li>20+ 操作符（含 NOT LIKE、层级）</li>
      <li>54+ 内置函数（数学、日期、字符串）</li>
      <li>窗口函数（ROW_NUMBER、LAG 等）</li>
      <li><a href="/zh/dataset-query/guide/multi-database">多方言 SQL 生成</a></li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-mcp">MCP TOOLS</span>
    <h3>🤖 MCP 工具</h3>
    <ul>
      <li><a href="/zh/mcp/tools/metadata">元数据工具</a> — 模型发现和 Schema</li>
      <li><a href="/zh/mcp/tools/query">查询工具</a> — 执行 DSL 查询</li>
      <li><a href="/zh/mcp/tools/nl-query">自然语言查询</a> — NL-to-DSL</li>
      <li><a href="/zh/mcp/guide/chart-render-service">图表渲染</a> — 自动可视化</li>
      <li><a href="/zh/mcp/tools/extensions">扩展工具</a> — 自定义插件</li>
    </ul>
  </div>
</div>

<!-- DSL Example -->
<div class="section-header">
  <h2>DSL 查询示例</h2>
  <p>AI 助手发送 JSON DSL → 语义层翻译为安全 SQL</p>
</div>

<div class="dsl-example">
<div>
<span class="label label-input">JSON DSL 输入</span>

```json
{
  "model": "FactSalesQueryModel",
  "columns": [
    "customer$name",
    "product$categoryName",
    "sum(totalAmount)"
  ],
  "filters": [
    { "field": "orderDate", "op": ">=",
      "value": "2024-01-01" },
    { "field": "product$categoryName",
      "op": "in",
      "value": ["Electronics", "Books"] }
  ],
  "orderBy": [
    { "field": "totalAmount", "dir": "DESC" }
  ],
  "limit": 10
}
```

</div>
<div>
<span class="label label-output">生成的 SQL（MySQL 方言）</span>

```sql
SELECT
  c.name         AS `customer$name`,
  p.category_name AS `product$categoryName`,
  SUM(f.total_amount) AS `totalAmount`
FROM fact_sales f
  JOIN dim_customer c
    ON f.customer_id = c.id
  JOIN dim_product p
    ON f.product_id = p.id
WHERE f.order_date >= '2024-01-01'
  AND p.category_name IN
      ('Electronics', 'Books')
GROUP BY c.name, p.category_name
ORDER BY SUM(f.total_amount) DESC
LIMIT 10
```

</div>
</div>

<!-- Quick Start -->
<div class="section-header">
  <h2>3 步快速开始</h2>
</div>

<div class="quick-steps">
  <div class="quick-step">
    <div class="step-num">1</div>
    <h4>启动服务</h4>
    <p><code>docker compose up -d</code><br/>一键启动 MySQL + Foggy MCP Server + 演示数据</p>
  </div>
  <div class="quick-step">
    <div class="step-num">2</div>
    <h4>配置 AI 工具</h4>
    <p>在 Claude Desktop / Cursor 中添加 MCP Server 地址：<br/><code>http://localhost:7108/mcp/analyst/rpc</code></p>
  </div>
  <div class="quick-step">
    <div class="step-num">3</div>
    <h4>开始查询</h4>
    <p>用自然语言提问：<br/><em>"显示上周各品牌的销售额趋势"</em></p>
  </div>
</div>

<!-- Implementations -->
<div class="section-header">
  <h2>多语言实现</h2>
  <p>Java 和 Python 双引擎，同一套语义层标准</p>
</div>

<div class="impl-badges">
  <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge" class="impl-badge" target="_blank">
    ☕ Java 实现 — Spring Boot
  </a>
  <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge-python" class="impl-badge" target="_blank">
    🐍 Python 实现 — FastAPI
  </a>
</div>

<!-- CTA -->
<div class="cta-section">
  <h2>开始构建 AI 数据查询</h2>
  <p>5 分钟部署语义层，让 AI 安全地查询你的业务数据</p>
  <div class="cta-buttons">
    <a href="/zh/mcp/guide/quick-start" class="cta-btn-primary">快速开始 →</a>
    <a href="/zh/dataset-model/guide/introduction" class="cta-btn-secondary">阅读文档</a>
    <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge" class="cta-btn-secondary" target="_blank">GitHub</a>
  </div>
</div>

</div>
