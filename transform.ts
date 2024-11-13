import * as fs from 'fs';

interface ComponentSchemaInterface {
    id: number;
    name: string;
    label: string;
    type?: string;
    parent?: ComponentSchemaInterface;
    children: ComponentSchemaInterface[];
    attributes?: AttributeSchemaInterface[];
    component_types: any[];
    position: number;
    required?: boolean;
    needs_hot_water?: boolean;
    needs_cold_water?: boolean;
    needs_electricity?: boolean;
    mandatory: boolean;
    report_position: number;
}

interface AttributeSchemaInterface {
    id: number;
    name: string;
    label: string;
    type: string;
    required: boolean;
    list_values: ListValueSchemaInterface[];
    options?: string;
    position?: number;
}

interface ListValueSchemaInterface {
    id: number;
    name: string;
    label: string;
    values: ValueSchemaInterface[];
}

export interface ValueSchemaInterface {
    id: number;
    label: string;
    value: string;
    options?: OptionsSchemaInterface;
}

export interface OptionsSchemaInterface {
    type: string;
    dependency?: string;
}

interface ComponentTypeSchemaInterface {
    id: number;
    name: string;
    label: string;
    picto: string | null;
    parent: ComponentTypeSchemaInterface | null;
    type: string;
    required?: boolean;
    nature?: string;
    room_families?: ComponentTypeSchemaInterface[];
    position: number;
}

interface ContainerTemplateSchemaInterface {
    id: number;
    name: string;
    label: string;
    type: string;
    position: number;
    picto: string;
    children: ContainerTemplateSchemaInterface[];
    items: ItemTemplateSchemaInterface[];
}

interface ItemTemplateSchemaInterface {
    id: number;
    name: string;
    label: string;
    type: string;
    attributes: string;
    position: number;
    required: boolean;
    children: ItemTemplateSchemaInterface[];
}

const parseFiles = (componentsPath: string, componentTypesPath: string, outputPath: string) => {
    const components: ComponentSchemaInterface[] = JSON.parse(fs.readFileSync(componentsPath, 'utf-8'));
    const componentTypes: ComponentTypeSchemaInterface[] = JSON.parse(fs.readFileSync(componentTypesPath, 'utf-8'));

    // Step 1: Organize componentTypes into parent-child structure
    const componentTypeMap = new Map<number, ComponentTypeSchemaInterface>();
    const containerTemplates: ContainerTemplateSchemaInterface[] = [];

    // Populate map for quick access
    componentTypes.forEach(type => componentTypeMap.set(type.id, type));

    // Helper to find children and build container template structure
    const buildContainerTemplate = (type: ComponentTypeSchemaInterface): ContainerTemplateSchemaInterface => {
        const children = componentTypes
            .filter(childType => childType.parent?.id === type.id)
            .map(childType => buildContainerTemplate(childType));

        let roomFamilies = [];
        if (type.room_families && type.room_families.length > 0) {
            roomFamilies = type.room_families?.map(roomFamily => buildContainerTemplate(roomFamily));
        }
        return {
            id: type.id,
            name: type.name,
            label: type.label,
            type: type.type,
            position: type.position,
            picto: type.picto || '',
            children: [...children, ...roomFamilies],
            items: []
        };
    };

    // Find root types (those without a parent) and populate their children
    componentTypes.forEach(type => {
        if (!type.parent) {
            const containerTemplate = buildContainerTemplate(type);
            containerTemplates.push(containerTemplate);
        }
    });

    // Étape 1 : Créer une map de composants par ID
    const componentMap = new Map<number, ComponentSchemaInterface>();
    components.forEach(component => {
        component.children = []; // Initialiser le champ children pour chaque composant
        componentMap.set(component.id, component);
    });

    // Étape 2 : Construire la hiérarchie
    const rootComponents: ComponentSchemaInterface[] = [];

    components.forEach(component => {
        if (component.parent) {
            const parentComponent = componentMap.get(component.parent.id);
            if (parentComponent) {
                parentComponent.children.push(component);
            }
        } else {
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
    const buildItemTemplate = (component: ComponentSchemaInterface): ItemTemplateSchemaInterface => ({
        id: component.id,
        name: component.name,
        label: component.label,
        type: component.type || '',
        attributes: JSON.stringify(component.attributes || []),
        position: component.position,
        required: component.required || false,
        children: component.children.map(child => buildItemTemplate(child))
    });

    // pour chaque component, regarder si il a un parent
    // si il a un parent, regarder si le parent component_types correspond au container

    function processContainer(container, rootComponents) {
        // Loop over each component and check if it should be added to this container
        rootComponents.forEach(component => {
            if ((component.component_types?.map(ct => ct.name) || []).includes(container.name)) {
                console.log('push', component.name, 'to', container.name);
                container.items.push(buildItemTemplate(component));
            }
        });

        // Recursively process each child container
        container.children.forEach(child => {
            processContainer(child, rootComponents);
        });
    }

// Main loop over all container templates
    containerTemplates.forEach(container => {
        processContainer(container, rootComponents);
    });

    // Write output to JSON file
    fs.writeFileSync(outputPath, JSON.stringify(containerTemplates, null, 2));
    console.log(`Data written to ${outputPath}`);
};

// Use function
parseFiles('components.json', 'componentTypes.json', 'outputContainerTemplates.json');
