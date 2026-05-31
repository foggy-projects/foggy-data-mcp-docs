<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  variant: {
    type: String,
    default: 'root'
  }
})

const isZh = computed(() => props.variant === 'zh')

const content = computed(() => {
  if (isZh.value) {
    return {
      className: 'foggy-home-zh',
      h1: '打通 AI 与业务数据的最后一公里',
      lead: 'Foggy Data MCP 用 TM/QM 语义模型、JSON Query DSL、MCP 工具和查询证据，把自然语言分析请求收敛为可建模、可校验、可执行、可审计的查询工作流。',
      actions: [
        ['阅读白皮书 v1.0', withBase('/zh/whitepaper/v1.0/'), 'foggy-button-primary'],
        ['快速开始', withBase('/zh/mcp/guide/quick-start.html'), 'foggy-button-secondary'],
        ['GitHub', 'https://github.com/foggy-projects/foggy-data-mcp-bridge', 'foggy-button-ghost']
      ],
      trust: ['语义模型', '结构化 DSL', '权限注入', '查询证据'],
      proof: [
        ['TM/QM', '业务语义和物理模型分离'],
        ['JSON DSL', '结构化查询契约'],
        ['MCP', 'AI 工具接入层'],
        ['Java / Python', '双语言实现路径']
      ],
      whyTitle: '问题不是“AI 会不会写 SQL”，而是 SQL 不是稳定的 AI 合约。',
      whyBody: '直接把 schema、字段、JOIN 路径和权限口径交给模型，会让提示词变成脆弱的数据库接口。Foggy 把这些边界前移到语义模型和查询引擎中，让 AI 面向业务字段发起查询，而不是临时拼接数据库细节。',
      contrast: [
        ['Direct SQL Prompt', 'schema 暴露、方言脆弱、权限漂移、指标口径不一致'],
        ['Foggy Contract', '模型发现、字段校验、权限注入、引擎生成 SQL、证据留存']
      ],
      lifecycleTitle: '从 AI 请求到查询证据，一条受治理的分析流水线。',
      lifecycle: [
        ['01', '语义建模', '用 TM/QM 定义表、维度、度量、字段暴露和权限边界。', withBase('/zh/dataset-model/guide/introduction.html')],
        ['02', '模型发现', 'AI 先获取可访问模型和字段说明，而不是读取完整数据库 schema。', withBase('/zh/mcp/tools/metadata.html')],
        ['03', 'DSL 查询', '查询意图以 JSON DSL 表达，便于校验、记录、复用和回放。', withBase('/zh/whitepaper/v1.0/query-dsl-syntax-reference.html')],
        ['04', '执行与证据', '引擎生成目标方言 SQL，执行后保留 DSL、SQL 和结果摘要。', withBase('/zh/whitepaper/v1.0/foggy-data-mcp-technical-whitepaper.html')]
      ],
      docsTitle: '白皮书 v1.0 已冻结，后续只修正错误口径。',
      docsBody: '当前公开版本聚焦已经实现和验证的语义建模、DSL 查询、Compose 组合式分析、治理和证据能力。Virtual Semantic SQL 等方向进入后续版本路线图。',
      docs: [
        ['技术博客系列', withBase('/zh/blog/enterprise-ai-data-governance-series.html')],
        ['白皮书 v1.0', withBase('/zh/whitepaper/v1.0/')],
        ['TM/QM 定义总览', withBase('/zh/whitepaper/v1.0/semantic-layer-syntax-reference.html')],
        ['DSL 语法参考', withBase('/zh/whitepaper/v1.0/query-dsl-syntax-reference.html')],
        ['预聚合能力参考', withBase('/zh/whitepaper/v1.0/pre-aggregation-reference.html')]
      ]
    }
  }

  return {
    className: '',
    h1: 'Put a governed semantic engine between AI and business data.',
    lead: 'Foggy Data MCP turns AI analysis requests into model-aware, permission-aware, executable query workflows using TM/QM semantic models, JSON Query DSL, MCP tools, and query evidence.',
    actions: [
      ['Read v1.0 Whitepaper', withBase('/zh/whitepaper/v1.0/'), 'foggy-button-primary'],
      ['中文快速开始', withBase('/zh/mcp/guide/quick-start.html'), 'foggy-button-secondary'],
      ['English Docs', withBase('/en/mcp/guide/quick-start.html'), 'foggy-button-ghost']
    ],
    trust: ['Semantic Models', 'Structured DSL', 'Permission Injection', 'Query Evidence'],
    proof: [
      ['TM/QM', 'Semantic model boundary'],
      ['JSON DSL', 'Structured query contract'],
      ['MCP', 'AI tool access layer'],
      ['Java / Python', 'Two implementation paths']
    ],
    whyTitle: 'The issue is not whether an LLM can write SQL. It is whether SQL is the right AI contract.',
    whyBody: 'Raw SQL prompts expose schema details, blur permission boundaries, and force business metrics into fragile prompt text. Foggy moves those responsibilities into semantic models and the query engine, so AI works through governed business fields instead of ad hoc database internals.',
    contrast: [
      ['Direct SQL Prompt', 'schema leakage, dialect fragility, permission drift, ambiguous metrics'],
      ['Foggy Contract', 'model discovery, field validation, permission injection, engine-generated SQL, query evidence']
    ],
    lifecycleTitle: 'A governed analysis workflow from AI request to query evidence.',
    lifecycle: [
      ['01', 'Semantic Modeling', 'Define tables, dimensions, measures, exposed fields, and permission boundaries with TM/QM.', withBase('/zh/dataset-model/guide/introduction.html')],
      ['02', 'Model Discovery', 'AI discovers accessible models and fields instead of reading the entire database schema.', withBase('/zh/mcp/tools/metadata.html')],
      ['03', 'DSL Query', 'Intent is expressed as JSON DSL, making validation, logging, reuse, and replay practical.', withBase('/zh/whitepaper/v1.0/query-dsl-syntax-reference.html')],
      ['04', 'Execution Evidence', 'The engine generates dialect SQL and records DSL, SQL, and result summaries for review.', withBase('/zh/whitepaper/v1.0/foggy-data-mcp-technical-whitepaper.html')]
    ],
    docsTitle: 'The v1.0 whitepaper is frozen as the current public contract.',
    docsBody: 'The current public release documents implemented and verified semantic modeling, DSL query, compose analysis, governance, and evidence capabilities. Future capabilities stay in later versions and roadmap documents.',
    docs: [
      ['Technical Blog', withBase('/en/blog/')],
      ['Whitepaper v1.0', withBase('/zh/whitepaper/v1.0/')],
      ['TM/QM Reference', withBase('/zh/whitepaper/v1.0/semantic-layer-syntax-reference.html')],
      ['DSL Syntax', withBase('/zh/whitepaper/v1.0/query-dsl-syntax-reference.html')],
      ['中文文档', withBase('/zh/')]
    ]
  }
})

