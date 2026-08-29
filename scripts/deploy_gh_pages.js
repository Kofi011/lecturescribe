import ghpages from 'gh-pages'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../frontend/dist')

console.log('Publishing dist to gh-pages branch from:', distPath)

ghpages.publish(
  distPath,
  {
    branch: 'gh-pages',
    dotfiles: true,
    message: 'deploy: publish production build to gh-pages',
  },
  (err) => {
    if (err) {
      console.error('gh-pages deployment failed:', err)
      process.exit(1)
    } else {
      console.log('Successfully published to gh-pages branch! ✓')
      process.exit(0)
    }
  }
)
