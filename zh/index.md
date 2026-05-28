---
layout: home
hero:
  name: Foggy Data MCP
  text: AI 原生语义层框架
  tagline: 让 AI 助手通过 MCP 协议和语义层模型查询业务数据，减少直接暴露数据库结构和裸 SQL 的风险
  actions:
    - theme: brand
      text: 快速开始
      link: /zh/mcp/guide/quick-start
    - theme: alt
      text: 白皮书 v1.0
      link: /zh/whitepaper/v1.0/
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
    details: 通过 MCP Server 对接 Claude Desktop、Cursor、Trae CN。AI 调用模型发现、模型描述、结构化查询和组合式分析工具。
    link: /zh/mcp/guide/introduction
    linkText: MCP 工具
  - icon: 🔒
    title: 治理优先
    details: DSL 查询、参数化处理和权限注入共同约束查询过程。重要结果仍应结合查询证据、权限配置和业务记录复核。
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
  <p>让 AI 直接写 SQL 查询数据库，会放大 schema 暴露、权限漂移和业务口径不一致的问题</p>
</div>

<div class="comparison">
  <div class="comparison-bad">
    <h4>AI 直接写 SQL</h4>
    <ul>
      <li>提示词往往需要包含表名、字段和数据库方言细节</li>
      <li><code>order_status=3</code> 是什么意思？AI 不知道</li>
      <li>多表 JOIN、指标口径和权限边界容易漂移</li>
      <li>错误重试可能继续猜测不存在或无权访问的字段</li>
      <li>不同数据库方言会带来额外的脆弱性</li>
    </ul>
  </div>
  <div class="comparison-good">
    <h4>语义层 + DSL 查询</h4>
    <ul>
      <li>AI 通过结构化 DSL 表达查询意图</li>
      <li>QM 只暴露已建模、已授权的业务字段</li>
      <li>语义层定义字段含义、关联和指标口径</li>
      <li>引擎自动处理 JOIN 和聚合</li>
      <li>查询过程可以保留 DSL、SQL 和结果证据</li>
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
│  │ 模型发现  │  │ 查询工具  │  │ 组合分析  │ │
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
      <li><a href="./dataset-model/tm-qm/tm-syntax.html">TM 表模型</a> — 维度、度量、属性</li>
      <li><a href="./dataset-model/tm-qm/qm-syntax.html">QM 查询模型</a> — 列定义、排序、权限</li>
      <li><a href="./dataset-model/tm-qm/calculated-fields.html">计算字段</a> — 派生指标和表达式</li>
      <li><a href="./dataset-model/tm-qm/parent-child.html">父子维度</a> — 层级和闭包表</li>
      <li><a href="./dataset-model/advanced/pre-aggregation.html">预聚合</a> — 加速大数据量查询</li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-dsl">QUERY DSL</span>
    <h3>🔍 DSL 查询</h3>
    <ul>
      <li><a href="./dataset-model/tm-qm/query-dsl.html">JSON Query DSL</a> — 声明式查询语法</li>
      <li>20+ 操作符（含 NOT LIKE、层级）</li>
      <li>54+ 内置函数（数学、日期、字符串）</li>
      <li>窗口函数（ROW_NUMBER、LAG 等）</li>
      <li><a href="./dataset-query/guide/multi-database.html">多方言 SQL 生成</a></li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-mcp">MCP TOOLS</span>
    <h3>🤖 MCP 工具</h3>
    <ul>
      <li><a href="./mcp/tools/metadata.html">模型发现</a> — 可访问模型和字段说明</li>
      <li><a href="./mcp/tools/query.html">查询工具</a> — 执行 DSL 查询</li>
      <li>Compose Script — 多步骤组合式分析</li>
      <li>查询证据 — 保留 DSL、SQL 和结果摘要</li>
      <li><a href="./mcp/tools/extensions.html">扩展工具</a> — 按部署暴露可选能力</li>
    </ul>
  </div>
</div>

<!-- DSL Example -->
<div class="section-header">
  <h2>DSL 查询示例</h2>
  <p>AI 助手发送 JSON DSL → 语义层校验字段和权限 → 引擎生成目标数据库 SQL</p>
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
    <p>让 AI 工具调用模型发现和查询工具：<br/><em>"按品牌统计上周销售额"</em></p>
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
    <a href="./mcp/guide/quick-start.html" class="cta-btn-primary">快速开始 →</a>
    <a href="./dataset-model/guide/introduction.html" class="cta-btn-secondary">阅读文档</a>
    <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge" class="cta-btn-secondary" target="_blank">GitHub</a>
  </div>
</div>

</div>
