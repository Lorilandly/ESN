import config from 'config';
import DatabaseManager from '../db.js';
import FloodReportModel from '../models/floodReport.js';
import {
    getAllFloodReports,
    updateFloodReportByID,
    validAddress,
    validCity,
    validState,
    validZipcode,
    validDescription,
    initFloodReportController,
    invalidAddressMessage,
    invalidCityMessage,
    invalidStateMessage,
    invalidZipcodeMessage,
    invalidDescriptionMessage,
} from './floodReport.js';

beforeEach(async () => {
    const { host, port, name } = config.get('db');
    const {
        host: testDBHost,
        port: testDBPort,
        name: testDBName,
    } = config.get('performance-test-db');
    const dbManager = DatabaseManager.getInstance();
    dbManager.configureDB(host, port, name);
    dbManager.configureTestDB(testDBHost, testDBPort, testDBName);
    try {
        await dbManager.activateDB();
        await dbManager.activateTestDB();
    } catch (err) {
        console.error(err);
    }
    initFloodReportController(null, config.get('flood-report'));
});

test('getAllFloodReports empty when no reports exist', async () => {
    const gotFloodReports = await getAllFloodReports();
    expect(gotFloodReports.length).toEqual(0);
});

test('getAllFloodReports returns single report', async () => {
    const testFloodReport = new FloodReportModel({
        address: '1234 NE 56th St',
        city: 'Albany',
        state: 'NY',
        zipcode: '78900',
        description: 'Everything will be washed away!',
        time: new Date(1).toLocaleString(),
    });
    testFloodReport.id = await testFloodReport.persist();

    const gotFloodReports = await getAllFloodReports();
    expect(gotFloodReports.length).toEqual(1);

    const gotFloodReport = gotFloodReports[0];
    expect(gotFloodReport).toEqual(testFloodReport);
});

test('getAllFloodReports returns multiple reports', async () => {
    const testFloodReport1 = new FloodReportModel({
        address: '1234 NE 56th St',
        city: 'Albany',
        state: 'NY',
        zipcode: '78900',
        description: 'Everything will be washed away!',
        time: new Date(1).toLocaleString(),
    });
    testFloodReport1.id = await testFloodReport1.persist();

    const testFloodReport2 = new FloodReportModel({
        address: '4321 SW 11th St',
        city: 'Hell',
        state: 'Idaho',
        zipcode: '00000',
        description: 'Where am I?',
        time: new Date(2).toLocaleString(),
    });
    testFloodReport2.id = await testFloodReport2.persist();

    const gotFloodReports = await getAllFloodReports();
    expect(gotFloodReports.length).toEqual(2);

    expect(gotFloodReports).toContainEqual(testFloodReport1);
    expect(gotFloodReports).toContainEqual(testFloodReport2);
});

test('updateFloodReportByID returns all errors', async () => {
    const testInput = {
        address: '1234',
        city: 'A',
        state: 'AA',
        zipcode: '1234',
        description: 'A'.repeat(201),
    };
    const gotErrors = await updateFloodReportByID('0', testInput);
    expect(gotErrors).toContainEqual(invalidAddressMessage);
    expect(gotErrors).toContainEqual(invalidCityMessage);
    expect(gotErrors).toContainEqual(invalidStateMessage);
    expect(gotErrors).toContainEqual(invalidZipcodeMessage);
    expect(gotErrors).toContainEqual(invalidDescriptionMessage);
});

test('updateFloodReportByID nominal success returns null', async () => {
    const testInput = {
        address: '12345',
        city: 'AB',
        state: 'AZ',
        zipcode: '12345',
        description: 'A'.repeat(200),
    };
    const got = await updateFloodReportByID('0', testInput);
    expect(got).toBe(null);
});

test('validAddress returns false when lt length 5', async () => {
    expect(validAddress('ABCD')).toBe(false);
});

test('validAddress returns true lower bound', async () => {
    expect(validAddress('ABCDE')).toBe(true);
});

test('validCity returns false when lt length 2', async () => {
    expect(validCity('A')).toBe(false);
});

test('validCity returns true lower bound', async () => {
    expect(validCity('AB')).toBe(true);
});

test('validState returns false when abbreviation unknown', async () => {
    expect(validState('ZZ')).toBe(false);
});

test('validState returns true with known state abbreviation', async () => {
    expect(validState('CA')).toBe(true);
});

test('validZipcode returns false when not length 5', async () => {
    expect(validZipcode('1234')).toBe(false);
    expect(validZipcode('123456')).toBe(false);
});

test('validZipcode returns false when not all characters are digits', async () => {
    expect(validZipcode('1234A')).toBe(false);
});

test('validZipcode returns true nominal case', async () => {
    expect(validZipcode('12345')).toBe(true);
});

test('validDescription returns false when in excess of 200 characters', async () => {
    const desc = 'a'.repeat(201);
    expect(validDescription(desc)).toBe(false);
});

test('validDescription returns true upper bound', async () => {
    const desc = 'a'.repeat(200);
    expect(validDescription(desc)).toBe(true);
});

afterEach(async () => {
    const dbManager = DatabaseManager.getInstance();
    try {
        await dbManager.deactivateTestDB();
        await dbManager.DBPool.end();
    } catch (err) {
        console.error(err);
    }
});
