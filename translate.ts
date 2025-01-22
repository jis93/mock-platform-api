import * as fs from 'fs';
import axios from 'axios';

export interface BaseComponentInterface<T> {
    id: string | number;
    name: string;
    label: string;
    type: string;
    position: number;
    attributes: string;
    required: boolean;
    children: T[];
}

export interface ComponentTemplateSchemaInterface extends BaseComponentInterface<ComponentTemplateSchemaInterface> {
    id: number;
}

const extractAttributes = () => {
    const componentsPath = 'output/componentTemplate.json';
    const components: ComponentTemplateSchemaInterface[] = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'));

    const attributes = [];
    components.forEach((component) => {
        if (component.attributes) {
            const componentAttributes = JSON.parse(component.attributes);
            attributes.push(...componentAttributes);
        }
    });

    const uniqueAttributes = Array.from(new Set(attributes));

    fs.writeFileSync('output/attributes.json', JSON.stringify(uniqueAttributes, null, 2));
    console.log(attributes);
}

const extractListValues = () => {
    const attributesPath = 'output/attributes.json';
    const attributes: any[] = JSON.parse(fs.readFileSync(attributesPath, 'utf-8'));

    const listValues = [];
    attributes.forEach((attr) => {
        listValues.push(...attr.list_values);
    });

    const uniqueListValues = Array.from(new Set(listValues));

    fs.writeFileSync('output/listValues.json', JSON.stringify(uniqueListValues, null, 2));
    console.log(listValues);
}

const extractValues = () => {
    const listValuesPath = 'output/listValues.json';
    const listValues: any[] = JSON.parse(fs.readFileSync(listValuesPath, 'utf-8'));

    const values = [];
    listValues.forEach((listValue) => {
        values.push(...listValue.values);
    });

    const uniqueValues = Array.from(new Set(values));

    fs.writeFileSync('output/values.json', JSON.stringify(uniqueValues, null, 2));
    console.log(values);
}

// extractAttributes();
// extractListValues();
// extractValues();

// https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q="salut les amis"
const translateValues = async () => {
    // const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=`;
    const url = `http://localhost:11434/api/generate`;
    const headers = {
        "Content-Type": "application/json",
    }
    const valuesPath = 'output/tsl-pt1.json';
    const values: any[] = JSON.parse(fs.readFileSync(valuesPath, 'utf-8'));

    const translatedValues = [];

    const getTranslation = async (value: any) => {
        const data = {
            // model: 'mistral-small',
            model: 'llama3.3:70b-instruct-q2_K',
            prompt: 'in the context of property inspection, translate french to english (only short answers) (only final answer): "' + value +
                '", (very important) no explanation, answer with only the translation of the words, (very important) if you did not found a translation return the word "error", (very important) if you have multiple translation (1 or 2) choose one of them that you think is most appropriate (no need to write explanation), no period character at the end of the sentence, (very important) do not explain your translation',
            stream: false,
        }
        return axios.post(url, data, { headers }).then(response => {
            return response.data.response;
        });
        // return axios.get(`${url}"${value}"`)
    }

    // console.log(values[0]);
    // console.log((await getTranslation(values[0].label)).data[0][0][1]);

    // const valuesToTranslate = values.slice(0, 10);
    const valuesToTranslate = values;

    const chunkSize = 5;  // nombre de requêtes en parallèle
    const chunks = [];
    for (let i = 0; i < valuesToTranslate.length; i += chunkSize) {
        chunks.push(valuesToTranslate.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
        await Promise.all(
            chunk.map(async (value) => {
                const response = await getTranslation(value.label);
                console.log(response);
                const translatedLabel = response;
                const translatedLabelCleaned = translatedLabel.replace(/^[“”"]|[“”"]$/g, '');
                translatedValues.push({
                    ...value,
                    label: translatedLabelCleaned,
                });
            })
        );
    }

    fs.writeFileSync('output/translatedValues-v2-pt1.json', JSON.stringify(translatedValues, null, 2));
    console.log(translatedValues);
}

translateValues();