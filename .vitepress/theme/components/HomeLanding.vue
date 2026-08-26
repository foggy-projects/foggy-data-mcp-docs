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
      kicker: 'SEMANTIC MODELING / 9.2.0',
      h1: '把分散的数据库表，组织成 AI 能理解的领域模型',
      lead: 'Foggy 先用 TM 将物理结构转换为领域语义，再用 QM 组合多个 TM，形成集中、可治理的业务分析模型，最后通过 MCP 和 Query DSL 交付给 LLM。',
      actions: [
        { text: '查看 TM/QM 建模', href: withBase('/zh/dataset-model/guide/concepts.html'), kind: 'foggy-button-primary' },
        { text: '开始建模', href: withBase('/zh/dataset-model/guide/quick-start.html'), kind: 'foggy-button-secondary' },
        { text: 'GitHub', href: 'https://github.com/foggy-projects/foggy-data-mcp-bridge', kind: 'foggy-button-ghost', external: true }
      ],
      heroMeta: ['TM 建立领域语义', 'QM 组合业务模型', 'MCP 交付给 LLM'],
      proof: [
        ['TM', '从表结构到领域语义'],
        ['QM', '从多个 TM 到集中模型'],
        ['MCP', '把模型能力交付给 AI'],
        ['9.2.0', '当前稳定运行版本']
      ],
      heroVisual: {
        eyebrow: 'SCHEMA → DOMAIN → LLM',
        sourceLabel: 'PHYSICAL SCHEMA',
        sourceName: '分散的业务表',
        sourceItems: ['t_order', 't_order_item', 't_customer', 't_product'],
        tmLabel: 'TM / DOMAIN SEMANTICS',
        tmName: '领域语义单元',
        tmItems: ['客户', '订单', '产品', '销售金额'],
        qmLabel: 'QM / BUSINESS MODEL',
        qmName: '销售分析 QM',
        qmItems: ['客户 · 区域 · 产品', '订单日期 · 销售额'],
        llmLabel: 'LLM QUESTION',
        llmText: '本月各区域的销售额？',
        footer: 'LLM 面向业务概念，不需要理解原始表之间的关联路径。'
      },
      introLabel: 'WHY SEMANTIC MODELING',
      introTitle: 'LLM 不需要更多表结构，它需要更清晰的业务世界。',
      introBody: '真正需要交付给 LLM 的，不是字段名、外键和一张完整的 schema，而是经过组织的业务概念、指标口径、分析关系和可见边界。Foggy 把这次转换变成可维护的建模工作流。',
      introPoints: [
        ['01', '把数据说成业务', '将字段、枚举和计算规则表达为实体、维度、指标和业务描述。'],
        ['02', '把关联藏在模型里', '通过 QM 组合多个 TM，让 AI 面向一个完整领域提问，而不是拼接原始 JOIN。'],
        ['03', '把能力交付给 AI', '模型可被发现、描述、校验和调用，成为 LLM 稳定的查询边界。']
      ],
      layerLabel: 'THE MODELING STACK',
      layerTitle: 'TM 和 QM，分别完成两次关键的语义转换。',
      layerBody: 'TM 建立领域语义单元，QM 将这些单元组合成面向业务问题的统一模型。AI 的主要认知对象是 QM，而不是数据库中的原始表。',
      layers: [
        ['TM', '领域语义单元', '把物理表、字段和基础关系映射为实体、维度、指标与业务口径。', '表结构 → 领域语义', withBase('/zh/dataset-model/tm-qm/tm-syntax.html')],
        ['QM', '集中化业务模型', '组合多个 TM，封装语义 Join，定义业务分析可以使用的维度和指标。', '多个 TM → 业务领域', withBase('/zh/dataset-model/tm-qm/qm-syntax.html')],
        ['MCP', 'LLM 交付接口', '让 AI 发现可用 QM、读取模型描述，并以结构化方式提出和执行查询。', '业务模型 → AI 工具', withBase('/zh/mcp/tools/overview.html')]
      ],
      layerLinkText: '查看模型参考',
      exampleLabel: 'FROM TABLES TO A DOMAIN MODEL',
      exampleTitle: '一个销售问题，背后是一套被组织好的领域模型。',
      exampleBody: 'Foggy 不要求 LLM 记住订单、订单明细、客户和产品的连接方式。它只需要理解销售分析 QM 暴露的业务概念。',
      example: {
        sourceLabel: '原始表结构',
        sourceItems: ['t_order.customer_id', 't_order_item.amount', 't_order.created_at', 't_product.category'],
        tmLabel: 'TM 领域语义',
        tmItems: ['客户', '销售金额', '下单时间', '产品分类'],
        qmLabel: 'QM 业务分析面',
        qmItems: ['维度：区域 / 产品 / 月份', '指标：销售额 / 订单数 / 客单价', '关系：由模型封装'],
        question: '查询本月各区域的销售额，并按销售额降序排列。'
      },
      architectureLabel: 'ARCHITECTURE',
      architectureTitle: '让每一层只承担它应该承担的语义责任。',
      architecture: [
        ['01', 'Physical Schema', '表、字段、原始关系', '数据源提供事实，但不直接成为 LLM 的认知界面。'],
        ['02', 'TM', '领域语义单元', '将底层结构翻译成实体、维度、指标和业务定义。'],
        ['03', 'QM', '集中化业务模型', '跨 TM 组合出完整领域，隐藏物理 Join，收敛可分析范围。'],
        ['04', 'MCP + Query DSL', '模型交付与查询契约', 'LLM 发现模型、读取描述、生成结构化查询并获得证据。'],
        ['05', 'Runtime', '校验、执行与治理', '处理权限、方言、查询执行和结果追溯。']
      ],
      lifecycleLabel: 'MODEL-TO-ANSWER',
      lifecycleTitle: '从建模到回答，AI 始终沿着业务语义工作。',
      lifecycle: [
        ['01', '识别数据结构', '盘点表、字段、枚举和原始关系，确定需要建模的业务域。', withBase('/zh/dataset-model/guide/introduction.html')],
        ['02', '建立 TM', '把底层数据对象转化为可解释的实体、维度、指标和基础口径。', withBase('/zh/dataset-model/tm-qm/tm-syntax.html')],
        ['03', '组合 QM', '跨 TM 建立语义关联，组织面向销售、客户或经营分析的统一模型。', withBase('/zh/dataset-model/tm-qm/qm-syntax.html')],
        ['04', '交付给 LLM', 'AI 发现并读取 QM，通过 MCP 和 Query DSL 提出结构化查询。', withBase('/zh/mcp/tools/metadata.html')],
        ['05', '校验并执行', 'Runtime 负责权限、查询执行和证据留存，返回可解释的结果。', withBase('/zh/whitepaper/v2.0/')]
      ],
      docsLabel: 'PUBLIC CONTRACTS / STABLE 9.2.0',
      docsTitle: '先从语义建模开始，再让 AI 使用模型。',
      docsBody: 'v1.0 和 v2.0 公开契约保持稳定；v3.0 仍处于 Draft / Not Frozen 状态。实施手册和版本材料继续按确认后的公开范围发布。',
      docs: [
        ['TM/QM 建模指南', withBase('/zh/dataset-model/guide/concepts.html')],
        ['TM 语法参考', withBase('/zh/dataset-model/tm-qm/tm-syntax.html')],
        ['QM 语法参考', withBase('/zh/dataset-model/tm-qm/qm-syntax.html')],
        ['v2.0 白皮书', withBase('/zh/whitepaper/v2.0/')],
        ['MCP 工具说明', withBase('/zh/mcp/tools/overview.html')]
      ]
    }
  }

  return {
    className: 'foggy-home-en',
    kicker: 'SEMANTIC MODELING / 9.2.0',
    h1: 'Turn scattered database tables into a domain model AI can understand',
    lead: 'Foggy uses TM to turn physical structure into domain semantics, QM to compose multiple TMs into a focused business model, and MCP plus Query DSL to deliver that model to LLMs.',
    actions: [
      { text: 'Explore TM/QM Modeling', href: withBase('/en/dataset-model/guide/concepts.html'), kind: 'foggy-button-primary' },
      { text: 'Start Modeling', href: withBase('/en/dataset-model/guide/quick-start.html'), kind: 'foggy-button-secondary' },
      { text: 'GitHub', href: 'https://github.com/foggy-projects/foggy-data-mcp-bridge', kind: 'foggy-button-ghost', external: true }
    ],
    heroMeta: ['TM builds domain semantics', 'QM composes business models', 'MCP delivers models to LLMs'],
    proof: [
      ['TM', 'Schema to domain semantics'],
      ['QM', 'Multiple TMs to one model'],
      ['MCP', 'Model delivery for AI'],
      ['9.2.0', 'Current stable runtime']
    ],
    heroVisual: {
      eyebrow: 'SCHEMA → DOMAIN → LLM',
      sourceLabel: 'PHYSICAL SCHEMA',
      sourceName: 'Scattered business tables',
      sourceItems: ['t_order', 't_order_item', 't_customer', 't_product'],
      tmLabel: 'TM / DOMAIN SEMANTICS',
      tmName: 'Domain semantic units',
      tmItems: ['Customer', 'Order', 'Product', 'Sales amount'],
      qmLabel: 'QM / BUSINESS MODEL',
      qmName: 'Sales Analysis QM',
      qmItems: ['Customer · Region · Product', 'Order date · Sales'],
      llmLabel: 'LLM QUESTION',
      llmText: 'Sales by region this month?',
      footer: 'The LLM works with business concepts, not raw table join paths.'
    },
    introLabel: 'WHY SEMANTIC MODELING',
    introTitle: 'LLMs do not need more schema. They need a clearer business world.',
    introBody: 'What should be delivered to an LLM is not a complete database schema of columns and foreign keys. It is an organized set of business concepts, metric definitions, analytical relationships, and visibility boundaries. Foggy turns that translation into a maintainable modeling workflow.',
    introPoints: [
      ['01', 'Speak in business terms', 'Express fields, enums, and calculations as entities, dimensions, measures, and business definitions.'],
      ['02', 'Hide the join maze', 'Compose multiple TMs through QM so AI reasons over one domain instead of assembling raw joins.'],
      ['03', 'Deliver a usable contract', 'Make models discoverable, describable, validatable, and callable as a stable query boundary.']
    ],
    layerLabel: 'THE MODELING STACK',
    layerTitle: 'TM and QM perform two essential semantic transformations.',
    layerBody: 'TM establishes domain semantic units. QM composes those units into a business model for real questions. The LLM primarily sees QM, not the raw database tables.',
    layers: [
      ['TM', 'Domain semantic units', 'Map physical tables, fields, and basic relationships into entities, dimensions, measures, and business definitions.', 'Schema → domain semantics', withBase('/en/dataset-model/tm-qm/tm-syntax.html')],
      ['QM', 'Focused business model', 'Compose multiple TMs, encapsulate semantic joins, and define the dimensions and measures available for analysis.', 'Multiple TMs → business domain', withBase('/en/dataset-model/tm-qm/qm-syntax.html')],
      ['MCP', 'Model delivery for LLMs', 'Let AI discover accessible QMs, read model descriptions, and submit structured queries.', 'Business model → AI tools', withBase('/en/mcp/tools/overview.html')]
    ],
    layerLinkText: 'Read the model reference',
    exampleLabel: 'FROM TABLES TO A DOMAIN MODEL',
    exampleTitle: 'One sales question rests on a deliberately organized domain model.',
    exampleBody: 'Foggy does not ask the LLM to remember how orders, order items, customers, and products connect. It only needs to understand the business concepts exposed by the Sales Analysis QM.',
    example: {
      sourceLabel: 'Physical tables',
      sourceItems: ['t_order.customer_id', 't_order_item.amount', 't_order.created_at', 't_product.category'],
      tmLabel: 'TM domain semantics',
      tmItems: ['Customer', 'Sales amount', 'Order date', 'Product category'],
      qmLabel: 'QM analysis surface',
      qmItems: ['Dimensions: region / product / month', 'Measures: sales / orders / average order value', 'Relationships: encapsulated by the model'],
      question: 'Show monthly sales by region, ordered from highest to lowest.'
    },
    architectureLabel: 'ARCHITECTURE',
    architectureTitle: 'Give every layer the semantic responsibility it should own.',
    architecture: [
      ['01', 'Physical Schema', 'Tables, fields, raw relationships', 'The data source provides facts, but should not become the LLM’s cognitive interface.'],
      ['02', 'TM', 'Domain semantic units', 'Translate physical structure into entities, dimensions, measures, and definitions.'],
      ['03', 'QM', 'Focused business model', 'Compose across TMs, hide physical joins, and narrow the analysis surface.'],
      ['04', 'MCP + Query DSL', 'Model delivery and query contract', 'Let the LLM discover models, read descriptions, and submit structured queries with evidence.'],
      ['05', 'Runtime', 'Validation, execution, and governance', 'Handle permissions, dialects, query execution, and traceability.']
    ],
    lifecycleLabel: 'MODEL-TO-ANSWER',
    lifecycleTitle: 'From modeling to answers, AI stays inside the business vocabulary.',
    lifecycle: [
      ['01', 'Inspect the source', 'Inventory tables, fields, enums, and raw relationships to define the business domain.', withBase('/en/dataset-model/guide/introduction.html')],
      ['02', 'Build TM', 'Turn source objects into explainable entities, dimensions, measures, and foundational definitions.', withBase('/en/dataset-model/tm-qm/tm-syntax.html')],
      ['03', 'Compose QM', 'Connect TMs semantically and shape a unified model for sales, customer, or operational analysis.', withBase('/en/dataset-model/tm-qm/qm-syntax.html')],
      ['04', 'Deliver to the LLM', 'Let AI discover and read the QM, then submit a structured query through MCP and Query DSL.', withBase('/en/mcp/tools/metadata.html')],
      ['05', 'Validate and execute', 'Runtime applies governance, executes the query, and returns explainable evidence.', withBase('/en/whitepaper/v2.0/')]
    ],
    docsLabel: 'PUBLIC CONTRACTS / STABLE 9.2.0',
    docsTitle: 'Start with semantic modeling. Then let AI use the model.',
    docsBody: 'The v1.0 and v2.0 public contracts remain stable. v3.0 is still Draft / Not Frozen. Implementation manuals and version materials will be published only within the confirmed public scope.',
    docs: [
      ['TM/QM Modeling Guide', withBase('/en/dataset-model/guide/concepts.html')],
      ['TM Syntax Reference', withBase('/en/dataset-model/tm-qm/tm-syntax.html')],
      ['QM Syntax Reference', withBase('/en/dataset-model/tm-qm/qm-syntax.html')],
      ['v2.0 Whitepaper', withBase('/en/whitepaper/v2.0/')],
      ['MCP Tool Reference', withBase('/en/mcp/tools/overview.html')]
    ]
  }
})
</script>

