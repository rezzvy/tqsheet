const test = require('node:test');
const assert = require('node:assert');

const TqSheet = require('../dist/tqsheet.node');
const testUrl = 'https://docs.google.com/spreadsheets/d/1-aoJ48IO31blJEW-0lzNj282pp-HKNAKTzT9Bl-7AUo/edit?gid=0#gid=0';

test('[GET] Fetching Data', async () => {
    const result = await TqSheet.get(testUrl);

    assert.strictEqual(result.message, 'ok', 'Message should be ok');
    assert.ok(result.data.columns.length > 0, 'Columns should not be empty');
    assert.ok(result.data.rows.length >= 10, 'There should be at least 10 rows of data');

    assert.strictEqual(result.data.columns[0].label, 'Name');
    assert.strictEqual(result.data.rows[0][0], 'Reza');
});

test('[GET] Using "asObj" option', async () => {
    const result = await TqSheet.get(testUrl, { asObj: true });
    assert.strictEqual(result.message, 'ok');

    const susanRow = result.data.rows.find(r => r.Name === 'Susan');
    assert.ok(susanRow, 'Susan should exist in the dataset');

    assert.strictEqual(susanRow.hasOwnProperty('Age'), true, 'Age key should exist');
    assert.strictEqual(susanRow.Age, null, 'Age value should be null');
});

test('[GET] Using "skipNull" option', async () => {
    const result = await TqSheet.get(testUrl, { skipNull: true });
    assert.strictEqual(result.message, 'ok');

    const susanRow = result.data.rows.find(r => r.Name === 'Susan');
    assert.ok(susanRow, 'Susan should exist in the dataset');
    assert.strictEqual(susanRow.Name, 'Susan');
    assert.strictEqual(susanRow.City, 'Denpasar');

    assert.strictEqual(susanRow.hasOwnProperty('Age'), false, 'Age key should NOT exist for Susan');
    assert.strictEqual(susanRow.hasOwnProperty('Registration Date'), false, 'Registration Date key should NOT exist for Susan');
});

test('[GET] Using "query" and "sheet" options', async () => {
    const result = await TqSheet.get(testUrl, {
        query: "SELECT * WHERE B = 'Female'",
        asObj: true,
        sheet: "Sheet1"
    });

    assert.strictEqual(result.message, 'ok');
    assert.ok(result.data.rows.length > 0, 'Should return filtered rows');

    const allFemale = result.data.rows.every(row => row.Gender === 'Female');
    assert.ok(allFemale, 'All returned rows should have Gender: Female');
});

test('[GET] Parameter Validation Error', async () => {
    await assert.rejects(
        async () => await TqSheet.get(testUrl, "invalid-options-string"),
        /Options parameter must be a plain object/,
        'Should throw an error if options is not an object'
    );
});

test('[GET] Invalid URL', async () => {
    const fakeUrl = 'https://docs.google.com/spreadsheets/d/invalid-id/edit';
    const result = await TqSheet.get(fakeUrl);

    assert.ok(result.message.includes('HTTP Error'), 'Should return an HTTP error message');
    assert.strictEqual(result.data, null);
});