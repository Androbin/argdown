"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai = require("chai");
chai.use(require("chai-fs"));
const chai_1 = require("chai");
const path = require("path");
const rimraf = require("rimraf");
const fs = require("fs");
const rimrafPromise = function (path) {
    return new Promise((resolve, reject) => {
        rimraf(path, {}, function (err) {
            if (err) {
                reject(err);
            }
            resolve();
        });
    });
};
const execPromise = (cmd, callback) => {
    return new Promise((resolve, reject) => {
        require("child_process").exec(cmd, (error, stdout, stderr) => {
            if (error !== null) {
                reject(error);
            }
            callback(error, stdout, stderr);
            resolve();
        });
    });
};
describe("argdown-cli", function () {
    this.timeout(20000);
    it("can create dot output", () => {
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " map -f dot " + filePath + " --stdout";
        const cb = (error, stdout, stderr) => {
            chai_1.expect(error).to.equal(null);
            chai_1.expect(stderr).to.equal("");
            chai_1.expect(stdout).to.not.equal("");
            chai_1.expect(stdout).to.not.equal(null);
        };
        return execPromise(cmd, cb);
    });
    it("can create html output", () => {
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " html " + filePath + " --stdout";
        return execPromise(cmd, (error, stdout, stderr) => {
            chai_1.expect(error).to.equal(null);
            chai_1.expect(stderr).to.equal("");
            chai_1.expect(stdout).to.not.equal("");
            chai_1.expect(stdout).to.not.equal(null);
        });
    });
    it("can create json output", () => {
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " json " + filePath + " --stdout";
        return execPromise(cmd, (error, stdout, stderr) => {
            chai_1.expect(error).to.equal(null);
            chai_1.expect(stderr).to.equal("");
            chai_1.expect(stdout).to.not.equal("");
            chai_1.expect(stdout).to.not.equal(null);
        });
    });
    it("can load config and run process", () => {
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        let filePathToConfig = path.resolve(__dirname, "./argdown.config.js");
        const cmd = "node " + filePathToCli + " --stdout --config " + filePathToConfig;
        return execPromise(cmd, (error, stdout, stderr) => {
            chai_1.expect(error).to.equal(null);
            chai_1.expect(stderr).to.equal("");
            chai_1.expect(stdout).to.not.equal("");
            chai_1.expect(stdout).to.not.equal(null);
        });
    });
    it("can run custom process defined in config.processes", () => {
        let svgFolder = path.resolve(__dirname, "./svg/");
        let filePathToSvg = path.resolve(__dirname, "./svg/test-suffix.svg");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        let filePathToConfig = path.resolve(__dirname, "./custom-process.argdown.config.js");
        const cmd = "node " + filePathToCli + " run test --config " + filePathToConfig;
        return rimrafPromise(svgFolder)
            .then(() => {
            return execPromise(cmd, (error, _stdout, stderr) => {
                chai_1.expect(error).to.equal(null);
                chai_1.expect(stderr).to.equal("");
                chai_1.expect(filePathToSvg).to.be.a.file();
            });
        })
            .then(() => {
            return rimrafPromise(svgFolder);
        });
    });
    it("can load plugin from config and run process defined in config.processes", () => {
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        let filePathToConfig = path.resolve(__dirname, "./add-plugin.argdown.config.js");
        const cmd = "node " + filePathToCli + " run test --config " + filePathToConfig;
        return execPromise(cmd, (error, stdout, stderr) => {
            chai_1.expect(error).to.equal(null);
            chai_1.expect(stderr).to.equal("");
            chai_1.expect(stdout).to.equal("Hallo World!\n");
        });
    });
    it("can create html file", () => {
        let htmlFolder = path.resolve(__dirname, "./html/");
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToHtml = path.resolve(__dirname, "./html/test.html");
        let filePathToCss = path.resolve(__dirname, "./html/argdown.css");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " html " + filePath + " " + htmlFolder;
        return rimrafPromise(htmlFolder)
            .then(() => {
            return execPromise(cmd, function (error, _stdout, stderr) {
                chai_1.expect(error).to.equal(null);
                chai_1.expect(stderr).to.equal("");
                chai_1.expect(filePathToHtml).to.be.a.file();
                chai_1.expect(filePathToCss).to.be.a.file();
            });
        })
            .then(() => {
            return rimrafPromise(htmlFolder);
        });
    });
    it("can create dot file from map", () => {
        let dotFolder = path.resolve(__dirname, "./dot/");
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToDot = path.resolve(__dirname, "./dot/test.dot");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " map -f dot " + filePath + " " + dotFolder;
        return rimrafPromise(dotFolder)
            .then(() => {
            return execPromise(cmd, (error, _stdout, stderr) => {
                chai_1.expect(error).to.equal(null);
                chai_1.expect(stderr).to.equal("");
                chai_1.expect(filePathToDot).to.be.a.file();
                if (error !== null) {
                    console.log("exec error: " + error);
                }
            });
        })
            .then(() => {
            return rimrafPromise(dotFolder);
        });
    });
    it("can create svg file from map", () => {
        let svgFolder = path.resolve(__dirname, "./svg/");
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToSvg = path.resolve(__dirname, "./svg/test.svg");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " map -f svg " + filePath + " " + svgFolder;
        return rimrafPromise(svgFolder)
            .then(() => {
            return execPromise(cmd, (error, _stdout, stderr) => {
                chai_1.expect(error).to.equal(null);
                chai_1.expect(stderr).to.equal("");
                chai_1.expect(filePathToSvg).to.be.a.file();
            });
        })
            .then(() => {
            return rimrafPromise(svgFolder);
        });
    });
    it("can create pdf file from map", () => {
        let pdfFolder = path.resolve(__dirname, "./pdf/");
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToPdf = path.resolve(__dirname, "./pdf/test.pdf");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " map " + filePath + " " + pdfFolder;
        return rimrafPromise(pdfFolder)
            .then(() => {
            return execPromise(cmd, (error, _stdout, stderr) => {
                chai_1.expect(error).to.equal(null);
                chai_1.expect(stderr).to.equal("");
                chai_1.expect(filePathToPdf).to.be.a.file();
            });
        })
            .then(() => {
            return rimrafPromise(pdfFolder);
        });
    });
    it("can create json file", () => {
        let jsonFolder = path.resolve(__dirname, "./json");
        let filePath = path.resolve(__dirname, "./test.argdown");
        let filePathToJson = path.resolve(__dirname, "./json/test.json");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " json " + filePath + " " + jsonFolder;
        return rimrafPromise(jsonFolder)
            .then(() => {
            return execPromise(cmd, (error, _stdout, stderr) => {
                chai_1.expect(error).to.equal(null);
                chai_1.expect(stderr).to.equal("");
                chai_1.expect(filePathToJson).to.be.a.file();
            });
        })
            .then(() => {
            return rimrafPromise(jsonFolder);
        });
    });
    it("can include files", () => {
        let globPath = path.resolve(__dirname, "./test/include-test.argdown");
        let expectedResult = fs.readFileSync(path.resolve(__dirname, "./include-test-expected-result.txt"), "utf8");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " compile " + globPath + " --stdout";
        return execPromise(cmd, (error, stdout, stderr) => {
            chai_1.expect(error).to.equal(null);
            chai_1.expect(stderr).to.equal("");
            chai_1.expect(stdout).to.not.equal(null);
            chai_1.expect(stdout.replace(/File \'.+\' already included./g, "File already included.")).to.equal(expectedResult.replace(/File \'.+\' already included./g, "File already included."));
        });
    });
    it("can load glob input", () => {
        let jsonFolder = path.resolve(__dirname, "./json");
        let globPath = path.resolve(__dirname, "./test/*.argdown");
        let filePathToJson1 = path.resolve(__dirname, "./json/test.json");
        let filePathToJson2 = path.resolve(__dirname, "./json/include-test.json");
        let filePathToJson3 = path.resolve(__dirname, "./json/_partial1.json");
        let filePathToCli = path.resolve(__dirname, "../dist/src/cli.js");
        const cmd = "node " + filePathToCli + " json '" + globPath + "' " + jsonFolder;
        return rimrafPromise(jsonFolder)
            .then(() => {
            return execPromise(cmd, (error, _stdout, stderr) => {
                chai_1.expect(error).to.equal(null);
                chai_1.expect(stderr).to.equal("");
                chai_1.expect(filePathToJson1).to.be.a.file();
                chai_1.expect(filePathToJson2).to.be.a.file();
                chai_1.expect(filePathToJson3).to.not.be.a.path();
            });
        })
            .then(() => {
            return rimrafPromise(jsonFolder);
        });
    });
});
//# sourceMappingURL=argdown-cli.spec.js.map