const CliTest = require('command-line-test');

describe('oms get', () => {
    const clientTest = new CliTest();

    it("should return records ", function* () {

        const res = yield clientTest.exec('oms get');
        const expectedResult = JSON.parse(JSON.stringify(res.stdout));
        expect(expectedResult).toEqual(expect.any(String))
    })

    it("should return particular record", function* () {
        const res = yield clientTest.exec('oms get -i 1');
        const expectedResult = JSON.parse(JSON.stringify(res.stdout));
        expect(expectedResult).toEqual(expect.any(String))
    })

    it("should return Error string if searched for record that does not exist", function* () {
        const res = yield clientTest.exec('oms get -i 100000000');
        const expectedResult = JSON.parse(JSON.stringify(res.stdout));
        expect(expectedResult).toMatch('Error parsing JSON string')
    })

    // it("should return Error string if not authenticated", function* () {
    //     const res = yield clientTest.exec('oms get');
    //     const expectedResult = JSON.parse(JSON.stringify(res.stdout));
    //     expect(expectedResult).toMatch('401 Unauthorized Error')
    // })

})


