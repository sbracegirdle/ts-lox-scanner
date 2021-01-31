/* eslint-disable functional/no-expression-statement */
import {expect} from 'chai'

import {scanner, Token, TokenType} from '../../src/scanner'
import {getTypes} from '../getTypes'

describe('unit/scanner', () => {
  describe('single char tokens', () => {
    it('should recognise left paren', () => {
      const token: Token = {
        type: TokenType.LEFT_PAREN,
        start: 0,
        length: 1,
      }
      expect(scanner('(')).to.deep.equal([token])
    })

    it('should recognise brace', () => {
      const token: Token = {
        type: TokenType.LEFT_BRACE,
        start: 0,
        length: 1,
      }
      expect(scanner('{')).to.deep.equal([token])
    })

    it('should recognise left and right paren', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.LEFT_PAREN,
          start: 0,
          length: 1,
        },
        {
          type: TokenType.RIGHT_PAREN,
          start: 1,
          length: 1,
        },
      ]
      expect(scanner('()')).to.deep.equal(expected)
    })

    it('should recognise semi colon', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.SEMICOLON,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner(';')).to.deep.equal(expected)
    })

    it('should recognise star', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.STAR,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner('*')).to.deep.equal(expected)
    })
  })

  describe('one or two character tokens', () => {
    it('should recognise not equal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.BANG_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('!=')).to.deep.equal(expected)
    })

    it('should recognise equal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.EQUAL_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('==')).to.deep.equal(expected)
    })

    it('should recognise less equal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.LESS_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('<=')).to.deep.equal(expected)
    })

    it('should recognise greater equal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.GREATER_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('>=')).to.deep.equal(expected)
    })

    it('should recognise assignment', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.EQUAL,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner('=')).to.deep.equal(expected)
    })

    it('should recognise not equal between other tokens', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.PLUS,
          start: 0,
          length: 1,
        },
        {
          type: TokenType.BANG_EQUAL,
          start: 1,
          length: 2,
        },
        {
          type: TokenType.STAR,
          start: 3,
          length: 1,
        },
      ]
      expect(scanner('+!=*')).to.deep.equal(expected)
    })

    it('should recognise equal between other tokens', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.PLUS,
          start: 0,
          length: 1,
        },
        {
          type: TokenType.EQUAL,
          start: 1,
          length: 1,
        },
        {
          type: TokenType.STAR,
          start: 2,
          length: 1,
        },
      ]
      expect(scanner('+=*')).to.deep.equal(expected)
    })

    it('should recognise bang', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.BANG,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner('!')).to.deep.equal(expected)
    })
  })

  describe('comments', () => {
    it('should ignore whole line of comments', () => {
      const expected: readonly Token[] = []
      expect(scanner('//hello this is a comment')).to.deep.equal(expected)
    })

    it('should ignore remainder of line of comments', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.STAR,
          start: 0,
          length: 1,
        },
        {
          type: TokenType.MINUS,
          start: 1,
          length: 1,
        },
        {
          type: TokenType.PLUS,
          start: 2,
          length: 1,
        },
      ]
      expect(scanner('*-+//hello this is a comment')).to.deep.equal(expected)
    })

    it('should handle single slash', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.SLASH,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner('/')).to.deep.equal(expected)
    })

    it('should not ignore next line', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.STAR,
          start: 26,
          length: 1,
        },
        {
          type: TokenType.MINUS,
          start: 27,
          length: 1,
        },
      ]
      expect(scanner('//hello this is a comment\n*-')).to.deep.equal(expected)
    })
  })

  describe('error handling', () => {
    it('should dump the line with unexpected character', () => {
      expect(function () {
        scanner('*-\n*-*-*-*-*-$')
      }).to.throw('Unexpected character $ at line 2:\n\n   *-*-*-*-*-$')
    })

    it('should dump if first character is unexpected', () => {
      expect(function () {
        scanner('$')
      }).to.throw('Unexpected character $ at line 1:\n\n   $')
    })
  })

  describe('whitespace', () => {
    it('should ignore spaces', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.SLASH,
          start: 2,
          length: 1,
        },
      ]
      expect(scanner('  / ')).to.deep.equal(expected)
    })

    it('should ignore tabs', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.SLASH,
          start: 1,
          length: 1,
        },
      ]
      expect(scanner('\t/ ')).to.deep.equal(expected)
    })

    it('should ignore new lines', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.SLASH,
          start: 2,
          length: 1,
        },
      ]
      expect(scanner('\n\n/\n')).to.deep.equal(expected)
    })
  })

  describe('literals', () => {
    it('should consume string literal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.STRING,
          text: 'hello',
          start: 0,
          length: 7,
        },
      ]
      expect(scanner('"hello"')).to.deep.equal(expected)
    })

    it('should consume empty string literal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.STRING,
          text: '',
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('""')).to.deep.equal(expected)
    })

    it('should support multi line strings')

    it('should error if unterminated string', () => {
      expect(function () {
        scanner('"')
      }).to.throw('Unterminated string')
    })

    it('should consume number literal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.NUMBER,
          text: '0',
          start: 0,
          length: 1,
        },
      ]
      expect(scanner('0')).to.deep.equal(expected)
    })

    it('should consume longer number literal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.NUMBER,
          text: '1234567',
          start: 0,
          length: 7,
        },
      ]
      expect(scanner('1234567')).to.deep.equal(expected)
    })

    it('should consume number with decimal', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.NUMBER,
          text: '1234.567',
          start: 0,
          length: 8,
        },
      ]
      expect(scanner('1234.567')).to.deep.equal(expected)
    })

    it('should treat hanging trailing decimal as dot', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.NUMBER,
          text: '1234',
          start: 0,
          length: 4,
        },
        {
          type: TokenType.DOT,
          start: 4,
          length: 1,
        },
      ]
      expect(scanner('1234.')).to.deep.equal(expected)
    })

    it('should treat hanging leading decimal as dot', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.DOT,
          start: 0,
          length: 1,
        },
        {
          type: TokenType.NUMBER,
          text: '1234',
          start: 1,
          length: 4,
        },
      ]
      expect(scanner('.1234')).to.deep.equal(expected)
    })

    it('should treat two dots as multiple literals', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.NUMBER,
          text: '1.1',
          start: 0,
          length: 3,
        },
        {
          type: TokenType.DOT,
          start: 3,
          length: 1,
        },
        {
          type: TokenType.NUMBER,
          text: '1',
          start: 4,
          length: 1,
        },
      ]
      expect(scanner('1.1.1')).to.deep.equal(expected)
    })
  })

  describe('keywords', () => {
    it('should recognise and', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.AND,
          start: 0,
          length: 3,
        },
      ]
      expect(scanner('and')).to.deep.equal(expected)
    })

    it('should recognise or', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.OR,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('or')).to.deep.equal(expected)
    })

    it('should recognise and and or', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.AND,
          start: 0,
          length: 3,
        },
        {
          type: TokenType.OR,
          start: 3,
          length: 2,
        },
      ]
      expect(scanner('andor')).to.deep.equal(expected)
    })

    it('should recognise this', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.THIS,
          start: 0,
          length: 4,
        },
      ]
      expect(scanner('this')).to.deep.equal(expected)
    })

    it('should recognise fun', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.FUN,
          start: 0,
          length: 3,
        },
      ]
      expect(scanner('fun')).to.deep.equal(expected)
    })
  })

  describe('identifiers', () => {
    it('should recognise multiple identifiers', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.IDENTIFIER,
          text: 'hello',
          start: 0,
          length: 5,
        },
        {
          type: TokenType.IDENTIFIER,
          text: 'world',
          start: 6,
          length: 5,
        },
      ]
      expect(scanner('hello world')).to.deep.equal(expected)
    })

    it('should recognise multiple identifiers seperated by other tokens', () => {
      const result = scanner('fun hello(world)')
      expect(getTypes(result)).to.deep.equal([
        TokenType.FUN,
        TokenType.IDENTIFIER,
        TokenType.LEFT_PAREN,
        TokenType.IDENTIFIER,
        TokenType.RIGHT_PAREN,
      ])
    })

    it('should recognise my camelCase identifier', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.IDENTIFIER,
          text: 'myVariable',
          start: 0,
          length: 10,
        },
      ]
      expect(scanner('myVariable')).to.deep.equal(expected)
    })

    it('should recognise my snake_case identifier', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.IDENTIFIER,
          text: 'my_var',
          start: 0,
          length: 6,
        },
      ]
      expect(scanner('my_var')).to.deep.equal(expected)
    })

    it('should recognise my alphanumeric identifier', () => {
      const expected: readonly Token[] = [
        {
          type: TokenType.IDENTIFIER,
          text: 'a1234',
          start: 0,
          length: 5,
        },
      ]
      expect(scanner('a1234')).to.deep.equal(expected)
    })
  })
})
