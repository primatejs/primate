export type ToSortedCompareFunction<T> = (a: T, b: T) => number;

export default <T>(array: T[], compareFn: ToSortedCompareFunction<T>) =>
  [...array].sort(compareFn);
