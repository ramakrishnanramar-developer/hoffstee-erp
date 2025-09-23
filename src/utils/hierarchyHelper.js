export const buildHierarchy = (entities) => {
    const map = {};
    const roots = [];
    console.log(entities);
    entities.forEach((entity) => {
        map[entity.id] = { ...entity, children: [] };
    });

    entities.forEach((entity) => {
        if (entity.parentId && entity.parentId !== 0) {
            map[entity.parentId]?.children.push(map[entity.id]);
        } else {
            roots.push(map[entity.id]);
        }
    });

    const flatten = (nodes, prefix = "") => {
        return nodes.flatMap((node) => [
            { ...node, displayName: prefix + node.name },
            ...flatten(node.children, prefix + "---"),
        ]);
    };

    return flatten(roots);
};
