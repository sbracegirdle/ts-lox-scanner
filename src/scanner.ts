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

export type Token = {
  readonly type: TokenType
  readonly text?: string | undefined
  readonly start: number
  readonly length: number
  // line: number
}

const isChar = (expected: string) => (context: Context): boolean => context.chr === expected
const isChars = (expected: string) => (context: Context): boolean =>
  context.chars.slice(context.idx, context.idx + expected.length).join('') === expected

const tokenOf = (type: TokenType, length = 1) => (context: Context): Token => ({
  type,
  length,
  start: context.idx,
  // line: context.line
})

type Context = {
  readonly tokens: readonly Token[]
  readonly comment: boolean
  readonly line: number
  readonly lineStart: number
  readonly error?: Error
  readonly source: string
  readonly chars: readonly string[]
  readonly idx: number
  readonly chr: string
}

const isTrue = (): boolean => true
const isFalse = (): boolean => false

const isWhitespace = (context: Context): boolean =>
  match<Context, boolean>(context)
    .on(isChar('\n'), isTrue)
    .on(isChar('\r'), isTrue)
    .on(isChar('\t'), isTrue)
    .on(isChar(' '), isTrue)
    .otherwise(isFalse)

const isDigit = (context: Context): boolean => context.chr >= '0' && context.chr <= '9'
const isDigitOrDot = (context: Context): boolean => isDigit(context) || context.chr === '.'
const isAlpha = (context: Context): boolean =>
  (context.chr >= 'a' && context.chr <= 'z') || (context.chr >= 'A' && context.chr <= 'Z') || context.chr == '_'
const isAlphaNumeric = (context: Context): boolean => isAlpha(context) || isDigit(context)
type genericFunction<I, O> = (i: I) => O
const not = <I extends unknown>(f: genericFunction<I, boolean>): genericFunction<I, boolean> => (i: I): boolean => !f(i)

const getNextMatching = (context: Context, fn: (context: Context) => boolean): number =>
  context.chars
    .slice(context.idx)
    .reduce((end, current, idx) => (end >= 0 ? end : fn({...context, chr: current}) ? idx : -1), -1)

const getTextMatching = (context: Context, fn: (context: Context) => boolean): string => {
  const end = getNextMatching(context, not(fn))
  return context.source.substring(context.idx, end >= 0 ? context.idx + end : context.idx + context.source.length)
}

const sanitiseNumber = (number: string): string =>
  number
    .split('.')
    .map((part, idx) => (idx < 2 ? part : null))
    .filter(a => !!a)
    .join('.')

const getStringEnd = (context: Context): number => context.source.substring(context.idx + 1).indexOf('"')

const getStringText = (context: Context, stringEnd: number): string =>
  context.source.substring(context.idx + 1, context.idx + 1 + stringEnd)

const stringTokenOf = (context: Context): Token | Error => {
  const stringEnd = getStringEnd(context)
  const text = stringEnd >= 0 ? getStringText(context, stringEnd) : undefined

  return text !== undefined
    ? {
        type: TokenType.STRING,
        text,
        start: context.idx,
        length: text.length + 2,
      }
    : Error(
        `Unterminated string starting at line ${context.line}:\n\n   ${context.source.substring(
          context.lineStart,
          context.idx + 1,
        )}`,
      )
}

const numberTokenOf = (context: Context): Token => {
  const text = sanitiseNumber(getTextMatching(context, isDigitOrDot))

  return {
    type: TokenType.NUMBER,
    text,
    start: context.idx,
    length: text.length,
  }
}

const identifierTokenOf = (context: Context): Token => {
  const text = getTextMatching(context, isAlphaNumeric)
  return {
    type: TokenType.IDENTIFIER,
    text,
    start: context.idx,
    length: text.length,
  }
}

const hasErrored = (context: Context): boolean => !!context.error

const isWithinPreviousToken = (context: Context): boolean => {
  const prev = context.tokens[context.tokens.length - 1]
  return prev && context.idx < prev.start + prev.length
}
const isNewLine = (context: Context): boolean => isChar('\n')(context)
const isWithinComment = (context: Context): boolean => !!context.comment
type ContextConditional = (context: Context) => boolean
const or = (a: ContextConditional, b: ContextConditional) => (context: Context) => a(context) || b(context)
const keepSameContext = (context: Context): Context => context
const getUnexpectedCharError = (context: Context): Error =>
  Error(
    `Unexpected character ${context.chr} at line ${context.line}:\n\n   ${context.source.substring(
      context.lineStart,
      context.idx + 1,
    )}`,
  )
