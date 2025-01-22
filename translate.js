"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var axios_1 = require("axios");
var extractAttributes = function () {
    var componentsPath = 'output/componentTemplate.json';
    var components = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'));
    var attributes = [];
    components.forEach(function (component) {
        if (component.attributes) {
            var componentAttributes = JSON.parse(component.attributes);
            attributes.push.apply(attributes, componentAttributes);
        }
    });
    var uniqueAttributes = Array.from(new Set(attributes));
    fs.writeFileSync('output/attributes.json', JSON.stringify(uniqueAttributes, null, 2));
    console.log(attributes);
};
var extractListValues = function () {
    var attributesPath = 'output/attributes.json';
    var attributes = JSON.parse(fs.readFileSync(attributesPath, 'utf-8'));
    var listValues = [];
    attributes.forEach(function (attr) {
        listValues.push.apply(listValues, attr.list_values);
    });
    var uniqueListValues = Array.from(new Set(listValues));
    fs.writeFileSync('output/listValues.json', JSON.stringify(uniqueListValues, null, 2));
    console.log(listValues);
};
var extractValues = function () {
    var listValuesPath = 'output/listValues.json';
    var listValues = JSON.parse(fs.readFileSync(listValuesPath, 'utf-8'));
    var values = [];
    listValues.forEach(function (listValue) {
        values.push.apply(values, listValue.values);
    });
    var uniqueValues = Array.from(new Set(values));
    fs.writeFileSync('output/values.json', JSON.stringify(uniqueValues, null, 2));
    console.log(values);
};
// extractAttributes();
// extractListValues();
// extractValues();
// https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q="salut les amis"
var translateValues = function () { return __awaiter(void 0, void 0, void 0, function () {
    var url, headers, valuesPath, values, translatedValues, getTranslation, valuesToTranslate, chunkSize, chunks, i, _i, chunks_1, chunk;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                url = "http://localhost:11434/api/generate";
                headers = {
                    "Content-Type": "application/json",
                };
                valuesPath = 'output/tsl-pt1.json';
                values = JSON.parse(fs.readFileSync(valuesPath, 'utf-8'));
                translatedValues = [];
                getTranslation = function (value) { return __awaiter(void 0, void 0, void 0, function () {
                    var data;
                    return __generator(this, function (_a) {
                        data = {
                            // model: 'mistral-small',
                            model: 'llama3.3:70b-instruct-q2_K',
                            prompt: 'in the context of property inspection, translate french to english (only short answers) (only final answer): "' + value +
                                '", (very important) no explanation, answer with only the translation of the words, (very important) if you did not found a translation return the word "error", (very important) if you have multiple translation (1 or 2) choose one of them that you think is most appropriate (no need to write explanation), no period character at the end of the sentence, (very important) do not explain your translation',
                            stream: false,
                        };
                        return [2 /*return*/, axios_1.default.post(url, data, { headers: headers }).then(function (response) {
                                return response.data.response;
                            })];
                    });
                }); };
                valuesToTranslate = values;
                chunkSize = 5;
                chunks = [];
                for (i = 0; i < valuesToTranslate.length; i += chunkSize) {
                    chunks.push(valuesToTranslate.slice(i, i + chunkSize));
                }
                _i = 0, chunks_1 = chunks;
                _a.label = 1;
            case 1:
                if (!(_i < chunks_1.length)) return [3 /*break*/, 4];
                chunk = chunks_1[_i];
                return [4 /*yield*/, Promise.all(chunk.map(function (value) { return __awaiter(void 0, void 0, void 0, function () {
                        var response, translatedLabel, translatedLabelCleaned;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, getTranslation(value.label)];
                                case 1:
                                    response = _a.sent();
                                    console.log(response);
                                    translatedLabel = response;
                                    translatedLabelCleaned = translatedLabel.replace(/^[“”"]|[“”"]$/g, '');
                                    translatedValues.push(__assign(__assign({}, value), { label: translatedLabelCleaned }));
                                    return [2 /*return*/];
                            }
                        });
                    }); }))];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                _i++;
                return [3 /*break*/, 1];
            case 4:
                fs.writeFileSync('output/translatedValues-v2-pt1.json', JSON.stringify(translatedValues, null, 2));
                console.log(translatedValues);
                return [2 /*return*/];
        }
    });
}); };
translateValues();
