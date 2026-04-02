# TqSheet

Query, fetch, and export Google Sheets data without any setup using GViz API.

## Overview

TqSheet helps you fetch, query, and export data from public Google Sheets without any setup like API keys or OAuth.

- Query data using a simple SQL-like syntax
- Export data to PDF, XLSX, CSV, or TSV
- Data is parsed internally and ready to use

## Installation & Usage

### Installation

#### Browser

Include the script tag:

```html
<script src="https://cdn.jsdelivr.net/gh/rezzvy/tqsheet@c2d3449/dist/tqsheet.min.js"></script>
```

#### Node

Install via npm:

```bash
npm install tqsheet
```

```javascript
const TqSheet = require("tqsheet");
```

### Usage

```javascript
(async () => {
  const result = await TqSheet.get("https://docs.google.com/spreadsheets/d/1-aoJ48IO31blJEW-0lzNj282pp-HKNAKTzT9Bl-7AUo/edit?usp=sharing", {
    query: "SELECT *",
  });

  console.log(result);
})();
```

## Examples

### Query specific data and return as object

```javascript
(async () => {
  const result = await TqSheet.get("https://docs.google.com/spreadsheets/d/1-aoJ48IO31blJEW-0lzNj282pp-HKNAKTzT9Bl-7AUo/edit?usp=sharing", {
    query: "SELECT * WHERE A = 'Reza'",
    asObj: true,
  });

  const row = result.data.rows[0];

  console.log(row.Name);
  console.log(row.Gender);
  console.log(row.Age);
  console.log(row.City);
  console.log(row["Registration Date"]);
})();
```

### Export to PDF (Download)

```javascript
(async () => {
  const blob = await TqSheet.export("https://docs.google.com/spreadsheets/d/1-aoJ48IO31blJEW-0lzNj282pp-HKNAKTzT9Bl-7AUo/edit?usp=sharing", "pdf");
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "sheet.pdf";
  document.body.appendChild(a);
  a.click();
})();
```

## Documentation

### API Reference

#### `get()`

Fetches and parses data from a Google Sheet.

**Parameters**

| Param     | Type     | Description                                             |
| :-------- | :------- | :------------------------------------------------------ |
| `url`     | `string` | A valid Google Sheets URL.                              |
| `options` | `object` | _(Optional)_ Options to customize the query and output. |

**`options` properties**

| Property   | Type      | Default      | Description                                                           |
| :--------- | :-------- | :----------- | :-------------------------------------------------------------------- |
| `query`    | `string`  | `"SELECT *"` | Query string to filter or select data.                                |
| `sheet`    | `string`  | `"Sheet1"`   | Name of the sheet to use.                                             |
| `asObj`    | `boolean` | `false`      | Return rows as objects using column labels as keys.                   |
| `skipNull` | `boolean` | `false`      | Skip null values. Automatically returns rows as objects when enabled. |

**Returns**

On success:

```javascript
{
  data: {
    columns: [...],
    rows: [...]
  },
  message: "ok"
}
```

On error:

```javascript
{
  data: null,
  message: "ERR_MSG" // e.g. "Invalid query or empty response" or "HTTP Error {CODE}"
}
```

#### `raw()`

Fetches data directly from the Google Visualization API and returns the parsed response as-is, without additional formatting.

**Parameters**

| Param     | Type     | Description                           |
| :-------- | :------- | :------------------------------------ |
| `url`     | `string` | A valid Google Sheets URL.            |
| `options` | `object` | _(Optional)_ Options for the request. |

**`options` properties**

| Property | Type     | Default      | Description                            |
| :------- | :------- | :----------- | :------------------------------------- |
| `query`  | `string` | `"SELECT *"` | Query string to filter or select data. |
| `sheet`  | `string` | `"Sheet1"`   | Name of the sheet to use.              |

**Returns**

Returns a parsed JSON **object** from the Google `gviz` endpoint.

#### `export()`

Exports a Google Sheet into different file formats.

**Parameters**

| Param       | Type     | Description                                                                           |
| :---------- | :------- | :------------------------------------------------------------------------------------ |
| `url`       | `string` | A valid Google Sheets URL.                                                            |
| `type`      | `string` | _(Optional)_ File format: `"csv"`, `"tsv"`, `"pdf"`, or `"xlsx"`. Default is `"csv"`. |
| `sheetName` | `string` | _(Optional)_ Name of the sheet to export.                                             |

**Returns**

- Returns a **`Blob`** for binary formats (`pdf`, `xlsx`)
- Returns a **`string`** for text formats (`csv`, `tsv`)

### Data Querying

To learn more about queries and available syntax, check out the official documentation:
[https://developers.google.com/chart/interactive/docs/querylanguage](https://developers.google.com/chart/interactive/docs/querylanguage)

## Contributing

There's always room for improvement. Feel free to contribute!

## Licensing

The project is licensed under MIT License. Check the license file for more details.