const isStartOfComment = (context: Context): boolean => isChars('//')(context)

const getToken = (context: Context): Error | Token => {
  return match<Context, Token | Error>(context)
    .on(isChar('('), tokenOf(TokenType.LEFT_PAREN))
    .on(isChar(')'), tokenOf(TokenType.RIGHT_PAREN))
    .on(isChar('{'), tokenOf(TokenType.LEFT_BRACE))
    .on(isChar('}'), tokenOf(TokenType.RIGHT_BRACE))
    .on(isChar(','), tokenOf(TokenType.COMMA))
    .on(isChar('.'), tokenOf(TokenType.DOT))
    .on(isChar('-'), tokenOf(TokenType.MINUS))
    .on(isChar('+'), tokenOf(TokenType.PLUS))
    .on(isChar(';'), tokenOf(TokenType.SEMICOLON))
    .on(isChar('*'), tokenOf(TokenType.STAR))
    .on(isChars('!='), tokenOf(TokenType.BANG_EQUAL, 2))
    .on(isChar('!'), tokenOf(TokenType.BANG))
    .on(isChars('=='), tokenOf(TokenType.EQUAL_EQUAL, 2))
    .on(isChar('='), tokenOf(TokenType.EQUAL))
    .on(isChars('<='), tokenOf(TokenType.LESS_EQUAL, 2))
    .on(isChar('<'), tokenOf(TokenType.LESS))
    .on(isChars('>='), tokenOf(TokenType.GREATER_EQUAL, 2))
    .on(isChar('>'), tokenOf(TokenType.GREATER))
    .on(isChar('/'), tokenOf(TokenType.SLASH))
    .on(isChar('"'), stringTokenOf)
    .on(isDigit, numberTokenOf)
    .on(isChars('and'), tokenOf(TokenType.AND, 3))
    .on(isChars('class'), tokenOf(TokenType.CLASS, 5))
    .on(isChars('else'), tokenOf(TokenType.ELSE, 4))
    .on(isChars('false'), tokenOf(TokenType.FALSE, 5))
    .on(isChars('for'), tokenOf(TokenType.FOR, 3))
    .on(isChars('fun'), tokenOf(TokenType.FUN, 3))
    .on(isChars('if'), tokenOf(TokenType.IF, 2))
    .on(isChars('nil'), tokenOf(TokenType.NIL, 3))
    .on(isChars('or'), tokenOf(TokenType.OR, 2))
    .on(isChars('print'), tokenOf(TokenType.PRINT, 5))
    .on(isChars('return'), tokenOf(TokenType.RETURN, 6))
    .on(isChars('super'), tokenOf(TokenType.SUPER, 5))
    .on(isChars('this'), tokenOf(TokenType.THIS, 4))
    .on(isChars('true'), tokenOf(TokenType.TRUE, 4))
    .on(isChars('var'), tokenOf(TokenType.VAR, 3))
    .on(isChars('while'), tokenOf(TokenType.WHILE, 5))
    .on(isAlphaNumeric, identifierTokenOf)
    .otherwise(getUnexpectedCharError)
}

export const scanner = (source: string): Error | readonly Token[] => {
  const chars = [...source]

  const context: Context = chars.reduce(
    (context: Context, chr, idx) => {
      return match<Context, Context>({...context, chr, idx})
        .on(hasErrored, keepSameContext)
        .on(isWithinPreviousToken, keepSameContext)
        .on(isNewLine, context => ({
          ...context,
          line: context.line + 1,
          lineStart: context.idx + 1,
          comment: false,
        }))
        .on(or(isWithinComment, isWhitespace), keepSameContext)
        .on(isStartOfComment, context => ({
          ...context,
          comment: true,
        }))
        .otherwise(context => {
          const token: Token | Error = getToken(context)

          return token instanceof Error
            ? {
                ...context,
                error: token,
              }
            : {
                ...context,
                tokens: context.tokens.concat(token),
              }
        })
    },
    {tokens: [], line: 1, lineStart: 0, comment: false, source, chars, chr: '', idx: -1},
  )
  return context.error || context.tokens
}
