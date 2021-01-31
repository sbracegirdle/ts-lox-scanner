import {expect} from 'chai'

import {scanner, Token, TokenType} from '../../src/scanner'

describe('integration/scanner', () => {
  it('should handle grouping and operators', () => {
    const expected: Token[] = [
      {
        type: TokenType.LEFT_PAREN,
        start: 22,
        length: 1,
      },
      {
        type: TokenType.LEFT_PAREN,
        start: 23,
        length: 1,
      },
      {
        type: TokenType.RIGHT_PAREN,
        start: 25,
        length: 1,
      },
      {
        type: TokenType.RIGHT_PAREN,
        start: 26,
        length: 1,
      },
      {
        type: TokenType.LEFT_BRACE,
        start: 27,
        length: 1,
      },
      {
        type: TokenType.RIGHT_BRACE,
        start: 28,
        length: 1,
      },
      {
        type: TokenType.BANG,
        start: 48,
        length: 1,
      },
      {
        type: TokenType.STAR,
        start: 49,
        length: 1,
      },
      {
        type: TokenType.PLUS,
        start: 50,
        length: 1,
      },
      {
        type: TokenType.MINUS,
        start: 51,
        length: 1,
      },
      {
        type: TokenType.SLASH,
        start: 52,
        length: 1,
      },
      {
        type: TokenType.EQUAL,
        start: 53,
        length: 1,
      },
      {
        type: TokenType.LESS,
        start: 54,
        length: 1,
      },
      {
        type: TokenType.GREATER,
        start: 55,
        length: 1,
      },
      {
        type: TokenType.LESS_EQUAL,
        start: 57,
        length: 2,
      },
      {
        type: TokenType.EQUAL_EQUAL,
        start: 60,
        length: 2,
      },
    ]
    const result = scanner(`
// this is a comment
(( )){} // grouping stuff
!*+-/=<> <= == // operators
`)
    expect(result).to.deep.equal(expected)
  })
})
