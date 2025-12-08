const { app } = require('@azure/functions');
const { uploadImage, deleteImage } = require('../services/blobService');

// POST /api/images - Upload an image
app.http('uploadImage', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'images',
    handler: async (request, context) => {
        context.log('Uploading image');

        try {
            const body = await request.json();
            const { image, fileName } = body;

            if (!image) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Image data is required' })
                };
            }

            const url = await uploadImage(image, fileName);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ url })
            };
        } catch (error) {
            context.log('Error uploading image:', error.message);

            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Failed to upload image' })
            };
        }
    }
});

// DELETE /api/images - Delete an image
app.http('deleteImage', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'images',
    handler: async (request, context) => {
        context.log('Deleting image');

        try {
            const body = await request.json();
            const { url } = body;

            if (!url) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Image URL is required' })
                };
            }

            await deleteImage(url);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ success: true })
            };
        } catch (error) {
            context.log('Error deleting image:', error.message);

            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Failed to delete image' })
            };
        }
    }
});

// OPTIONS handler for CORS preflight
app.http('imagesCors', {
    methods: ['OPTIONS'],
    authLevel: 'anonymous',
    route: 'images',
    handler: async (request, context) => {
        return {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
});
