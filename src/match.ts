// Kudos https://codeburst.io/alternative-to-javascripts-switch-statement-with-a-functional-twist-3f572787ba1c
interface MatchChain<I, O> {
  on: (pred: (i: I) => boolean, fn: (i: I) => O) => MatchChain<I, O>
  otherwise: (i: (i: I) => O) => O
}

const matched = <I, O>(x: O): MatchChain<I, O> => ({
  on: () => matched(x),
  otherwise: () => x,
})

export const match = <I, O>(x: I): MatchChain<I, O> => ({
  on: (pred, fn) => (pred(x) ? matched(fn(x)) : match(x)),
  otherwise: fn => fn(x),
})
