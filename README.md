# Adventures with Liam 🌟 Test

A family adventure tracking web app to record and celebrate explorations with your child Liam!

## Features

- **4 Adventure Categories:**
  - 🏕️ Washington State Parks (130+ parks)
  - 🗺️ US States (all 50 states)
  - 🏞️ US National Parks (all 63 parks)
  - 🌍 Countries (195 countries)

- **Track Your Visits:**
  - Mark locations as visited
  - Record the date of visit
  - Write memories and notes
  - Upload photos from your adventures
  - Set a thumbnail image for each adventure

- **Progress Tracking:**
  - See how many places you've visited in each category
  - Visual progress bar for each tab

- **Kid-Friendly Design:**
  - Colorful, nature-themed interface
  - Fun emojis and animations
  - Easy-to-use interface

## Tech Stack

- **Frontend:** React.js
- **Backend:** Azure Functions (Node.js)
- **Database:** Azure Cosmos DB
- **Image Storage:** Azure Blob Storage
- **Hosting:** Azure Static Web Apps

## Local Development

### Prerequisites

- Node.js 18+
- Azure Functions Core Tools v4
- Azure CLI (for deployment)

### Setup

1. **Install dependencies:**

```bash
# Frontend
npm install

# API
cd api
npm install
cd ..
```

2. **Configure Azure services (optional for local dev):**

Edit `api/local.settings.json` with your Azure credentials:
- `COSMOS_CONNECTION_STRING` - Your Cosmos DB connection string
- `BLOB_CONNECTION_STRING` - Your Blob Storage connection string

Note: The app works without Azure configuration using localStorage as a fallback.

3. **Run locally:**

```bash
# Start the React app
npm start

# In a separate terminal, start the API
cd api
npm start
```

The app will be available at http://localhost:3000

## Deployment to Azure

### Option 1: Azure Static Web Apps (Recommended) --TRYING THISgit remotes

1. Create an Azure Static Web App in the Azure Portal
2. Connect it to your GitHub repository
3. Configure the build settings:
   - App location: `/`
   - API location: `/api`
   - Output location: `/build`

4. Add application settings in Azure Portal:
   - `COSMOS_CONNECTION_STRING` - Your Cosmos DB connection string
   - `COSMOS_DATABASE_NAME` - AdventuresWithLiam
   - `COSMOS_CONTAINER_NAME` - adventures
   - `BLOB_CONNECTION_STRING` - Your Blob Storage connection string
   - `BLOB_CONTAINER_NAME` - adventure-images

### Option 2: Manual Deployment

1. **Create Azure Resources:**

```bash
# Create resource group
az group create --name adventures-with-liam --location westus2

# Create Cosmos DB account
az cosmosdb create --name adventures-cosmos --resource-group adventures-with-liam

# Create Storage account
az storage account create --name adventuresblob --resource-group adventures-with-liam --sku Standard_LRS

# Create Static Web App
az staticwebapp create --name adventures-with-liam --resource-group adventures-with-liam
```

2. **Build and deploy:**

```bash
# Build the React app
npm run build

# Deploy (follow prompts)
az staticwebapp deploy --name adventures-with-liam
```

## Azure Resources Required

1. **Azure Cosmos DB** - For storing adventure data
   - Create a database named `AdventuresWithLiam`
   - Create a container named `adventures` with partition key `/category`

2. **Azure Blob Storage** - For storing images
   - Create a container named `adventure-images`
   - Set public access level to "Blob"

3. **Azure Static Web Apps** - For hosting
   - Includes integrated Azure Functions for the API

## Project Structure

```
AdventuresWithLiam/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── AdventureList.js
│   │   ├── AdventureDetail.js
│   │   └── RecordVisitModal.js
│   ├── data/
│   │   ├── waStateParks.js
│   │   ├── usStates.js
│   │   ├── nationalParks.js
│   │   └── countries.js
│   ├── App.js
│   ├── index.js
│   └── index.css
├── api/
│   ├── src/
│   │   ├── functions/
│   │   │   ├── adventures.js
│   │   │   └── images.js
│   │   └── services/
│   │       ├── cosmosService.js
│   │       └── blobService.js
│   ├── host.json
│   ├── local.settings.json
│   └── package.json
├── staticwebapp.config.json
├── package.json
└── README.md
```

## License

MIT - Built with ❤️ for family adventures!

Test