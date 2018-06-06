
// import { autorun, Dependency, flush } from './tracker';
// import { createElement } from 'react';
// import * as renderer from 'react-test-renderer';

// describe('tracker', () => {
//   it('autorun/dependency', async () => {
//     return new Promise((resolve, reject) => {
//       let c1 = 0;
//       let c2 = 0;
//       const dep = new Dependency();
//       c1++;

//       autorun(() => {
//         dep.depend();
//         c2++;
//         if (c1 !== c2) {
//           reject(new Error(['falha, c1=', c1, , ' c2=', c2].join('')));
//         } else if (c2 === 4) {
//           resolve();
//         }
//       });

//       c1++;
//       dep.changed();
//       c1++;
//       c2++;
//       dep.changed();

//       setTimeout(() => {
//         c1++;
//         dep.changed();
//       }, 11);
//     });
//   });

//   it('autorun/dependency-flush', async () => {
//     return new Promise((resolve, reject) => {
//       let c1 = 0;
//       let c2 = 0;
//       const dep = new Dependency();
//       c1++;

//       autorun(() => {
//         dep.depend();
//         c2++;
//         if (c1 !== c2) {
//           reject(new Error(['falha, c1=', c1, , ' c2=', c2].join('')));
//         } else
//           if (c2 === 4) {
//             resolve();
//           }
//       });

//       flush();

//       c1++;
//       dep.changed();
//       c1++;
//       c2++;
//       dep.changed();

//       setTimeout(() => {
//         c1++;
//         dep.changed();
//       }, 11);
//     });
//   });

//   it.skip('autorun/dependency-in flush', async () => {
//     return new Promise((resolve, reject) => {
//       let c1 = 0;
//       let c2 = 0;
//       const dep = new Dependency();
//       c1++;

//       autorun(() => {
//         flush();
//         dep.depend();
//         c2++;
//         if (c1 !== c2) {
//           reject(new Error(['falha, c1=', c1, , ' c2=', c2].join('')));
//         } else if (c2 === 4) {
//           resolve();
//         }
//       });

//       c1++;
//       dep.changed();
//       c1++;
//       c2++;
//       dep.changed();

//       setTimeout(() => {
//         c1++;
//         dep.changed();
//       }, 11);
//     });
//   });

//   it('waitForNextChange', async () => {
//     const dep = new Dependency();
//     setTimeout(() => dep.changed(), 3);
//     await dep.waitForNextChange();
//   });
//   it('waitForNextChange - timeout ok', async () => {
//     const dep = new Dependency();
//     setTimeout(() => dep.changed(), 3);
//     await dep.waitForNextChange(20);
//   });
//   it('waitForNextChange - timeout fail', async () => {
//     const dep = new Dependency();
//     setTimeout(() => dep.changed(), 30);
//     try {
//       await dep.waitForNextChange(1);
//       throw new Error('timeout expected');
//     } catch (err) {
//       // console.dir(err)
//       if (err.message !== 'timeout') { throw err; }
//     }
//   });

//   it('dep.rx', async () => {

//     let renderCount = 0;
//     const dep = new Dependency();
//     const rxComp = dep.rx(() => {
//       renderCount++;
//       return createElement('div', [], '');
//     });
//     expect(renderCount).to.equal(0);
//     const element = renderer.create(
//       createElement(rxComp, [], ''),
//     );
//     const tree = element.toJSON();
//     // expect(JSON.stringify(tree)).to.eql(JSON.stringify(expected1));
//     expect(tree).to.eql(expected1);
//     expect(renderCount).to.equal(1);
//     setTimeout(() => dep.changed(), 10);

//     // await dep.waitForNextChange(1);
//     // expect(renderCount).to.equal(2);
//   });

// });

// const expected1: any = {};
