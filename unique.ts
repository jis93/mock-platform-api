import * as fs from 'fs';

const unique = () => {
    const translatedValuesPath = 'output/translatedValues.json';

    // Read and parse the JSON file
    const values: any[] = JSON.parse(fs.readFileSync(translatedValuesPath, 'utf-8'));

    // Remove duplicates based on the "id" property
    const uniqueValues = Array.from(
        new Map(values.map(item => [item.id, item])).values()
    );

    // Write the unique values back to the file (optional)
    fs.writeFileSync(translatedValuesPath, JSON.stringify(uniqueValues, null, 2), 'utf-8');

    return uniqueValues;
};

unique();
