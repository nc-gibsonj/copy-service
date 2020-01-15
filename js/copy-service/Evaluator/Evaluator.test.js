import Evaluator from './Evaluator';
import Substitutions from '../Substitutions/Substitutions';
import CopyService from '../CopyService';
import ErrorHandler from '../ErrorHandler/ErrorHandler';

describe('Evaluator', () => {
  let evaluator, copyService;

  beforeEach(() => {
    copyService = new CopyService();
    evaluator = new Evaluator(copyService);
  });

  describe('constructor', () => {
    test('sets the copy service', () => {
      expect(evaluator.copyService).toBe(copyService);
    });

    test('creates the evaluationCache', () => {
      expect(evaluator.evaluationCache).toBeInstanceOf(Map);
    });
  });

  describe('getCached', () => {
    test('gets the result from the evaluation cache', () => {
      const result = { some: 'result' };
      const ast = { an: 'ast' };

      evaluator.evaluationCache.set(ast, result);
      expect(evaluator.getCached(ast)).toBe(result);
    });
  });

  describe('setCacheIfCacheable', () => {
    const result = { some: 'result' };

    describe('when the ast is cacheable', () => {
      const ast = { an: 'ast', isCacheable: jest.fn().mockReturnValue(true) };

      test('sets the result in the cache', () => {
        evaluator.setCacheIfCacheable(ast, result);
        expect(evaluator.getCached(ast)).toBe(result);
      });
    });

    describe('when the ast is not cacheable', () => {
      const ast = { an: 'ast', isCacheable: jest.fn().mockReturnValue(false) };

      test('does not set the result in the cache', () => {
        evaluator.setCacheIfCacheable(ast, result);
        expect(evaluator.getCached(ast)).toBeUndefined();
      });
    });
  });

  describe('getCopy', () => {
    test('defers to evalAST with correct args', () => {
      const key = 'some.copy.key';
      const rawSubstitutions = { some: 'raw', substitutions: 'yo' };

      const initialCopy = 'initialCopy';
      const ast = { some: 'ast' };

      jest.spyOn(copyService, 'getAstForKey').mockReturnValue(ast);
      jest.spyOn(evaluator, 'getInitialResult').mockReturnValue(initialCopy);

      const copy = 'result copy';
      jest.spyOn(evaluator, 'evalAST').mockImplementation((init, ast, subs) => {
        expect(subs.substitutions).toEqual(rawSubstitutions);
        return copy;
      });

      expect(evaluator.getCopy(key, rawSubstitutions)).toBe(copy);
      expect(evaluator.evalAST).toBeCalledWith(initialCopy, ast, expect.any(Substitutions));
      expect(copyService.getAstForKey).toBeCalledWith(key);
      expect(evaluator.getInitialResult).toBeCalled();
    });
  });

  describe('evalAST', () => {
    test('throws error', () => {
      expect(() => evaluator.evalAST()).toThrow(
        'evalAST is abstract and must be implemented by the extending class'
      );
    });
  });

  describe('getInitialResult', () => {
    test('throws error', () => {
      expect(() => evaluator.getInitialResult()).toThrow(
        'getInitialResult is abstract and must be implemented by the extending class'
      );
    });
  });

  describe('_handleError', () => {
    test('defers to ErrorHandler.handleError', () => {
      const args = ['some error message', { halt: true }];
      jest.spyOn(ErrorHandler, 'handleError').mockImplementation();
      evaluator._handleError(...args);
      expect(ErrorHandler.handleError).toBeCalledWith(Evaluator.name, ...args);
    });
  });
});