const dslLines = [
  '{',
  '  "model": "SalesAnalysisQM",',
  '  "columns": ["brand", "sum(salesAmount)"],',
  '  "filters": [{"field": "orderDate", "op": ">=", "value": "2026-01-01"}],',
  '  "orderBy": [{"field": "salesAmount", "dir": "DESC"}]',
  '}'
]
</script>

<template>
  <div class="foggy-home" :class="content.className">
    <section class="foggy-hero">
      <div class="foggy-hero-copy">
        <div class="foggy-kicker">LLM Semantic Layer Engine</div>
        <h1>{{ content.h1 }}</h1>
        <p class="foggy-lead">{{ content.lead }}</p>
        <div class="foggy-actions">
          <a
            v-for="action in content.actions"
            :key="action[0]"
            class="foggy-button"
            :class="action[2]"
            :href="action[1]"
            :target="action[1].startsWith('http') ? '_blank' : undefined"
          >{{ action[0] }}</a>
        </div>
        <div class="foggy-trust-row">
          <span v-for="item in content.trust" :key="item">{{ item }}</span>
        </div>
      </div>

      <div class="foggy-hero-visual" aria-label="Foggy semantic query workflow">
        <div class="foggy-console">
          <div class="foggy-console-top">
            <img :src="withBase('/logo.png')" alt="Foggy Data MCP logo">
            <span>Semantic Query Console</span>
            <b>governed</b>
          </div>
          <div class="foggy-console-grid">
            <div class="foggy-model-panel">
              <span class="foggy-panel-label">MODEL</span>
              <strong>SalesAnalysisQM</strong>
              <p>customer · product · orderDate · salesAmount</p>
              <div class="foggy-mini-table">
                <span>field</span><span>visibility</span>
                <b>customer$caption</b><em>allowed</em>
                <b>grossMargin</b><em>allowed</em>
                <b>raw_cost_col</b><em>hidden</em>
              </div>
            </div>
            <div class="foggy-query-panel">
              <span class="foggy-panel-label">DSL</span>
              <div class="foggy-code">
                <span v-for="line in dslLines" :key="line">{{ line }}</span>
              </div>
            </div>
          </div>
          <div class="foggy-pipeline">
            <span>list_models</span>
            <i></i>
            <span>describe_model</span>
            <i></i>
            <span>query_model</span>
            <i></i>
            <span>evidence</span>
          </div>
        </div>
      </div>
    </section>

    <section class="foggy-proof">
      <div v-for="item in content.proof" :key="item[0]">
        <strong>{{ item[0] }}</strong>
        <span>{{ item[1] }}</span>
      </div>
    </section>

    <section class="foggy-section foggy-split">
      <div>
        <span class="foggy-section-label">WHY IT EXISTS</span>
        <h2>{{ content.whyTitle }}</h2>
        <p>{{ content.whyBody }}</p>
      </div>
      <div class="foggy-contrast">
        <div v-for="item in content.contrast" :key="item[0]">
          <b>{{ item[0] }}</b>
          <span>{{ item[1] }}</span>
        </div>
      </div>
    </section>

    <section class="foggy-section">
      <div class="foggy-section-head">
        <span class="foggy-section-label">QUERY LIFECYCLE</span>
        <h2>{{ content.lifecycleTitle }}</h2>
      </div>
      <div class="foggy-lifecycle">
        <a v-for="item in content.lifecycle" :key="item[0]" :href="item[3]">
          <span>{{ item[0] }}</span>
          <h3>{{ item[1] }}</h3>
          <p>{{ item[2] }}</p>
        </a>
      </div>
    </section>

    <section class="foggy-section foggy-docs-band">
      <div>
        <span class="foggy-section-label">PUBLIC CONTRACT v1.0</span>
        <h2>{{ content.docsTitle }}</h2>
        <p>{{ content.docsBody }}</p>
      </div>
      <div class="foggy-doc-links">
        <a v-for="item in content.docs" :key="item[0]" :href="item[1]">{{ item[0] }}</a>
      </div>
    </section>
  </div>
</template>
