import { autorun, Dependency, flush } from "./tracker";

describe('tracker', () => {
  it('autorun/dependency', async () => {
    return new Promise((resolve, reject) => {
      let c1 = 0;
      let c2 = 0;
      let dep = new Dependency();
      c1++;

      autorun(() => {
        dep.depend();
        c2++;
        if (c1 !== c2) reject(new Error(['falha, c1=', c1, , ' c2=', c2].join('')));
        else if (c2 === 4) resolve();
      });

      c1++;
      dep.changed();
      c1++;
      c2++;
      dep.changed();

      setTimeout(() => {
        c1++;
        dep.changed();
      }, 11)
    });
  });

  it('autorun/dependency-flush', async () => {
    return new Promise((resolve, reject) => {
      let c1 = 0;
      let c2 = 0;
      let dep = new Dependency();
      c1++;

      autorun(() => {
        dep.depend();
        c2++;
        if (c1 !== c2) reject(new Error(['falha, c1=', c1, , ' c2=', c2].join('')));
        else if (c2 === 4) resolve();
      });

      flush();

      c1++;
      dep.changed();
      c1++;
      c2++;
      dep.changed();

      setTimeout(() => {
        c1++;
        dep.changed();
      }, 11)
    });
  });

  it('autorun/dependency-in flush', async () => {
    return new Promise((resolve, reject) => {
      let c1 = 0;
      let c2 = 0;
      let dep = new Dependency();
      c1++;

      autorun(() => {
        flush();
        dep.depend();
        c2++;
        if (c1 !== c2) reject(new Error(['falha, c1=', c1, , ' c2=', c2].join('')));
        else if (c2 === 4) resolve();
      });

      c1++;
      dep.changed();
      c1++;
      c2++;
      dep.changed();

      setTimeout(() => {
        c1++;
        dep.changed();
      }, 11)
    });
  });

  it('waitForNextChange', async () => {
    let dep = new Dependency();
    setTimeout(() => dep.changed(), 3);
    await dep.waitForNextChange();
  });
  it('waitForNextChange - timeout ok', async () => {
    let dep = new Dependency();
    setTimeout(() => dep.changed(), 3);
    await dep.waitForNextChange(20);
  });
  it('waitForNextChange - timeout fail', async () => {
    let dep = new Dependency();
    setTimeout(() => dep.changed(), 100);
    try {
      await dep.waitForNextChange(1);
      throw new Error('timeout expected');
    }
    catch (err) {
      if (err.message !== 'timeout') throw err;
    }
  });
});