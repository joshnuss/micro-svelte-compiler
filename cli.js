#!/usr/bin/env babel-node
import { parseFragment } from 'parse5'
import { readFileSync } from 'fs'
import { parse as acornParse } from 'acorn'
import { x, b, print } from 'code-red'
import {js as beautifyJS} from 'js-beautify'

const FileParser = {
  readFile(path) {
    const source = readFileSync(process.argv[2], { encoding: "utf8" })
    const fragment = parseFragment(source)

    return this.extract(fragment)
  },

  extract(fragment) {
    const tags = []
    let code = ""

    fragment.childNodes.forEach(node => {
      if (node.nodeName == 'script') {
        code += node.childNodes[0].value
      } else {
        tags.push(node)
      }
    })

    return {code, tags}
  }
}

const ScriptParser = {
  parse(source) {
    const ast = acornParse(source, {sourceType: 'module'})

    return this.walk(ast)
  },

  walk(ast) {
    const props = []
    const rest = []

    ast.body.forEach(declaration => {
      if (declaration.type == 'ExportNamedDeclaration') {
        this.addExport(props, declaration.declaration)
      } else {
        rest.push(declaration)
      }
    })

    return {props, rest}
  },

  addExport(props, variableDeclaration) {
    variableDeclaration.declarations.forEach(decl => {
      props.push(decl.id.name)
    })
  }
}

const TagParser = {
  parse(tags) {
    const nodes = []
    const listeners = []

    this.parseTags(nodes, listeners, null, 0, tags)

    return {nodes, listeners}
  },

  parseTags(nodes, listeners, parent, index, tags) {
    tags.forEach(tag => {
      if (tag.nodeName == '#text') {
        index = this.parseText(nodes, index, parent, tag)
      } else {
        index = this.parseElement(nodes, listeners, index, parent, tag)
      }
    })

    return index
  },

  parseText(nodes, index, parent, tag) {
    let text = tag.value
    let startBracket, endBracket;

    while(true) {
      startBracket = text.search("{")

      if (startBracket == 0) {
        endBracket = text.search("}")
        index = this.addBinding(nodes, index, parent, text.substr(1, endBracket-1))
        text = text.substr(endBracket+1)
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

  addText(nodes, index, parent, value) {
    nodes.push({
      index,
      type: "text",
      value,
      parent,
    })

    return index + 1
  },

  addBinding(nodes, index, parent, name) {
    nodes.push({
      index,
      type: "binding",
      name,
      parent,
    })

    return index + 1
  },

  parseElement(nodes, listeners, index, parent, tag) {
    const attrs = {}

    tag.attrs.forEach(attr => {
      if (attr.name.match(/^on/)) {
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
      type: "element",
      attrs,
      name: tag.nodeName,
      parent,
    })

    return this.parseTags(nodes, listeners, index, index+1, tag.childNodes)
  }
}

const ComponentGenerator = {
  generate(props, nodes, listeners, rest) {
    const varNames = nodes.map(node => ([node.type[0], node.index].join("")))
    const roots = nodes.filter(node => !node.parent)
    const children = nodes.filter(node => node.parent)
    const bindings = nodes.filter(node => node.type == "binding")

    const ast = b`
    export default function component({target, props}) {
      let {${props.join(',')}} = props

      ${rest}

      let ${varNames.join(",")}

      return {
        create() {
          ${nodes.map(node => this.createNodeString(varNames, node)).join("\n")}
          ${nodes.map(node => this.createAttributeStrings(varNames, node)).filter(list => list.length > 0).join("\n")}
          ${listeners.map(listener => `${varNames[listener.index]}.addEventListener("${listener.event}", ${listener.handler})`).join("\n")}
        },
        mount() {
          ${children.map(node => `${varNames[node.parent]}.appendChild(${varNames[node.index]})`).join("\n")}
          ${roots.map(node => `target.append(${varNames[node.index]})`).join("\n")}
        },
        update(changes) {
          ${bindings.map(node => `if (changes.${node.name}) {\n${varNames[node.index]}.data = ${node.name} = changes.${node.name}\n}`).join("\n")}
        },
        detach() {
          ${roots.map(node => `target.removeChild(${varNames[node.index]})`).join("\n")}
        }
      }
    }
    `
    return print(ast).code
  },

  createNodeString(varNames, node) {
    const varName = varNames[node.index]
    switch (node.type) {
      case "binding":
        return `${varName} = document.createTextNode(${node.name})`
      case "element":
        return `${varName} = document.createElement("${node.name}")`
      case "text":
        return `${varName} = document.createTextNode("${node.value.replace(/\n/g, "\\n")}")`
    }
  },

  createAttributeStrings(varNames, node) {
    if (!node.attrs) return []
    const varName = varNames[node.index]

    return Object.entries(node.attrs).map(([name, value]) => `${varName}.setAttribute("${name}", "${value}")`)
  }
}

const CodeFormatter = {
  format(code) {
    return beautifyJS(code, {
      indent_size: "2",
      max_preserve_newlines: "2",
      preserve_newlines: true,
      keep_array_indentation: false,
      break_chained_methods: false,
      indent_scripts: "normal",
      brace_style: "collapse,preserve-inline",
      space_before_conditional: true,
      unescape_strings: false,
      jslint_happy: false,
      end_with_newline: false,
      wrap_line_length: "0",
      indent_inner_html: false,
      comma_first: false,
      e4x: false,
      indent_empty_lines: false
    })
  }
}

const {code, tags} = FileParser.readFile(process.argv[2])
const {props, rest} = ScriptParser.parse(code)
const {nodes, listeners} = TagParser.parse(tags)
const output = ComponentGenerator.generate(props, nodes, listeners, rest)
const formatted = CodeFormatter.format(output)

console.log(formatted)
