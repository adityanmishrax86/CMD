const CliTest = require('command-line-test');
const os = require('os');
describe('oms login', () => {
    const clientTest = new CliTest();

    it("should login user", function* () {

        const res = yield clientTest.exec("oms login -u 'mishraaditya384@gmail.com' -a 'http://localhost:8080/' -p Ready2go@.");
        const expectedResult = JSON.parse(JSON.stringify(res.stdout));
        expect(expectedResult).toEqual(expect.any(String))
        // console.log(expectedResult);
    })

    it("should save logged in user's context in Home directory", (done) => {

        clientTest.exec("oms login -u 'mishraaditya384@gmail.com' -a 'http://localhost:8080/' -p Ready2go@.", (err, res) => {
            const pkg = res.stdout
            const omsPath = os.homedir()

            expect(omsPath).toMatch(pkg.substring(17).slice(0, -18))
            done();
        })
    })
});