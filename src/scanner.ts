import {match} from './match'

export enum TokenType {
  // Single-character tokens
  LEFT_PAREN,
  RIGHT_PAREN,
  LEFT_BRACE,
  RIGHT_BRACE,
  COMMA,
  DOT,
  MINUS,
  PLUS,
  SEMICOLON,
  SLASH,
  STAR,

  // One or two character tokens
  BANG,
  BANG_EQUAL,
  EQUAL,
  EQUAL_EQUAL,
  GREATER,
  GREATER_EQUAL,
  LESS,
  LESS_EQUAL,

  // Literals
  IDENTIFIER,
  STRING,
  NUMBER,

  // Keywords
  AND,
  CLASS,
  ELSE,
  FALSE,
  FUN,
  FOR,
  IF,
  NIL,
  OR,
  PRINT,
  RETURN,
  SUPER,
  THIS,
  TRUE,
  VAR,
  WHILE,

  EOF,
}

export interface Token {
  type: TokenType
  text?: string | undefined
  // line: number
}

const isChar = (expected: string) => (chr: string): boolean => chr === expected

export const scanner = (source: string): Token[] => {
  return [...source].reduce((tokens: Token[], chr) => {
    const token: Token = match<string, Token>(chr)
      .on(
        isChar('('),
        (): Token => ({
          type: TokenType.LEFT_PAREN,
        }),
      )
      .on(
        isChar(')'),
        (): Token => ({
          type: TokenType.RIGHT_PAREN,
        }),
      )
      .on(
        isChar('{'),
        (): Token => ({
          type: TokenType.LEFT_BRACE,
        }),
      )
      .on(
        isChar('}'),
        (): Token => ({
          type: TokenType.RIGHT_BRACE,
        }),
      )
      .otherwise(chr => {
        // TODO line numbers
        throw Error(`Unexpected character ${chr}`)
      })
    return tokens.concat(token)
  }, [])
}
