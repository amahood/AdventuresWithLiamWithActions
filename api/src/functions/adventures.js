const { app } = require('@azure/functions');
const { getAdventures, saveAdventure } = require('../services/cosmosService');
const { uploadImage } = require('../services/blobService');

// GET /api/adventures - Get all adventures
app.http('getAdventures', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'adventures',
    handler: async (request, context) => {
        context.log('Getting all adventures');

        try {
            const adventures = await getAdventures();
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(adventures)
            };
        } catch (error) {
            context.log('Error getting adventures:', error.message);
            
            // Return empty object if DB not configured (fallback to localStorage)
            if (error.message.includes('not configured')) {
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({})
                };
            }

            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Failed to get adventures' })
            };
        }
    }
});

// POST /api/adventures - Save an adventure
app.http('saveAdventure', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'adventures',
    handler: async (request, context) => {
        context.log('Saving adventure');

        try {
            const body = await request.json();
            const { category, adventure } = body;

            if (!category || !adventure) {
                return {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ error: 'Category and adventure are required' })
                };
            }

            // Upload images to blob storage if they are base64
            let processedAdventure = { ...adventure };
            
            try {
                if (adventure.images && adventure.images.length > 0) {
                    const uploadedImages = await Promise.all(
                        adventure.images.map(async (img, index) => {
                            if (img.startsWith('data:')) {
                                return await uploadImage(img, `${adventure.id}-${index}`);
                            }
                            return img;
                        })
                    );
                    processedAdventure.images = uploadedImages;
                }

                if (adventure.thumbnail && adventure.thumbnail.startsWith('data:')) {
                    processedAdventure.thumbnail = await uploadImage(
                        adventure.thumbnail, 
                        `${adventure.id}-thumbnail`
                    );
                }
            } catch (uploadError) {
                context.log('Image upload failed, storing base64:', uploadError.message);
                // Continue with base64 images if blob upload fails
            }

            const saved = await saveAdventure(category, processedAdventure);
            
            return {
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify(saved)
            };
        } catch (error) {
            context.log('Error saving adventure:', error.message);

            // Return success if DB not configured (frontend will use localStorage)
            if (error.message.includes('not configured')) {
                return {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    body: JSON.stringify({ fallback: true })
                };
            }

            return {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Failed to save adventure' })
            };
        }
    }
});

// OPTIONS handler for CORS preflight
app.http('adventuresCors', {
    methods: ['OPTIONS'],
    authLevel: 'anonymous',
    route: 'adventures',
    handler: async (request, context) => {
        return {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        };
    }
});
