import { parse } from 'acorn'

const ScriptParser = {
  parse (source) {
    const ast = parse(source, { sourceType: 'module' })

    return this.walk(ast)
  },

  walk (ast) {
    const props = []
    const rest = []

    ast.body.forEach(declaration => {
      if (declaration.type === 'ExportNamedDeclaration') {
        this.addExport(props, declaration.declaration)
      } else {
        rest.push(declaration)
      }
    })

    return { props, rest }
  },

  addExport (props, variableDeclaration) {
    variableDeclaration.declarations.forEach(decl => {
      props.push(decl.id.name)
    })
  }
}

export default ScriptParser
