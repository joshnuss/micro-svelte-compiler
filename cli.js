#!/usr/bin/env babel-node
import FileParser from './src/FileParser'
import ScriptParser from './src/ScriptParser'
import TagParser from './src/TagParser'
import ComponentGenerator from './src/ComponentGenerator'
import CodeFormatter from './src/CodeFormatter'

const { code, tags } = FileParser.readFile(process.argv[2])
const { props, rest } = ScriptParser.parse(code)
const { nodes, listeners } = TagParser.parse(tags)
const output = ComponentGenerator.generate(props, nodes, listeners, rest)
const formatted = CodeFormatter.format(output)

console.log(formatted)
