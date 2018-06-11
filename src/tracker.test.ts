
import "@hoda5/hdev";

import * as React from "react";
import { autorun, Dependency, flush } from "./tracker";

describe("tracker", () => {
    it("autorun/dependency", async () => {
        return new Promise((resolve, reject) => {
            let c1 = 0;
            let c2 = 0;
            const dep = new Dependency();
            c1++;

            autorun(() => {
                dep.depend();
                c2++;
                if (c1 !== c2) {
                    reject(new Error(["falha, c1=", c1, , " c2=", c2].join("")));
                } else if (c2 === 4) {
                    resolve();
                }
            });

            c1++;
            dep.changed();
            c1++;
            c2++;
            dep.changed();

            setTimeout(() => {
                c1++;
                dep.changed();
            }, 11);
        });
    });

    it("autorun/dependency-flush", async () => {
        return new Promise((resolve, reject) => {
            let c1 = 0;
            let c2 = 0;
            const dep = new Dependency();
            c1++;

            autorun(() => {
                dep.depend();
                c2++;
                if (c1 !== c2) {
                    reject(new Error(["falha, c1=", c1, , " c2=", c2].join("")));
                } else
                    if (c2 === 4) {
                        resolve();
                    }
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
            }, 11);
        });
    });

    it.skip("autorun/dependency-in flush", async () => {
        return new Promise((resolve, reject) => {
            let c1 = 0;
            let c2 = 0;
            const dep = new Dependency();
            c1++;

            autorun(() => {
                flush();
                dep.depend();
                c2++;
                if (c1 !== c2) {
                    reject(new Error(["falha, c1=", c1, , " c2=", c2].join("")));
                } else if (c2 === 4) {
                    resolve();
                }
            });

            c1++;
            dep.changed();
            c1++;
            c2++;
            dep.changed();

            setTimeout(() => {
                c1++;
                dep.changed();
            }, 11);
        });
    });

    it("waitForNextChange", async () => {
        const dep = new Dependency();
        setTimeout(() => dep.changed(), 3);
        await dep.waitForNextChange();
    });
    it("waitForNextChange - timeout ok", async () => {
        const dep = new Dependency();
        setTimeout(() => dep.changed(), 3);
        await dep.waitForNextChange(20);
    });
    it("waitForNextChange - timeout fail", async () => {
        const dep = new Dependency();
        setTimeout(() => dep.changed(), 30);
        try {
            await dep.waitForNextChange(1);
            throw new Error("timeout expected");
        } catch (err) {
            // console.dir(err)
            if (err.message !== "timeout") { throw err; }
        }
    });

    it("dep.rx stateless component", async () => {

        let renderCount = 0;
        const dep = new Dependency();
        const rxComp = dep.rx(() => {
            renderCount++;
            return React.createElement('div', { className: 'e' }, renderCount.toString());
        });
        expect(renderCount).to.eql(0);
        const r = reactRender(React.createElement(rxComp))
        expect(renderCount).to.equal(1);
        r.textContent('e', '1')

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        r.textContent('e', '2')

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        r.textContent('e', '3')

    });
    it("dep.rx component", async () => {

        let renderCount = 0;
        const dep = new Dependency();
        const rxComp = dep.rx(
            class extends React.Component<{}> {
                render() {
                    renderCount++;
                    return React.createElement('div', { className: 'e' }, renderCount.toString());
                }
            }
        );
        expect(renderCount).to.eql(0);
        const r = reactRender(React.createElement(rxComp))
        expect(renderCount).to.equal(1);
        r.textContent('e', '1')

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        r.textContent('e', '2')

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        r.textContent('e', '3')

    });

});

const expected1: any = {};
