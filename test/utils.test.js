const sinon = require('sinon');
const assert = require('assert');
const { uniqueUsername,transactionUUID } = require('../common/utils');

describe('uniqueUsername function', () => {
  it('should return a string of unique characters', () => {
    const mathRandomStub = sinon.stub(Math, 'random').returns(0.5);
    const dateNowStub = sinon.stub(Date, 'now').returns(1620285473000);
    const mathFloorSpy = sinon.spy(Math, 'floor');
    const expectedFloorValue = Math.floor(0.5 * 1620285473000).toString(16);
    const username = uniqueUsername();

    assert.strictEqual(mathFloorSpy.firstCall.returnValue.toString(16), expectedFloorValue);
    assert.strictEqual(username, '22fnm38k');

    mathRandomStub.restore();
    dateNowStub.restore();
    mathFloorSpy.restore();
  });
});

describe('transactionUUID function', () => {
  it('should generate a transaction UUID with the correct format', () => {
    const table_number = 5;
    const dateNowStub = sinon.stub(Date, 'now').returns(1620285473000);
    const timestampUnix = Math.floor(1620285473000 / 1000);
    const uuid = transactionUUID(table_number);
    const expectedUUID = `${table_number}-${timestampUnix}`;

    assert.strictEqual(uuid, expectedUUID);
    dateNowStub.restore();
  });
});
