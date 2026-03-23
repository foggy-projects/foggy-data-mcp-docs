---
layout: home
hero:
  name: Foggy Data MCP
  text: AI-Native Semantic Layer Framework
  tagline: Enable AI assistants to query business data safely and accurately through MCP protocol — without exposing database schemas
  actions:
    - theme: brand
      text: Get Started
      link: /en/mcp/guide/quick-start
    - theme: alt
      text: JSON Query DSL
      link: /en/dataset-model/tm-qm/query-dsl
    - theme: alt
      text: GitHub
      link: https://github.com/foggy-projects/foggy-data-mcp-bridge

features:
  - icon: 🧠
    title: Semantic Layer Engine
    details: TM/QM models abstract database schemas. AI only understands business semantics. Auto-handles JOINs, dialect translation, and permission injection.
    link: /en/dataset-model/guide/introduction
    linkText: Learn More
  - icon: 🔍
    title: JSON Query DSL
    details: Declarative query language with 54+ built-in functions, 20+ operators, window functions, hierarchy queries, and pre-aggregation — one DSL for all databases.
    link: /en/dataset-model/tm-qm/query-dsl
    linkText: DSL Reference
  - icon: 🤖
    title: MCP Protocol Integration
    details: Native MCP Server with out-of-box support for Claude Desktop, Cursor, and Trae CN. Natural language queries with auto chart generation.
    link: /en/mcp/guide/introduction
    linkText: MCP Tools
  - icon: 🔒
    title: Security First
    details: DSL queries eliminate SQL injection. Row / column / role-level access control with runtime permission injection and read-only design.
    link: /en/dataset-model/api/authorization
    linkText: Access Control
  - icon: 🌐
    title: Multi-Database Dialects
    details: MySQL, PostgreSQL, SQL Server, SQLite, MongoDB — same DSL query, engine auto-translates to target dialect SQL.
    link: /en/dataset-query/guide/multi-database
    linkText: Dialect Support
  - icon: 📝
    title: Model-as-Code
    details: Write TM/QM models in FSScript (JavaScript-like). Supports variables, functions, closures, module imports, and dynamic logic.
    link: /en/fsscript/guide/introduction
    linkText: FSScript Engine
---

<div class="vp-doc" style="max-width: 960px; margin: 0 auto; padding: 0 1.5rem;">

<!-- Stats -->
<div class="stats-bar">
  <div class="stat-item">
    <span class="stat-number">54+</span>
    <span class="stat-label">Built-in Functions</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">20+</span>
    <span class="stat-label">Query Operators</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">5</span>
    <span class="stat-label">Database Dialects</span>
  </div>
  <div class="stat-item">
    <span class="stat-number">2</span>
    <span class="stat-label">Language SDKs</span>
  </div>
</div>

<!-- Problem vs Solution -->
<div class="section-header">
  <h2>Why a Semantic Layer?</h2>
  <p>Letting AI write SQL directly against your database is risky and unreliable</p>
</div>

<div class="comparison">
  <div class="comparison-bad">
    <h4>❌ AI Writes SQL Directly</h4>
    <ul>
      <li>AI may generate DELETE / UPDATE statements</li>
      <li>Must expose full database schema to AI</li>
      <li>What does <code>order_status=3</code> mean? AI doesn't know</li>
      <li>Multi-table JOINs are fragile and error-prone</li>
      <li>Different databases require different SQL dialects</li>
    </ul>
  </div>
  <div class="comparison-good">
    <h4>✅ Semantic Layer + DSL Query</h4>
    <ul>
      <li>Read-only DSL design eliminates dangerous operations</li>
      <li>AI only sees business semantics, not table structures</li>
      <li>Semantic layer defines field meanings and relationships</li>
      <li>Engine auto-handles JOINs and aggregations</li>
      <li>One DSL works across all database dialects</li>
    </ul>
  </div>
</div>

<!-- Architecture -->
<div class="architecture-flow">

