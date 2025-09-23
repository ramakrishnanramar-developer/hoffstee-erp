export function convertLedgersForHierarchy(ledgers, parentColumnName) {
    return ledgers.map(l => ({
        id: l.id,
        name: l.name,
        parentId: l[parentColumnName] ?? 0, // ✅ dynamic property access
    }));
}