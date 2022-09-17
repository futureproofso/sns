import 'mocha'
import { expect } from 'chai'
import { chunk } from '../out/utils.js'

describe('chunk', () => {
    it('abcd, 4 -> [abcd]', () => {
        expect(chunk('abcd', 4)).to.deep.equals(['abcd'])
    })
    it('abcd, 2 -> [ab, cd]', () => {
        expect(chunk('abcd', 2)).to.deep.equals(['ab', 'cd'])
    })
    it('abcd, 1 -> [a, b, c, d]', () => {
        expect(chunk('abcd', 1)).to.deep.equals(['a', 'b', 'c', 'd'])
    })
    it('abcd, 3 -> [abc, d  ]', () => {
        expect(chunk('abcd', 3)).to.deep.equals(['abc', 'd  '])
    })
    it('abcd, 5 -> [abcd ]', () => {
        expect(chunk('abcd', 5)).to.deep.equals(['abcd '])
    })
})
