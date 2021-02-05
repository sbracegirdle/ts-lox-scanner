import {expect} from 'chai'

import {expressionToAstString} from '../../src/astString'
import {Binary} from '../../src/grammar'

/* eslint-disable functional/no-expression-statement */
describe('unit/astString', () => {
  it('should print string as is', () => {
    expect(
      expressionToAstString({
        textValue: 'hello!',
      }),
    ).to.equal('hello!')
  })

  it('should print number as is', () => {
    expect(
      expressionToAstString({
        numValue: 123.4,
      }),
    ).to.equal('123.4')
  })

  it('should print nil as is', () => {
    expect(expressionToAstString('nil')).to.equal('nil')
  })

  it('should print true as is', () => {
    expect(expressionToAstString('true')).to.equal('true')
  })

  it('should print false as is', () => {
    expect(expressionToAstString('false')).to.equal('false')
  })

  it('should print nested unary and grouping inside binary', () => {
    const ast: Binary = {
      left: {
        prefix: '-',
        expression: {
          numValue: 123,
        },
      },
      right: {
        wrapped: {
          numValue: 45.67,
        },
      },
      operator: '*',
    }

    expect(expressionToAstString(ast)).to.equal('(* (- 123) (group 45.67))')
  })
})
