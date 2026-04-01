const test = require('node:test');
const assert = require('node:assert');

const TqSheet = require('../dist/tqsheet.node');
const testUrl = 'https://docs.google.com/spreadsheets/d/1-aoJ48IO31blJEW-0lzNj282pp-HKNAKTzT9Bl-7AUo/edit?gid=0#gid=0';

test('[EXPORT] CSV & TSV', async () => {
    const csvData = await TqSheet.export(testUrl, 'csv');
    assert.strictEqual(typeof csvData, 'string', 'CSV result should be a string');
    assert.ok(csvData.includes('Name,Gender,Age,City'), 'Should contain CSV headers separated by commas');

    const tsvData = await TqSheet.export(testUrl, 'tsv');
    assert.strictEqual(typeof tsvData, 'string', 'TSV result should be a string');
    assert.ok(tsvData.includes('Name\tGender\tAge\tCity'), 'Should contain TSV headers separated by tabs');
});

test('[EXPORT] PDF & XLSX', async () => {
    const pdfData = await TqSheet.export(testUrl, 'pdf');
    assert.ok(pdfData instanceof Blob, 'PDF export result should be a Blob');
    assert.strictEqual(pdfData.type, 'application/pdf', 'MIME type should be application/pdf');

    const xlsxData = await TqSheet.export(testUrl, 'xlsx');
    assert.ok(xlsxData instanceof Blob, 'XLSX export result should be a Blob');
    assert.ok(xlsxData.size > 0, 'XLSX Blob should not be empty');
});

test('[EXPORT] Unsupported format Error', async () => {
    await assert.rejects(
        async () => await TqSheet.export(testUrl, 'json'),
        /Unsupported format. Use: csv, tsv, pdf, or xlsx./,
        'Should throw an error for unsupported formats'
    );
});