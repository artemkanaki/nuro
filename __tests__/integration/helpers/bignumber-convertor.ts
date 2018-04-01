import BigNumber from 'bignumber.js';

export function convertDataToBigNumber(data: number[][]) {
  return data.map(row => row.map(col => new BigNumber(col)));
}

export function convertToNumberArray(data: any[]) {
  return data.map(col => col instanceof Array ? convertToNumberArray(col) : col.toNumber());
}

export function convertToNumberArrayArray(data: BigNumber[][]) {
  return data.map(row => convertToNumberArray(row));
}