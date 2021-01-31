/* eslint-disable functional/no-expression-statement */
import {expect} from 'chai'

import {scanner, Token, TokenType} from '../../src/scanner'
import {getIdentifiers} from '../getIdentifiers'
import {getTypes} from '../getTypes'

describe('integration/scanner', () => {
  it('should handle grouping and operators', () => {
    const expected: readonly Token[] = [
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

  it('should handle hello world program', () => {
    const expected: readonly Token[] = [
      {
        type: TokenType.PRINT,
        start: 28,
        length: 5,
      },
      {
        type: TokenType.STRING,
        text: 'Hello, world!',
        start: 34,
        length: 15,
      },
      {
        type: TokenType.SEMICOLON,
        start: 49,
        length: 1,
      },
    ]
    const result = scanner(`
// Your first Lox program!
print "Hello, world!";
`)
    expect(result).to.deep.equal(expected)
  })

  it('should handle closure', () => {
    const result = scanner(`
fun addPair(a, b) {
  return a + b;
}

fun identity(a) {
  return a;
}

print identity(addPair)(1, 2); // Prints "3".
`)
    expect(getIdentifiers(result)).to.deep.equal(['addPair', 'a', 'b', 'identity'])

    expect(getTypes(result)).to.deep.equal([
      // First function
      TokenType.FUN,
      TokenType.IDENTIFIER,
      TokenType.LEFT_PAREN,
      TokenType.IDENTIFIER,
      TokenType.COMMA,
      TokenType.IDENTIFIER,
      TokenType.RIGHT_PAREN,
      TokenType.LEFT_BRACE,
      TokenType.RETURN,
      TokenType.IDENTIFIER,
      TokenType.PLUS,
      TokenType.IDENTIFIER,
      TokenType.SEMICOLON,
      TokenType.RIGHT_BRACE,
      // Second function
      TokenType.FUN,
      TokenType.IDENTIFIER,
      TokenType.LEFT_PAREN,
      TokenType.IDENTIFIER,
      TokenType.RIGHT_PAREN,
      TokenType.LEFT_BRACE,
      TokenType.RETURN,
      TokenType.IDENTIFIER,
      TokenType.SEMICOLON,
      TokenType.RIGHT_BRACE,
      // Print call
      TokenType.PRINT,
      TokenType.IDENTIFIER,
      TokenType.LEFT_PAREN,
      TokenType.IDENTIFIER,
      TokenType.RIGHT_PAREN,
      TokenType.LEFT_PAREN,
      TokenType.NUMBER,
      TokenType.COMMA,
      TokenType.NUMBER,
      TokenType.RIGHT_PAREN,
      TokenType.SEMICOLON,
    ])
  })
})
