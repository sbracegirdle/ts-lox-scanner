import {expect} from 'chai'

import {scanner, Token, TokenType} from '../../src/scanner'

describe('scanner()', () => {
  describe('single char tokens', () => {
    it('should recognise left paren', () => {
      const token: Token = {
        type: TokenType.LEFT_PAREN,
      }
      expect(scanner('(')).to.deep.equal([token])
    })

    it('should recognise left and right paren', () => {
      const expected: Token[] = [
        {
          type: TokenType.LEFT_PAREN,
        },
        {
          type: TokenType.RIGHT_PAREN,
        },
      ]
      expect(scanner('()')).to.deep.equal(expected)
    })
  })
})
