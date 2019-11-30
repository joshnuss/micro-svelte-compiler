import { b, print } from 'code-red'

const ComponentGenerator = {
  generate (props, nodes, listeners, rest) {
    const varNames = nodes.map(node => ([node.type[0], node.index].join('')))
    const roots = nodes.filter(node => node.parent === null)
    const children = nodes.filter(node => node.parent !== null)
    const bindings = nodes.filter(node => node.type === 'binding')

    const ast = b`
    export default function component({target, props}) {
      let {${props.join(',')}} = props

      ${rest}

      let ${varNames.join(',')}

      return {
        create() {
          ${nodes.map(node => this.createNodeString(varNames, node)).join('\n')}
          ${nodes.map(node => this.createAttributeStrings(varNames, node)).filter(list => list.length > 0).join('\n')}
          ${listeners.map(listener => `${varNames[listener.index]}.addEventListener("${listener.event}", ${listener.handler})`).join('\n')}
        },
        mount() {
          ${children.map(node => `${varNames[node.parent]}.appendChild(${varNames[node.index]})`).join('\n')}
          ${roots.map(node => `target.append(${varNames[node.index]})`).join('\n')}
        },
        update(changes) {
          ${bindings.map(node => `if (changes.${node.name}) {\n${varNames[node.index]}.data = ${node.name} = changes.${node.name}\n}`).join('\n')}
        },
        detach() {
          ${roots.map(node => `target.removeChild(${varNames[node.index]})`).join('\n')}
        }
      }
    }`

    return print(ast).code
  },

  createNodeString (varNames, node) {
    const varName = varNames[node.index]
    switch (node.type) {
      case 'binding':
        return `${varName} = document.createTextNode(${node.name})`
      case 'element':
        return `${varName} = document.createElement("${node.name}")`
      case 'text':
        return `${varName} = document.createTextNode("${node.value.replace(/\n/g, '\\n')}")`
    }
  },

  createAttributeStrings (varNames, node) {
    if (!node.attrs) return []
    const varName = varNames[node.index]

    return Object.entries(node.attrs).map(([name, value]) => `${varName}.setAttribute("${name}", "${value}")`)
  }
}

export default ComponentGenerator
