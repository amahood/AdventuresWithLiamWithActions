const { BlobServiceClient } = require('@azure/storage-blob');
const { v4: uuidv4 } = require('uuid');

let containerClient;

async function getBlobContainer() {
    if (containerClient) return containerClient;

    const connectionString = process.env.BLOB_CONNECTION_STRING;
    const containerName = process.env.BLOB_CONTAINER_NAME || 'adventure-images';

    if (!connectionString || connectionString.includes('<your-blob')) {
        throw new Error('Blob Storage connection string not configured');
    }

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    containerClient = blobServiceClient.getContainerClient(containerName);
    
    // Create container if not exists
    await containerClient.createIfNotExists({
        access: 'blob' // Public read access for images
    });

    return containerClient;
}

async function uploadImage(base64Data, fileName) {
    try {
        const container = await getBlobContainer();
        
        // Extract base64 content and content type
        const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            throw new Error('Invalid base64 image data');
        }

        const contentType = matches[1];
        const base64Content = matches[2];
        const buffer = Buffer.from(base64Content, 'base64');

        // Generate unique blob name
        const extension = contentType.split('/')[1] || 'jpg';
        const blobName = `${uuidv4()}-${fileName || 'image'}.${extension}`;
        
        const blockBlobClient = container.getBlockBlobClient(blobName);
        
        await blockBlobClient.upload(buffer, buffer.length, {
            blobHTTPHeaders: {
                blobContentType: contentType
            }
        });

        return blockBlobClient.url;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

async function deleteImage(blobUrl) {
    try {
        const container = await getBlobContainer();
        
        // Extract blob name from URL
        const url = new URL(blobUrl);
        const blobName = url.pathname.split('/').pop();
        
        const blockBlobClient = container.getBlockBlobClient(blobName);
        await blockBlobClient.deleteIfExists();
        
        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
}

module.exports = {
    uploadImage,
    deleteImage
};
