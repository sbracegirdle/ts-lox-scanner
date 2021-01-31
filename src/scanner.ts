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
  start: number
  length: number
  // line: number
}

const isChar = (expected: string) => (chr: string): boolean => chr === expected
const isChars = (expected: string) => (chars: string[], idx: number) => (): boolean =>
  chars.slice(idx, idx + expected.length).join('') === expected

const tokenOf = (type: TokenType, start: number, length = 1) => (): Token => ({
  type,
  start,
  length,
})

interface Context {
  tokens: Token[]
  comment: boolean
  line: number
  lineStart: number
}

const isTrue = () => true
const isFalse = () => false

const isWhitespace = (chr: string) =>
  match<string, boolean>(chr)
    .on(isChar('\n'), isTrue)
    .on(isChar('\r'), isTrue)
    .on(isChar('\t'), isTrue)
    .on(isChar(' '), isTrue)
    .otherwise(isFalse)

export const scanner = (source: string): Token[] => {
  const chars = [...source]
  const context: Context = chars.reduce(
    (c: Context, chr, idx) => {
      const prev = c.tokens[c.tokens.length - 1]
      if (prev && idx < prev.start + prev.length) {
        // Still within previous token
        return c
      }
      if (isChar('\n')(chr)) {
        // new line
        return {
          ...c,
          line: c.line + 1,
          lineStart: idx + 1,
          comment: false,
        }
      } else if (c.comment || isWhitespace(chr)) {
        return c
      } else if (isChars('//')(chars, idx)()) {
        return {
          ...c,
          comment: true,
        }
      } else {
        const token: Token = match<string, Token>(chr)
          .on(isChar('('), tokenOf(TokenType.LEFT_PAREN, idx))
          .on(isChar(')'), tokenOf(TokenType.RIGHT_PAREN, idx))
          .on(isChar('{'), tokenOf(TokenType.LEFT_BRACE, idx))
          .on(isChar('}'), tokenOf(TokenType.RIGHT_BRACE, idx))
          .on(isChar(','), tokenOf(TokenType.COMMA, idx))
          .on(isChar('.'), tokenOf(TokenType.DOT, idx))
          .on(isChar('-'), tokenOf(TokenType.MINUS, idx))
          .on(isChar('+'), tokenOf(TokenType.PLUS, idx))
          .on(isChar(';'), tokenOf(TokenType.SEMICOLON, idx))
          .on(isChar('*'), tokenOf(TokenType.STAR, idx))
          .on(isChars('!=')(chars, idx), tokenOf(TokenType.BANG_EQUAL, idx, 2))
          .on(isChar('!'), tokenOf(TokenType.BANG, idx))
          .on(isChars('==')(chars, idx), tokenOf(TokenType.EQUAL_EQUAL, idx, 2))
          .on(isChar('='), tokenOf(TokenType.EQUAL, idx))
          .on(isChars('<=')(chars, idx), tokenOf(TokenType.LESS_EQUAL, idx, 2))
          .on(isChar('<'), tokenOf(TokenType.LESS, idx))
          .on(isChars('>=')(chars, idx), tokenOf(TokenType.GREATER_EQUAL, idx, 2))
          .on(isChar('>'), tokenOf(TokenType.GREATER, idx))
          .on(isChar('/'), tokenOf(TokenType.SLASH, idx))
          .otherwise(chr => {
            throw Error(
              `Unexpected character ${chr} at line ${c.line}:\n\n   ${source.substring(c.lineStart, idx + 1)}`,
            )
          })
        return {
          ...c,
          tokens: c.tokens.concat(token),
        }
      }
    },
    {tokens: [], line: 1, lineStart: 0, comment: false},
  )
  return context.tokens
}
