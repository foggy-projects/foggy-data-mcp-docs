import DefaultTheme from 'vitepress/theme'
import DownloadButton from './components/DownloadButton.vue'
import HomeLanding from './components/HomeLanding.vue'
import './custom.css'

function installWhitepaperTranslationGuard() {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return
  }

  const update = () => {
    document.documentElement.classList.toggle(
      'foggy-hide-translations',
      window.location.pathname.includes('/zh/whitepaper/')
    )
  }

  const wrapHistoryMethod = (name) => {
    const original = window.history[name]

    window.history[name] = function (...args) {
      const result = original.apply(this, args)
      queueMicrotask(update)
      return result
    }
  }

  update()
  window.addEventListener('popstate', update)
  wrapHistoryMethod('pushState')
  wrapHistoryMethod('replaceState')
}

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    installWhitepaperTranslationGuard()
    app.component('DownloadButton', DownloadButton)
    app.component('HomeLanding', HomeLanding)
  }
}