<template>
  <div class="foggy-home" :class="content.className">
    <section class="foggy-hero" aria-labelledby="foggy-home-title">
      <div class="foggy-hero-copy">
        <div class="foggy-kicker">{{ content.kicker }}</div>
        <h1 id="foggy-home-title">{{ content.h1 }}</h1>
        <p class="foggy-lead">{{ content.lead }}</p>
        <div class="foggy-actions">
          <a
            v-for="action in content.actions"
            :key="action.text"
            class="foggy-button"
            :class="action.kind"
            :href="action.href"
            :target="action.external ? '_blank' : undefined"
            :rel="action.external ? 'noreferrer' : undefined"
          >{{ action.text }}</a>
        </div>
        <div class="foggy-hero-meta">
          <span v-for="item in content.heroMeta" :key="item">{{ item }}</span>
        </div>
      </div>

      <div class="foggy-hero-visual" aria-label="Schema to domain model to LLM flow">
        <div class="foggy-model-canvas">
          <div class="foggy-canvas-top">
            <span class="foggy-canvas-mark">●</span>
            <span>{{ content.heroVisual.eyebrow }}</span>
            <b>MODEL FIRST</b>
          </div>
          <div class="foggy-canvas-flow">
            <div class="foggy-flow-node foggy-flow-source">
              <span class="foggy-flow-label">{{ content.heroVisual.sourceLabel }}</span>
              <strong>{{ content.heroVisual.sourceName }}</strong>
              <div class="foggy-code-list">
                <span v-for="item in content.heroVisual.sourceItems" :key="item">{{ item }}</span>
              </div>
            </div>
            <div class="foggy-flow-arrow"><i></i><b>map</b></div>
            <div class="foggy-flow-node foggy-flow-tm">
              <span class="foggy-flow-label">{{ content.heroVisual.tmLabel }}</span>
              <strong>{{ content.heroVisual.tmName }}</strong>
              <div class="foggy-chip-list">
                <span v-for="item in content.heroVisual.tmItems" :key="item">{{ item }}</span>
              </div>
            </div>
            <div class="foggy-flow-arrow"><i></i><b>compose</b></div>
            <div class="foggy-flow-node foggy-flow-qm">
              <span class="foggy-flow-label">{{ content.heroVisual.qmLabel }}</span>
              <strong>{{ content.heroVisual.qmName }}</strong>
              <div class="foggy-qm-fields">
                <span v-for="item in content.heroVisual.qmItems" :key="item">{{ item }}</span>
              </div>
            </div>
          </div>
          <div class="foggy-canvas-query">
            <span>{{ content.heroVisual.llmLabel }}</span>
            <strong>“{{ content.heroVisual.llmText }}”</strong>
            <em>→ QM</em>
          </div>
          <p class="foggy-canvas-footer">{{ content.heroVisual.footer }}</p>
        </div>
      </div>
    </section>

    <section class="foggy-proof" aria-label="Foggy capabilities">
      <div v-for="item in content.proof" :key="item[0]">
        <strong>{{ item[0] }}</strong>
        <span>{{ item[1] }}</span>
      </div>
    </section>

    <section class="foggy-section foggy-intro">
      <div class="foggy-section-head foggy-intro-head">
        <span class="foggy-section-label">{{ content.introLabel }}</span>
        <h2>{{ content.introTitle }}</h2>
        <p>{{ content.introBody }}</p>
      </div>
      <div class="foggy-intro-points">
        <article v-for="item in content.introPoints" :key="item[0]">
          <span>{{ item[0] }}</span>
          <h3>{{ item[1] }}</h3>
          <p>{{ item[2] }}</p>
        </article>
      </div>
    </section>

    <section class="foggy-section foggy-layer-section">
      <div class="foggy-section-head">
        <span class="foggy-section-label">{{ content.layerLabel }}</span>
        <h2>{{ content.layerTitle }}</h2>
        <p>{{ content.layerBody }}</p>
      </div>
      <div class="foggy-layer-grid">
        <a v-for="item in content.layers" :key="item[0]" class="foggy-layer-card" :href="item[4]">
          <div class="foggy-layer-top">
            <strong>{{ item[0] }}</strong>
            <span>{{ item[3] }}</span>
          </div>
          <h3>{{ item[1] }}</h3>
          <p>{{ item[2] }}</p>
          <span class="foggy-card-link">{{ content.layerLinkText }} <b>↗</b></span>
        </a>
      </div>
    </section>

    <section class="foggy-section foggy-example-section">
      <div class="foggy-section-head">
        <span class="foggy-section-label">{{ content.exampleLabel }}</span>
        <h2>{{ content.exampleTitle }}</h2>
        <p>{{ content.exampleBody }}</p>
      </div>
      <div class="foggy-example-board">
        <div class="foggy-example-column foggy-example-source">
          <span class="foggy-example-label">{{ content.example.sourceLabel }}</span>
          <code v-for="item in content.example.sourceItems" :key="item">{{ item }}</code>
        </div>
        <div class="foggy-example-bridge"><span>TM</span><i></i><span>QM</span></div>
        <div class="foggy-example-column foggy-example-semantic">
          <span class="foggy-example-label">{{ content.example.tmLabel }}</span>
          <span v-for="item in content.example.tmItems" :key="item">{{ item }}</span>
        </div>
        <div class="foggy-example-bridge"><span>compose</span><i></i></div>
        <div class="foggy-example-column foggy-example-qm">
          <span class="foggy-example-label">{{ content.example.qmLabel }}</span>
          <span v-for="item in content.example.qmItems" :key="item">{{ item }}</span>
        </div>
        <div class="foggy-example-question">
          <span>LLM QUESTION</span>
          <strong>“{{ content.example.question }}”</strong>
        </div>
      </div>
    </section>

    <section class="foggy-section foggy-architecture-section">
      <div class="foggy-section-head">
        <span class="foggy-section-label">{{ content.architectureLabel }}</span>
        <h2>{{ content.architectureTitle }}</h2>
      </div>
      <div class="foggy-architecture">
        <div class="foggy-architecture-rail" aria-label="Foggy architecture layers">
          <div v-for="item in content.architecture" :key="item[0]" class="foggy-architecture-layer">
            <span class="foggy-architecture-number">{{ item[0] }}</span>
            <div>
              <strong>{{ item[1] }}</strong>
              <span>{{ item[2] }}</span>
            </div>
          </div>
        </div>
        <div class="foggy-architecture-notes">
          <article v-for="item in content.architecture" :key="item[0] + item[1]">
            <span>{{ item[0] }}</span>
            <p>{{ item[3] }}</p>
          </article>
        </div>
      </div>
    </section>

    <section class="foggy-section">
      <div class="foggy-section-head">
        <span class="foggy-section-label">{{ content.lifecycleLabel }}</span>
        <h2>{{ content.lifecycleTitle }}</h2>
      </div>
      <div class="foggy-lifecycle">
        <a v-for="item in content.lifecycle" :key="item[0]" :href="item[3]">
          <span>{{ item[0] }}</span>
          <h3>{{ item[1] }}</h3>
          <p>{{ item[2] }}</p>
          <b>↗</b>
        </a>
      </div>
    </section>

    <section class="foggy-section foggy-docs-band">
      <div>
        <span class="foggy-section-label">{{ content.docsLabel }}</span>
        <h2>{{ content.docsTitle }}</h2>
        <p>{{ content.docsBody }}</p>
      </div>
      <div class="foggy-doc-links">
        <a v-for="item in content.docs" :key="item[0]" :href="item[1]">{{ item[0] }} <b>↗</b></a>
      </div>
    </section>
  </div>
</template>
