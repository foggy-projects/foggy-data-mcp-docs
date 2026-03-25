---
layout: home
hero:
  name: Foggy Data MCP
  text: Stop Letting AI Write SQL Directly
  tagline: Use a semantic layer and MCP tools to let AI query business data safely, with permissions, business meaning, and multi-database support built in.
  actions:
    - theme: brand
      text: 中文快速开始
      link: /zh/mcp/guide/quick-start
    - theme: alt
      text: English Quick Start
      link: /en/mcp/guide/quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/foggy-projects/foggy-data-mcp-bridge

features:
  - icon: 🔒
    title: Safer Than Raw SQL
    details: AI sends JSON DSL and MCP tool calls, not handwritten SQL. Keep dangerous operations and schema leakage out of the prompt.
  - icon: 🧠
    title: Business Semantics First
    details: TM/QM models expose dimensions, measures, permissions, and field meaning so AI works with business concepts instead of raw tables.
  - icon: 🤖
    title: MCP-Native
    details: Connect Claude Desktop, Cursor, Trae, and your own apps through MCP endpoints, metadata tools, query tools, and chart tools.
  - icon: 🌐
    title: One Layer, Many Backends
    details: Run the same query model across MySQL, PostgreSQL, SQL Server, SQLite, MongoDB, and language runtimes in Java or Python.
---

<div class="vp-doc landing-shell">

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
    <span class="stat-label">Language Engines</span>
  </div>
</div>

<div class="section-header">
  <h2>What Problem Does It Solve?</h2>
  <p>Foggy Data MCP sits between AI and your database so the model asks business questions instead of generating fragile SQL.</p>
</div>

<div class="comparison">
  <div class="comparison-bad">
    <h4>Without a Semantic Layer</h4>
    <ul>
      <li>LLM prompts need table names, fields, and database dialect details</li>
      <li>Permissions are hard to preserve once AI writes SQL directly</li>
      <li>JOINs, aggregations, and business meanings drift quickly</li>
      <li>Every new data source adds more prompt complexity</li>
    </ul>
  </div>
  <div class="comparison-good">
    <h4>With Foggy Data MCP</h4>
    <ul>
      <li>AI calls MCP tools and sends JSON DSL instead of raw SQL</li>
      <li>TM/QM models define business fields, relationships, and access rules</li>
      <li>The engine handles JOINs, dialect translation, and query safety</li>
      <li>You can ship one governed interface to multiple AI clients</li>
    </ul>
  </div>
</div>

<div class="section-header">
  <h2>Where To Start</h2>
  <p>Pick the path that matches your first real user and your fastest demo.</p>
</div>

<div class="path-grid">
  <a href="/zh/mcp/guide/quick-start" class="path-card">
    <span class="path-tag">GENERAL MCP</span>
    <h3>通用数据语义层</h3>
    <p>适合要把 AI 安全接到业务库、报表库或分析库的团队。先跑通 MCP、DSL、图表和多数据库能力。</p>
    <span class="path-link">查看中文快速开始 →</span>
  </a>
  <a href="https://github.com/foggy-projects/foggy-odoo-bridge" class="path-card path-card-highlight" target="_blank">
    <span class="path-tag">FASTEST GO-TO-MARKET</span>
    <h3>Odoo 智能问数场景</h3>
    <p>最容易拿到首批用户的切口。你已经有权限映射、模型和集成路径，适合直接做案例演示和行业推广。</p>
    <span class="path-link">查看 Odoo Bridge →</span>
  </a>
</div>

<div class="section-header">
  <h2>How It Works</h2>
  <p>Natural language or app requests are turned into governed semantic queries before touching the database.</p>
</div>

<div class="architecture-flow">

```text
AI Assistant / App
        │
        │  MCP tools / JSON-RPC
        ▼
Foggy MCP Server
  • metadata tool
  • query tool
  • chart tool
        │
        ▼
Semantic Layer
  • TM/QM models
  • JSON Query DSL
  • permission injection
  • dialect SQL generation
        │
        ▼
MySQL / PostgreSQL / SQL Server / SQLite / MongoDB
```

