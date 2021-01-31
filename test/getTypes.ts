import {Token, TokenType} from '../src/scanner'

export function getTypes(result: readonly Token[]): readonly TokenType[] {
  return result.map(i => i.type)
}
