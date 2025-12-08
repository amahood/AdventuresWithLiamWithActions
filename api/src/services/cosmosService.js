const { CosmosClient } = require('@azure/cosmos');

let client;
let database;
let container;

async function getContainer() {
    if (container) return container;

    const connectionString = process.env.COSMOS_CONNECTION_STRING;
    const databaseName = process.env.COSMOS_DATABASE_NAME || 'AdventuresWithLiam';
    const containerName = process.env.COSMOS_CONTAINER_NAME || 'adventures';

    if (!connectionString || connectionString.includes('<your-cosmos')) {
        throw new Error('Cosmos DB connection string not configured');
    }

    client = new CosmosClient(connectionString);
    
    // Create database if not exists
    const { database: db } = await client.databases.createIfNotExists({
        id: databaseName
    });
    database = db;

    // Create container if not exists
    const { container: cont } = await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: ['/category'] }
    });
    container = cont;

    return container;
}

async function getAdventures() {
    try {
        const container = await getContainer();
        const { resources } = await container.items
            .query('SELECT * FROM c')
            .fetchAll();
        
        // Group by category
        const grouped = {};
        resources.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        
        return grouped;
    } catch (error) {
        console.error('Error getting adventures:', error);
        throw error;
    }
}

async function saveAdventure(category, adventure) {
    try {
        const container = await getContainer();
        
        const document = {
            id: `${category}-${adventure.id}`,
            category,
            ...adventure
        };

        const { resource } = await container.items.upsert(document);
        return resource;
    } catch (error) {
        console.error('Error saving adventure:', error);
        throw error;
    }
}

async function deleteAdventure(category, adventureId) {
    try {
        const container = await getContainer();
        const id = `${category}-${adventureId}`;
        await container.item(id, category).delete();
        return true;
    } catch (error) {
        console.error('Error deleting adventure:', error);
        throw error;
    }
}

module.exports = {
    getAdventures,
    saveAdventure,
    deleteAdventure
};
