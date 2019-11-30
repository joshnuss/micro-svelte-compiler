import { parseFragment } from 'parse5'
import { readFileSync } from 'fs'

const FileParser = {
  readFile (path) {
    const source = readFileSync(path, { encoding: 'utf8' })
    const fragment = parseFragment(source)

    return this.extract(fragment)
  },

  extract (fragment) {
    const tags = []
    let code = ''

    fragment.childNodes.forEach(node => {
      if (node.nodeName === 'script') {
        code += node.childNodes[0].value
      } else {
        tags.push(node)
      }
    })

    return { code, tags }
  }
}

export default FileParser
