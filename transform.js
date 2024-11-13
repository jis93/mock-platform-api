"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var parseFiles = function (componentsPath, componentTypesPath, outputPath) {
    var components = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'));
    var componentTypes = JSON.parse(fs.readFileSync(componentTypesPath, 'utf-8'));
    // Step 1: Organize componentTypes into parent-child structure
    var componentTypeMap = new Map();
    var containerTemplates = [];
    // Populate map for quick access
    componentTypes.forEach(function (type) { return componentTypeMap.set(type.id, type); });
    // Helper to find children and build container template structure
    var buildContainerTemplate = function (type) {
        var _a;
        var children = componentTypes
            .filter(function (childType) { var _a; return ((_a = childType.parent) === null || _a === void 0 ? void 0 : _a.id) === type.id; })
            .map(function (childType) { return buildContainerTemplate(childType); });
        var roomFamilies = [];
        if (type.room_families && type.room_families.length > 0) {
            roomFamilies = (_a = type.room_families) === null || _a === void 0 ? void 0 : _a.map(function (roomFamily) { return buildContainerTemplate(roomFamily); });
        }
        return {
            id: type.id,
            name: type.name,
            label: type.label,
            type: type.type,
            position: type.position,
            picto: type.picto || '',
            children: __spreadArray(__spreadArray([], children, true), roomFamilies, true),
            items: []
        };
    };
    // Find root types (those without a parent) and populate their children
    componentTypes.forEach(function (type) {
        if (!type.parent) {
            var containerTemplate = buildContainerTemplate(type);
            containerTemplates.push(containerTemplate);
        }
    });
    // Étape 1 : Créer une map de composants par ID
    var componentMap = new Map();
    components.forEach(function (component) {
        component.children = []; // Initialiser le champ children pour chaque composant
        componentMap.set(component.id, component);
    });
    // Étape 2 : Construire la hiérarchie
    var rootComponents = [];
    components.forEach(function (component) {
        if (component.parent) {
            var parentComponent = componentMap.get(component.parent.id);
            if (parentComponent) {
                parentComponent.children.push(component);
            }
        }
        else {
            // Si pas de parent, c'est un composant racine
            rootComponents.push(component);
        }
    });
    // console.log('rootComponents', rootComponents.map(c => {
    //     return {
    //         name: c.name,
    //         children: c.children.map(child => child.name)
    //     };
    // }));
    // Step 2: Populate items for each containerTemplate by matching component_types
    var buildItemTemplate = function (component) { return ({
        id: component.id,
        name: component.name,
        label: component.label,
        type: component.type || '',
        attributes: JSON.stringify(component.attributes || []),
        position: component.position,
        required: component.required || false,
        children: component.children.map(function (child) { return buildItemTemplate(child); })
    }); };
    // pour chaque component, regarder si il a un parent
    // si il a un parent, regarder si le parent component_types correspond au container
    function processContainer(container, rootComponents) {
        // Loop over each component and check if it should be added to this container
        rootComponents.forEach(function (component) {
            var _a;
            if ((((_a = component.component_types) === null || _a === void 0 ? void 0 : _a.map(function (ct) { return ct.name; })) || []).includes(container.name)) {
                console.log('push', component.name, 'to', container.name);
                container.items.push(buildItemTemplate(component));
            }
        });
        // Recursively process each child container
        container.children.forEach(function (child) {
            processContainer(child, rootComponents);
        });
    }
    // Main loop over all container templates
    containerTemplates.forEach(function (container) {
        processContainer(container, rootComponents);
    });
    // Write output to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(containerTemplates, null, 2));
    console.log("Data written to ".concat(outputPath));
};
// Use function
parseFiles('components.json', 'componentTypes.json', 'outputContainerTemplates.json');