```
            AI Assistant (Claude / Cursor / Trae)
                        │
                   MCP Protocol
                        │
                        ▼
┌─────────────────────────────────────────────┐
│            Foggy MCP Server                 │
│  ┌───────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Metadata  │  │  Query   │  │  Chart   │ │
│  │   Tool     │  │  Tool    │  │  Tool    │ │
│  └───────────┘  └──────────┘  └──────────┘ │
└─────────────────────┬───────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────┐
│         Semantic Layer Engine                │
│                                             │
│  TM Model ──→ Dims/Measures ──→ QM Model    │
│                                             │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │DSL Parser │ │  Access  │ │ Dialect SQL │ │
│  │          │ │  Control │ │ Generator   │ │
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
  <h2>Three Core Capabilities</h2>
</div>

<div class="pillars">
  <div class="pillar">
    <span class="pillar-tag tag-semantic">SEMANTIC LAYER</span>
    <h3>🧠 Semantic Modeling</h3>
    <ul>
      <li><a href="/en/dataset-model/tm-qm/tm-syntax">TM Table Model</a> — Dimensions, measures, attributes</li>
      <li><a href="/en/dataset-model/tm-qm/qm-syntax">QM Query Model</a> — Columns, ordering, permissions</li>
      <li><a href="/en/dataset-model/tm-qm/calculated-fields">Calculated Fields</a> — Derived metrics & expressions</li>
      <li><a href="/en/dataset-model/tm-qm/parent-child">Parent-Child Dims</a> — Hierarchies & closure tables</li>
      <li><a href="/en/dataset-model/advanced/pre-aggregation">Pre-Aggregation</a> — Accelerate large dataset queries</li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-dsl">QUERY DSL</span>
    <h3>🔍 DSL Query</h3>
    <ul>
      <li><a href="/en/dataset-model/tm-qm/query-dsl">JSON Query DSL</a> — Declarative query syntax</li>
      <li>20+ operators (incl. NOT LIKE, hierarchy)</li>
      <li>54+ built-in functions (math, date, string)</li>
      <li>Window functions (ROW_NUMBER, LAG, etc.)</li>
      <li><a href="/en/dataset-query/guide/multi-database">Multi-dialect SQL generation</a></li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-mcp">MCP TOOLS</span>
    <h3>🤖 MCP Tools</h3>
    <ul>
      <li><a href="/en/mcp/tools/metadata">Metadata Tool</a> — Model discovery & schema</li>
      <li><a href="/en/mcp/tools/query">Query Tool</a> — Execute DSL queries</li>
      <li><a href="/en/mcp/tools/nl-query">NL Query</a> — Natural language to DSL</li>
      <li><a href="/en/mcp/guide/chart-render-service">Chart Render</a> — Auto visualization</li>
      <li><a href="/en/mcp/tools/extensions">Extensions</a> — Custom plugins</li>
    </ul>
  </div>
</div>

<!-- DSL Example -->
<div class="section-header">
  <h2>DSL Query Example</h2>
  <p>AI sends JSON DSL → Semantic layer translates to safe SQL</p>
</div>

<div class="dsl-example">
<div>
<span class="label label-input">JSON DSL Input</span>

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
<span class="label label-output">Generated SQL (MySQL Dialect)</span>

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
  <h2>Get Started in 3 Steps</h2>
</div>

<div class="quick-steps">
  <div class="quick-step">
    <div class="step-num">1</div>
    <h4>Start the Server</h4>
    <p><code>docker compose up -d</code><br/>One-click launch with MySQL + Foggy MCP Server + demo data</p>
  </div>
  <div class="quick-step">
    <div class="step-num">2</div>
    <h4>Configure AI Tool</h4>
    <p>Add MCP Server URL in Claude Desktop / Cursor:<br/><code>http://localhost:7108/mcp/analyst/rpc</code></p>
  </div>
  <div class="quick-step">
    <div class="step-num">3</div>
    <h4>Start Querying</h4>
    <p>Ask in natural language:<br/><em>"Show me sales trends by brand for last week"</em></p>
  </div>
</div>

<!-- Implementations -->
<div class="section-header">
  <h2>Multi-Language Implementations</h2>
  <p>Java and Python dual engines, same semantic layer standard</p>
</div>

<div class="impl-badges">
  <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge" class="impl-badge" target="_blank">
    ☕ Java — Spring Boot
  </a>
  <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge-python" class="impl-badge" target="_blank">
    🐍 Python — FastAPI
  </a>
</div>

<!-- CTA -->
<div class="cta-section">
  <h2>Start Building AI Data Queries</h2>
  <p>Deploy a semantic layer in 5 minutes. Let AI query your business data safely.</p>
  <div class="cta-buttons">
    <a href="/en/mcp/guide/quick-start" class="cta-btn-primary">Get Started →</a>
    <a href="/en/dataset-model/guide/introduction" class="cta-btn-secondary">Read Docs</a>
    <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge" class="cta-btn-secondary" target="_blank">GitHub</a>
  </div>
</div>

</div>