</div>

<div class="section-header">
  <h2>Three Reasons People Try It</h2>
</div>

<div class="pillars">
  <div class="pillar">
    <span class="pillar-tag tag-semantic">SECURITY</span>
    <h3>Keep AI Away From Raw SQL</h3>
    <ul>
      <li>Read-only query flow</li>
      <li>Permission injection before execution</li>
      <li>No need to dump your schema into prompts</li>
      <li>Cleaner audit and governance boundaries</li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-dsl">SEMANTICS</span>
    <h3>Expose Business Meaning</h3>
    <ul>
      <li>Dimensions, measures, hierarchies, calculated fields</li>
      <li>Reusable TM/QM modeling</li>
      <li>One query language across data sources</li>
      <li>Less prompt engineering, more stable results</li>
    </ul>
  </div>
  <div class="pillar">
    <span class="pillar-tag tag-mcp">ADOPTION</span>
    <h3>Meet Users Where They Already Are</h3>
    <ul>
      <li>Claude Desktop, Cursor, Trae, custom apps</li>
      <li>Java and Python implementations</li>
      <li>Chart generation for demos and reporting</li>
      <li>Good fit for ERP, BI, and internal AI tools</li>
    </ul>
  </div>
</div>

<div class="section-header">
  <h2>Sample Use Cases</h2>
  <p>Lead with a scenario, not with the framework. These are easier to market than a generic platform pitch.</p>
</div>

<div class="use-case-grid">
  <div class="use-case-card">
    <span class="use-case-icon">📊</span>
    <h3>AI 数据分析助手</h3>
    <p>让业务人员直接问“上周各品牌销售趋势”“本月退款率最高的品类”，避免他们碰 SQL。</p>
  </div>
  <div class="use-case-card">
    <span class="use-case-icon">🏢</span>
    <h3>Odoo 智能问数</h3>
    <p>把 Odoo 权限规则映射到 DSL 查询，做销售、采购、库存、财务的自然语言分析。</p>
  </div>
  <div class="use-case-card">
    <span class="use-case-icon">🛡️</span>
    <h3>受控企业 AI 接口</h3>
    <p>给内部 Copilot、客服机器人或 BI 助手一层可治理的数据访问协议，而不是直接数据库连接。</p>
  </div>
</div>

<div class="section-header">
  <h2>Choose Language / 选择语言</h2>
  <p>The docs are bilingual. Pick your working language and keep moving.</p>
</div>

<div class="lang-cards">
  <a href="/zh/" class="lang-card">
    <span class="lang-icon">🇨🇳</span>
    <span class="lang-name">简体中文</span>
    <span class="lang-desc">中文文档与示例</span>
  </a>
  <a href="/en/" class="lang-card">
    <span class="lang-icon">🇺🇸</span>
    <span class="lang-name">English</span>
    <span class="lang-desc">English docs and references</span>
  </a>
</div>

<div class="impl-badges">
  <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge" class="impl-badge" target="_blank">
    ☕ Java - Spring Boot
  </a>
  <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge-python" class="impl-badge" target="_blank">
    🐍 Python - FastAPI
  </a>
  <a href="https://github.com/foggy-projects/foggy-odoo-bridge" class="impl-badge" target="_blank">
    🧩 Odoo - ERP Scenario
  </a>
</div>

<div class="cta-section">
  <h2>Start With One Demo, Not a Huge Platform Rollout</h2>
  <p>The fastest path is to publish one visible scenario, one short video, and one reproducible quick start. Then iterate from real user questions.</p>
  <div class="cta-buttons">
    <a href="/zh/" class="cta-btn-primary">中文文档</a>
    <a href="/en/" class="cta-btn-secondary">English Docs</a>
    <a href="https://github.com/foggy-projects/foggy-data-mcp-bridge" class="cta-btn-secondary" target="_blank">GitHub</a>
  </div>
</div>

</div>
