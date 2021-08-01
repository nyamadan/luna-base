export function tprint(this: void, ...args: any[]) {
  const tprint_impl = function (tbl: any, indent = 0) {
    if (type(tbl) === "table") {
      print(`${string.rep("  ", indent)}${tostring(tbl)}`);
      for (const [k, v] of pairs(tbl)) {
        print(`${string.rep("  ", indent)}${tostring(k)}:`);
        tprint_impl(v, indent + 1);
      }
    } else {
      print(`${string.rep("  ", indent)}${tostring(tbl)}`);
    }
  };

  for (const v of args) {
    tprint_impl(v);
  }
}
