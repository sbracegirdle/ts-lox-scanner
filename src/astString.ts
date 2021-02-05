import {
  Literal,
  Unary,
  Binary,
  Grouping,
  Expression,
  isGrouping,
  isUnary,
  isBinary,
  isLiteral,
  isStringLiteral,
  StringLiteral,
  isNumberLiteral,
  NumberLiteral,
} from './grammar'
import {match} from './match'

export const literalToAstString = (exp: Literal): string =>
  match(exp)
    .on(isStringLiteral, exp => (exp as StringLiteral).textValue)
    .on(isNumberLiteral, exp => String((exp as NumberLiteral).numValue).toString())
    .otherwise(() => exp as string) as string
export const unaryToAstString = (exp: Unary): string => `(${exp.prefix} ${expressionToAstString(exp.expression)})`
export const binaryToAstString = (exp: Binary): string =>
  `(${exp.operator} ${expressionToAstString(exp.left)} ${expressionToAstString(exp.right)})`
export const groupingToAstString = (exp: Grouping): string => `(group ${expressionToAstString(exp.wrapped)})`

export const expressionToAstString = (exp: Expression): string =>
  match(exp)
    .on(isGrouping, exp => groupingToAstString(exp as Grouping))
    .on(isUnary, exp => unaryToAstString(exp as Unary))
    .on(isBinary, exp => binaryToAstString(exp as Binary))
    .on(isLiteral, exp => literalToAstString(exp as Literal))
    .otherwise(() => 'UNKNOWN') as string
