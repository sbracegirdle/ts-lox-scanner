import {expect} from 'chai'

import {scanner, Token, TokenType} from '../../src/scanner'

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
      const expected: Token[] = [
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
      const expected: Token[] = [
        {
          type: TokenType.SEMICOLON,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner(';')).to.deep.equal(expected)
    })

    it('should recognise star', () => {
      const expected: Token[] = [
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
      const expected: Token[] = [
        {
          type: TokenType.BANG_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('!=')).to.deep.equal(expected)
    })

    it('should recognise equal', () => {
      const expected: Token[] = [
        {
          type: TokenType.EQUAL_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('==')).to.deep.equal(expected)
    })

    it('should recognise less equal', () => {
      const expected: Token[] = [
        {
          type: TokenType.LESS_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('<=')).to.deep.equal(expected)
    })

    it('should recognise greater equal', () => {
      const expected: Token[] = [
        {
          type: TokenType.GREATER_EQUAL,
          start: 0,
          length: 2,
        },
      ]
      expect(scanner('>=')).to.deep.equal(expected)
    })

    it('should recognise assignment', () => {
      const expected: Token[] = [
        {
          type: TokenType.EQUAL,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner('=')).to.deep.equal(expected)
    })

    it('should recognise not equal between other tokens', () => {
      const expected: Token[] = [
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
      const expected: Token[] = [
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
      const expected: Token[] = [
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
      const expected: Token[] = []
      expect(scanner('//hello this is a comment')).to.deep.equal(expected)
    })

    it('should ignore remainder of line of comments', () => {
      const expected: Token[] = [
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
      const expected: Token[] = [
        {
          type: TokenType.SLASH,
          start: 0,
          length: 1,
        },
      ]
      expect(scanner('/')).to.deep.equal(expected)
    })

    it('should not ignore next line', () => {
      const expected: Token[] = [
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
      const expected: Token[] = [
        {
          type: TokenType.SLASH,
          start: 2,
          length: 1,
        },
      ]
      expect(scanner('  / ')).to.deep.equal(expected)
    })

    it('should ignore tabs', () => {
      const expected: Token[] = [
        {
          type: TokenType.SLASH,
          start: 1,
          length: 1,
        },
      ]
      expect(scanner('\t/ ')).to.deep.equal(expected)
    })

    it('should ignore new lines', () => {
      const expected: Token[] = [
        {
          type: TokenType.SLASH,
          start: 2,
          length: 1,
        },
      ]
      expect(scanner('\n\n/\n')).to.deep.equal(expected)
    })
  })
})
