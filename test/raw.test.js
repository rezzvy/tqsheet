const test = require('node:test');
const assert = require('node:assert');

const TqSheet = require('../dist/tqsheet.node');
const testUrl = 'https://docs.google.com/spreadsheets/d/1-aoJ48IO31blJEW-0lzNj282pp-HKNAKTzT9Bl-7AUo/edit?gid=0#gid=0';

test('[RAW] Fetching data with query', async () => {
    const query = "SELECT * WHERE A = 'Dharma'";
    const result = await TqSheet.raw(testUrl, { query: query });

    assert.ok(result.table, 'Should return the built-in gviz table object');
    const rawRows = result.table.rows;
    assert.strictEqual(rawRows.length, 1, 'There should only be 1 result (Dharma)');
    assert.strictEqual(rawRows[0].c[0].v, 'Dharma');
});