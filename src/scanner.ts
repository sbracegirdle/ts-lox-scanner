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

const isDigit = (chr: string) => chr >= '0' && chr <= '9'
const isAlpha = (c: string) => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c == '_'
const isAlphaNumeric = (c: string) => isAlpha(c) || isDigit(c)

const stringTokenOf = (source: string, c: Context, start: number) => (): Token => {
  const stringEnd = source.substring(start + 1).indexOf('"')
  console.log(stringEnd)

  if (stringEnd >= 0) {
    const text = source.substring(start + 1, start + 1 + stringEnd)
    return {
      type: TokenType.STRING,
      text,
      start,
      length: text.length + 2,
    }
  } else {
    throw Error(`Unterminated string starting at line ${c.line}:\n\n   ${source.substring(c.lineStart, start + 1)}`)
  }
}

const numberTokenOf = (source: string, chars: string[], start: number) => (): Token => {
  let numberEnd = start
  while (isDigit(chars[numberEnd])) numberEnd++
  if (chars[numberEnd] === '.' && isDigit(chars[numberEnd + 1])) numberEnd++
  while (isDigit(chars[numberEnd])) numberEnd++

  const text = source.substring(start, start + numberEnd)
  return {
    type: TokenType.NUMBER,
    text,
    start,
    length: text.length,
  }
}

const identifierTokenOf = (source: string, chars: string[], start: number) => (): Token => {
  let idEnd = start
  while (isAlphaNumeric(chars[idEnd])) idEnd++

  const text = source.substring(start, start + idEnd)
  return {
    type: TokenType.IDENTIFIER,
    text,
    start,
    length: text.length,
  }
}

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
          .on(isChar('"'), stringTokenOf(source, c, idx))
          .on(isDigit, numberTokenOf(source, chars, idx))
          .on(isChars('and')(chars, idx), tokenOf(TokenType.AND, idx, 3))
          .on(isChars('class')(chars, idx), tokenOf(TokenType.CLASS, idx, 5))
          .on(isChars('else')(chars, idx), tokenOf(TokenType.ELSE, idx, 4))
          .on(isChars('false')(chars, idx), tokenOf(TokenType.FALSE, idx, 5))
          .on(isChars('for')(chars, idx), tokenOf(TokenType.FOR, idx, 3))
          .on(isChars('fun')(chars, idx), tokenOf(TokenType.FUN, idx, 3))
          .on(isChars('if')(chars, idx), tokenOf(TokenType.IF, idx, 2))
          .on(isChars('nil')(chars, idx), tokenOf(TokenType.NIL, idx, 3))
          .on(isChars('or')(chars, idx), tokenOf(TokenType.OR, idx, 2))
          .on(isChars('print')(chars, idx), tokenOf(TokenType.PRINT, idx, 5))
          .on(isChars('return')(chars, idx), tokenOf(TokenType.RETURN, idx, 6))
          .on(isChars('super')(chars, idx), tokenOf(TokenType.SUPER, idx, 5))
          .on(isChars('this')(chars, idx), tokenOf(TokenType.THIS, idx, 4))
          .on(isChars('true')(chars, idx), tokenOf(TokenType.TRUE, idx, 4))
          .on(isChars('var')(chars, idx), tokenOf(TokenType.VAR, idx, 3))
          .on(isChars('while')(chars, idx), tokenOf(TokenType.WHILE, idx, 5))
          .on(isAlphaNumeric, identifierTokenOf(source, chars, idx))
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
