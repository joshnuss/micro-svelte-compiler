const TagParser = {
  parse (tags) {
    const nodes = []
    const listeners = []

    this.parseTags(nodes, listeners, null, 0, tags)
    this.removeTrailingWhitespace(nodes)

    return { nodes, listeners }
  },

  parseTags (nodes, listeners, parent, index, tags) {
    tags.forEach(tag => {
      if (tag.nodeName === '#text') {
        index = this.parseText(nodes, index, parent, tag)
      } else {
        index = this.parseElement(nodes, listeners, index, parent, tag)
      }
    })

    return index
  },

  parseText (nodes, index, parent, tag) {
    let text = tag.value
    let startBracket, endBracket

    while (true) {
      startBracket = text.search('{')

      if (startBracket === 0) {
        endBracket = text.search('}')
        index = this.addBinding(nodes, index, parent, text.substr(1, endBracket - 1))
        text = text.substr(endBracket + 1)
        if (!text) break
      } else if (startBracket < 0) {
        index = this.addText(nodes, index, parent, text)
        break
      } else {
        index = this.addText(nodes, index, parent, text.substr(0, startBracket))
        text = text.substr(startBracket)
      }
    }

    return index
  },

  addText (nodes, index, parent, value) {
    if (index === 0 && value.trim() === '') return index

    nodes.push({
      index,
      type: 'text',
      value,
      parent
    })

    return index + 1
  },

  addBinding (nodes, index, parent, name) {
    nodes.push({
      index,
      type: 'binding',
      name,
      parent
    })

    return index + 1
  },

  parseElement (nodes, listeners, index, parent, tag) {
    const attrs = {}

    tag.attrs.forEach(attr => {
      if (attr.name.match(/^on:/)) {
        listeners.push({
          index,
          event: attr.name.split(':')[1],
          handler: attr.value
        })
      } else {
        attrs[attr.name] = attr.value
      }
    })

    nodes.push({
      index,
      type: 'element',
      attrs,
      name: tag.nodeName,
      parent
    })

    return this.parseTags(nodes, listeners, index, index + 1, tag.childNodes)
  },

  removeTrailingWhitespace (nodes) {
    let i = nodes.length - 1
    let node = nodes[i]

    while (node.parent === null && node.type === 'text' && node.value.trim() === '') {
      nodes.splice(i, 1)

      i -= 1
      node = nodes[i]
    }
  }
}

export default TagParser
