import 'mocha'
import { expect } from 'chai'
import { logger, Logger } from '../out/logger.js'

describe('Logger', () => {
  describe('generates ghost scopes of equal length', () => {
    it('test -> ....', () => {
      const scope0 = 'test'
      const ghostScope = Logger.generateGhostScope(scope0)
      expect(ghostScope.length).to.equal(scope0.length)
      expect(ghostScope).to.deep.equals('....')
    })
    it('testing, it -> ......., ..', () => {
      const scope0 = 'testing'
      const scope1 = 'it'
      expect(logger.ghost(scope0).ghost(scope1).scopes[0].length).to.equal(scope0.length)
      expect(logger.ghost(scope0).ghost(scope1).scopes[1].length).to.equal(scope1.length)
      expect(logger.ghost(scope0).ghost(scope1).scopes).to.deep.equals(['.......', '..'])
    })
  })
})
