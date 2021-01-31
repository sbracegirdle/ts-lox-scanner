import {Token, TokenType} from '../src/scanner'

export function getIdentifiers(result: readonly Token[]): readonly string[] {
  return [...new Set(result.filter(i => i.type === TokenType.IDENTIFIER).map(i => i.text || ''))]
}
