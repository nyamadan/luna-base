// @see https://github.com/uuidjs/uuid

function rng(this: void) {
  const values = [];
  for (let i = 0; i < 16; i++) {
    values.push(math.random(0x00, 0xff));
  }
  return values;
}

function byteToHex(this: void, x: number) {
  return (x + 0x100).toString(16).substr(1);
}

function stringify(arr: ReadonlyArray<number>, offset = 0) {
  const uuid = (
    byteToHex(arr[offset + 0]) +
    byteToHex(arr[offset + 1]) +
    byteToHex(arr[offset + 2]) +
    byteToHex(arr[offset + 3]) +
    "-" +
    byteToHex(arr[offset + 4]) +
    byteToHex(arr[offset + 5]) +
    "-" +
    byteToHex(arr[offset + 6]) +
    byteToHex(arr[offset + 7]) +
    "-" +
    byteToHex(arr[offset + 8]) +
    byteToHex(arr[offset + 9]) +
    "-" +
    byteToHex(arr[offset + 10]) +
    byteToHex(arr[offset + 11]) +
    byteToHex(arr[offset + 12]) +
    byteToHex(arr[offset + 13]) +
    byteToHex(arr[offset + 14]) +
    byteToHex(arr[offset + 15])
  ).toLowerCase();

  return uuid;
}

export namespace uuid {
  export function v4(this: void) {
    return stringify(rng());
  }
}
