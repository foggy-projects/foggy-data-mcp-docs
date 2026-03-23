import DefaultTheme from 'vitepress/theme'
import DownloadButton from './components/DownloadButton.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('DownloadButton', DownloadButton)
  }
}
