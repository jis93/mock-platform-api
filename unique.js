"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var unique = function () {
    var translatedValuesPath = 'output/translatedValues.json';
    // Read and parse the JSON file
    var values = JSON.parse(fs.readFileSync(translatedValuesPath, 'utf-8'));
    // Remove duplicates based on the "id" property
    var uniqueValues = Array.from(new Map(values.map(function (item) { return [item.id, item]; })).values());
    // Write the unique values back to the file (optional)
    fs.writeFileSync(translatedValuesPath, JSON.stringify(uniqueValues, null, 2), 'utf-8');
    return uniqueValues;
};
unique();
