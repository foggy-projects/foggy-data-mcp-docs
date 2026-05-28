<script setup>
import { computed } from 'vue'
import { useRoute, withBase } from 'vitepress'

defineProps({
  screenMenu: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()
const siteBase = '/foggy-data-mcp-docs'

const currentPath = computed(() => {
  const path = route.path || '/'
  return path.startsWith(`${siteBase}/`) ? path.slice(siteBase.length) : path
})

const currentLang = computed(() => currentPath.value.startsWith('/zh/') ? 'zh' : 'en')

const zhTarget = computed(() => {
  const path = currentPath.value

  if (path.startsWith('/zh/')) {
    return path
  }

  if (path.startsWith('/en/')) {
    return `/zh/${path.slice(4)}`
  }

  return '/zh/'
})

const enTarget = computed(() => {
  const path = currentPath.value

  if (path.startsWith('/en/')) {
    return path
  }

  if (path.startsWith('/zh/whitepaper/')) {
    return '/'
  }

  if (path === '/zh/' || path === '/zh') {
    return '/'
  }

  if (path.startsWith('/zh/')) {
    return `/en/${path.slice(4)}`
  }

  return '/'
})
</script>

<template>
  <div
    class="foggy-language-switch"
    :class="{ 'is-screen-menu': screenMenu }"
    role="group"
    aria-label="Language"
  >
    <a
      :href="withBase(zhTarget)"
      :aria-current="currentLang === 'zh' ? 'true' : undefined"
      :class="{ active: currentLang === 'zh' }"
    >
      中文
    </a>
    <a
      :href="withBase(enTarget)"
      :aria-current="currentLang === 'en' ? 'true' : undefined"
      :class="{ active: currentLang === 'en' }"
    >
      EN
    </a>
  </div>
</template>
