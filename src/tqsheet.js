class TqSheet {
    static async get(url, options = {}) {
        if (typeof options !== "object" || options === null) {
            throw new Error("Options parameter must be a plain object");
        }

        const response = await this.#fetchData(url, options);
        if (!response.data) return { data: null, message: response.message };

        const columns = this.#parseColumns(response.data.table.cols);
        const rows = this.#parseRows(response.data.table.rows, columns);

        const { skipNull, asObj } = options;

        if (skipNull) {
            return {
                data: { columns, rows: rows.map((row) => this.#rowToObject(row, columns, true)) },
                message: response.message,
            };
        }

        if (asObj) {
            return {
                data: { columns, rows: rows.map((row) => this.#rowToObject(row, columns)) },
                message: response.message,
            };
        }

        return { data: { columns, rows }, message: response.message };
    }


    static async raw(url, { query, sheet } = {}) {
        return await this.#fetchData(url, { sheet, query, isRaw: true });
    }

    static async export(url, type = "csv", sheetName) {
        const exportFormats = {
            csv: "export?format=csv",
            tsv: "export?format=tsv",
            pdf: "export?format=pdf",
            xlsx: "export?format=xlsx",
        };

        if (!exportFormats[type]) {
            throw new Error("Unsupported format. Use: csv, tsv, pdf, or xlsx.");
        }

        const sheetQuery = sheetName ? `&sheet=${encodeURIComponent(sheetName)}` : "";
        const exportUrl = `${this.#getBaseUrl(url)}/${exportFormats[type]}${sheetQuery}`;

        const response = await fetch(exportUrl);
        if (!response.ok) throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);

        const isBinaryFormat = type === "pdf" || type === "xlsx";
        return isBinaryFormat ? await response.blob() : await response.text();
    }

    static #parseColumns(rawColumns) {
        return rawColumns.map((column, index) => ({
            label: column?.label || column?.id || `Column ${index + 1}`,
            id: column?.id ?? null,
            type: column?.type ?? null,
        }));
    }

    static #parseRows(rawRows, columns) {
        return rawRows.map((row) =>
            columns.map((_, colIndex) => this.#parseValue(row.c?.[colIndex]?.v ?? null))
        );
    }

    static #parseValue(value) {
        if (typeof value === "string" && value.startsWith("Date(")) {
            const [year, month, day] = value.slice(5, -1).split(",").map(Number);
            return new Date(year, month, day);
        }
        return value;
    }

    static #rowToObject(row, columns, skipNull = false) {
        const entries = columns.map((column, index) => [column.label, row[index]]);
        const filteredEntries = skipNull ? entries.filter(([, value]) => value !== null) : entries;
        return Object.fromEntries(filteredEntries);
    }

    static #getBaseUrl(url) {
        const sheetId = url.match(/\/d\/([^/]+)/)?.[1];
        if (!sheetId) throw new Error("Invalid Google Sheets URL");
        return `https://docs.google.com/spreadsheets/d/${sheetId}`;
    }

    static async #fetchData(url, options) {
        const { sheet = "Sheet1", query = "SELECT *", isRaw = false } = options;
        const endpoint = `${this.#getBaseUrl(url)}/gviz/tq?sheet=${encodeURIComponent(sheet)}&tq=${encodeURIComponent(query)}`;
        const response = await fetch(endpoint);

        if (!response.ok) {
            return { data: null, message: `HTTP Error ${response.status}: ${response.statusText}` };
        }

        const rawText = await response.text();
        const jsonData = JSON.parse(rawText.slice(rawText.indexOf("{"), rawText.lastIndexOf("}") + 1));

        if (isRaw) return jsonData;
        if (!jsonData.table) return { data: null, message: "Invalid query or empty response" };

        return { data: jsonData, message: "ok" };
    }
}

module.exports = TqSheet;