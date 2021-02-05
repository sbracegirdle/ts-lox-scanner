
export type NumberLiteral = {
  readonly numValue: number
}

export type StringLiteral = {
  readonly textValue: string
}

export type Literal = NumberLiteral | StringLiteral | 'true' | 'false' | 'nil'

export type Grouping = {
  readonly wrapped: Expression
}

export type Unary = {
  readonly prefix: '-' | '!'
  readonly expression: Expression
}

export type Binary = {
  readonly left: Expression
  readonly operator: Operator
  readonly right: Expression
}

export type Operator = '==' | '!=' | '<' | '<=' | '>' | '>=' | '+' | '-' | '*' | '/'

export type Expression = Literal | Grouping | Unary | Binary

export const isNumberLiteral = (exp: Expression): exp is NumberLiteral => (exp as NumberLiteral).numValue !== undefined
export const isStringLiteral = (exp: Expression): exp is NumberLiteral => (exp as StringLiteral).textValue !== undefined
export const isLiteral = (exp: Expression): exp is Literal =>
  isNumberLiteral(exp) || isStringLiteral(exp) || exp === 'true' || exp === 'false' || exp === 'nil'
export const isGrouping = (exp: Expression): exp is Grouping => (exp as Grouping).wrapped !== undefined
export const isUnary = (exp: Expression): exp is Unary => (exp as Unary).prefix !== undefined
export const isBinary = (exp: Expression): exp is Binary => (exp as Binary).left !== undefined


