
import * as React from "react";
import * as TestRenderer from "react-test-renderer";
import { autorun, Dependency, flush } from "./tracker";
import { enableDebug, disableDebug, h5debug } from "@hoda5/h5debug";

describe("tracker", () => {
    beforeEach(() => enableDebug("@hoda5/tracker", { disbleConsole: true }));
    afterEach(() => disableDebug("@hoda5/tracker"));
    it("autorun/dependency", async () => {
        return new Promise((resolve, reject) => {
            let c1 = 0;
            let c2 = 0;
            const dep = new Dependency("dep");
            c1++;

            autorun("ardep", () => {
                dep.depend();
                c2++;
                if (c1 !== c2) {
                    reject(new Error(["falha,x c1=", c1, , " c2=", c2].join("")));
                } else if (c2 === 4) {
                    try {
                        expect(h5debug["@hoda5/tracker"].history()).toEqual([
                            "dep.depend() on ardep",
                            "dep.changed() invalidating ardep",
                            "dep.depend() on ardep",
                            "dep.changed() invalidating ardep",
                            "dep.depend() on ardep",
                        ]);
                    } catch (e) {
                        reject(e);
                    }
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
            const dep = new Dependency("dep");
            c1++;

            autorun("ar", () => {
                dep.depend();
                c2++;
                if (c1 !== c2) {
                    reject(new Error(["falha, c1=", c1, , " c2=", c2].join("")));
                } else if (c2 === 4) {
                    try {
                        expect(h5debug["@hoda5/tracker"].history()).toEqual([
                            "dep.depend() on ar",
                            "dep.changed() invalidating ar",
                            "dep.depend() on ar",
                            "dep.changed() invalidating ar",
                            "dep.depend() on ar",
                        ]);
                    } catch (e) {
                        return reject(e);
                    }
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
            const dep = new Dependency("dep");
            c1++;

            autorun("ar", () => {
                flush();
                dep.depend();
                c2++;
                if (c1 !== c2) {
                    reject(new Error(["falha, c1=", c1, , " c2=", c2].join("")));
                } else if (c2 === 4) {
                    try {
                        expect(h5debug["@hoda5/tracker"].history()).toEqual([
                            "xdep.depend() on ar",
                            "dep.changed() invalidating ar",
                            "dep.depend() on ar",
                            "dep.changed() invalidating ar",
                            "dep.depend() on arx",
                        ]);
                    } catch (e) {
                        return reject(e);
                    }
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
        const dep = new Dependency("dep");
        setTimeout(() => dep.changed(), 3);
        await dep.waitForNextChange();
        expect(h5debug["@hoda5/tracker"].history()).toEqual([
            "dep.depend() on dep.waitForNextChange",
            "dep.changed() invalidating dep.waitForNextChange",
            "dep.depend() on dep.waitForNextChange",
        ]);
    });
    it("waitForNextChange - timeout ok", async () => {
        const dep = new Dependency("dep");
        setTimeout(() => dep.changed(), 3);
        await dep.waitForNextChange(20);
        expect(h5debug["@hoda5/tracker"].history()).toEqual([
            "dep.depend() on dep.waitForNextChange",
            "dep.changed() invalidating dep.waitForNextChange",
            "dep.depend() on dep.waitForNextChange",
        ]);
    });
    it("waitForNextChange - timeout fail", async () => {
        const dep = new Dependency("dep");
        setTimeout(() => dep.changed(), 30);
        try {
            await dep.waitForNextChange(1);
            throw new Error("timeout expected");
        } catch (err) {
            // console.dir(err)
            if (err.message !== "timeout") { throw err; }
            expect(h5debug["@hoda5/tracker"].history()).toEqual([
                "dep.depend() on dep.waitForNextChange",
            ]);
        }
    });

    it("ignoreNextChanges", async () => {
        const dep = new Dependency("dep");
        setTimeout(() => dep.changed(), 3);
        setTimeout(() => dep.changed(), 4);
        setTimeout(() => dep.changed(), 5);
        setTimeout(() => dep.changed(), 6);
        await dep.ignoreNextChanges(50);
        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange();
        expect(h5debug["@hoda5/tracker"].history()).toEqual([
            "dep.depend() on dep.ignoreNextChanges",
            "dep.changed() invalidating dep.ignoreNextChanges",
            "dep.depend() on dep.ignoreNextChanges",
            "dep.changed() invalidating dep.ignoreNextChanges",
            "dep.depend() on dep.ignoreNextChanges",
            "dep.depend() on dep.waitForNextChange",
            "dep.changed() invalidating dep.waitForNextChange",
            "dep.depend() on dep.waitForNextChange",
        ]);
    });

    it("dep.rx stateless component", async () => {

        let renderCount = 0;
        const dep = new Dependency("dep");
        const Comp = dep.rx(() => {
            renderCount++;
            return <div className="e">{renderCount}</div>;
        });
        expect(renderCount).toBe(0);
        const r = TestRenderer.create(<Comp />);
        expect(renderCount).toBe(1);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["1"]);

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["2"]);

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["3"]);

        expect(h5debug["@hoda5/tracker"].history()).toEqual([
            "dep.depend() on dep.rx",
            "dep.depend() on dep.waitForNextChange",
            "dep.changed() invalidating dep.rx",
            "dep.changed() invalidating dep.waitForNextChange",
            "dep.depend() on dep.rx", "dep.depend() on dep.waitForNextChange",
            "dep.depend() on dep.waitForNextChange",
            "dep.changed() invalidating dep.rx",
            "dep.changed() invalidating dep.waitForNextChange",
            "dep.depend() on dep.rx",
            "dep.depend() on dep.waitForNextChange",
        ]);

    });
    it("dep.rx - nested", async () => {

        let renderCount = 0;
        const dep1 = new Dependency("dep1");
        const dep2 = new Dependency("dep2");
        const Comp = dep1.rx(dep2.rx(() => {
            renderCount++;
            return <div className="e">{renderCount}</div>;
        }));
        expect(renderCount).toBe(0);
        const r = TestRenderer.create(<Comp />);
        expect(renderCount).toBe(1);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["1"]);

        setTimeout(() => dep1.changed(), 1);
        await dep1.waitForNextChange(50);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["2"]);

        setTimeout(() => dep2.changed(), 1);
        await dep2.waitForNextChange(50);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["3"]);

        expect(h5debug["@hoda5/tracker"].history()).toEqual([
            "dep1.depend() on dep1.rx",
            "dep2.depend() on dep2.rx",
            "dep1.depend() on dep1.waitForNextChange",
            "dep1.changed() invalidating dep1.rx",
            "dep1.changed() invalidating dep1.waitForNextChange",
            "dep1.depend() on dep1.rx",
            "dep1.depend() on dep1.waitForNextChange",
            "dep2.depend() on dep2.waitForNextChange",
            "dep2.changed() invalidating dep2.rx",
            "dep2.changed() invalidating dep2.waitForNextChange",
            "dep2.depend() on dep2.rx",
            "dep2.depend() on dep2.waitForNextChange",
        ]);

    });
    it("dep.rx component", async () => {

        let renderCount = 0;
        const dep = new Dependency("dep");
        const Comp = dep.rx(
            class extends React.Component<{}> {
                public render() {
                    renderCount++;
                    return <div className="e">{renderCount}</div>;
                }
            },
        );
        expect(renderCount).toBe(0);
        const r = TestRenderer.create(<Comp />);
        expect(renderCount).toBe(1);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["1"]);

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        expect(renderCount).toBe(2);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["2"]);

        setTimeout(() => dep.changed(), 1);
        await dep.waitForNextChange(50);
        expect(renderCount).toBe(3);
        expect(r.root.findByProps({ className: "e" }).children).toEqual(["3"]);

        expect(h5debug["@hoda5/tracker"].history()).toEqual([
            "dep.depend() on dep.rx",
            "dep.depend() on dep.waitForNextChange",
            "dep.changed() invalidating dep.rx",
            "dep.changed() invalidating dep.waitForNextChange",
            "dep.depend() on dep.rx",
            "dep.depend() on dep.waitForNextChange",
            "dep.depend() on dep.waitForNextChange",
            "dep.changed() invalidating dep.rx",
            "dep.changed() invalidating dep.waitForNextChange",
            "dep.depend() on dep.rx",
            "dep.depend() on dep.waitForNextChange",
        ]);

    });

});
