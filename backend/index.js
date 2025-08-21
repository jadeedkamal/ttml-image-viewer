require('dotenv').config({ path: '../.env' });
const express = require('express');
const { BlobServiceClient, StorageSharedKeyCredential, generateBlobSASQueryParameters, BlobSASPermissions } = require('@azure/storage-blob');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Load environment variables
const AZURE_ACCOUNT_URL = process.env.VITE_AZURE_ACCOUNT_URL;
let AZURE_SAS = process.env.VITE_AZURE_SAS;

if (!AZURE_ACCOUNT_URL || !AZURE_SAS) {
  console.error('Error: Azure Storage account URL or SAS token not provided. Please set VITE_AZURE_ACCOUNT_URL and VITE_AZURE_SAS in your .env file.');
  process.exit(1);
}

// Ensure SAS token starts with '?'
if (!AZURE_SAS.startsWith('?')) {
  AZURE_SAS = `?${AZURE_SAS}`;
}

const blobServiceClient = new BlobServiceClient(
  `${AZURE_ACCOUNT_URL}${AZURE_SAS}`
);

app.use(cors());
app.use(express.json());

// Helper function to generate SAS URL for a blob
function getBlobSasUrl(containerClient, blobName) {
  return `${containerClient.url}/${blobName}${AZURE_SAS}`;
}

// Endpoint to list images
app.get('/api/gallery/images', async (req, res) => {
  try {
    const containerName = 'azureml'; 
    const prefix = 'tire_data/';
    const containerClient = blobServiceClient.getContainerClient(containerName);

    const continuationToken = req.query.continuationToken || null;
    const maxResultsPerPage = 20; // You can make this configurable if needed

    const images = [];
    let nextContinuationToken = null;

    const listBlobsOptions = {
      prefix: prefix,
      maxPageSize: maxResultsPerPage
    };

    // If a continuation token is provided, use it
    if (continuationToken) {
      listBlobsOptions.continuationToken = continuationToken;
    }

    const iterator = containerClient.listBlobsFlat(listBlobsOptions).byPage();
    
    // Get the first page of results
    const response = await iterator.next();

    if (!response.done && response.value) {
      for (const blob of response.value.segment.blobItems) {
        const imageName = blob.name.startsWith(prefix) ? blob.name.substring(prefix.length) : blob.name;
        if (blob.name.match(/\.(jpeg|jpg|png|gif)$/)) {
          images.push({
            name: imageName,
            url: getBlobSasUrl(containerClient, blob.name),
            // Add other properties if needed
          });
        }
      }
      nextContinuationToken = response.value.continuationToken;
    }

    res.json({ 
      images: images,
      continuationToken: nextContinuationToken,
      hasMore: !!nextContinuationToken // True if nextContinuationToken is not null/undefined
    });
  } catch (error) {
    console.error('Error listing images:', error.message);
    res.status(500).json({ error: 'Failed to list images' });
  }
});

// Endpoint to get a single SAS URL for a blob (if needed)
app.post('/api/gallery/sas-url', async (req, res) => {
  try {
    const { containerName, blobName } = req.body;
    if (!containerName || !blobName) {
      return res.status(400).json({ error: 'containerName and blobName are required.' });
    }
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const sasUrl = getBlobSasUrl(containerClient, blobName);
    res.json({ url: sasUrl });
  } catch (error) {
    console.error('Error generating SAS URL:', error.message);
    res.status(500).json({ error: 'Failed to generate SAS URL' });
  }
});

// Endpoint to refresh SAS URLs (if needed)
app.post('/api/gallery/refresh-urls', async (req, res) => {
  try {
    const { images } = req.body;
    if (!Array.isArray(images)) {
      return res.status(400).json({ error: 'Images array is required.' });
    }

    const refreshedImages = images.map(img => {
      const containerClient = blobServiceClient.getContainerClient(img.container || 'images'); 
      return {
        ...img,
        url: getBlobSasUrl(containerClient, img.name)
      };
    });
    res.json(refreshedImages);
  } catch (error) {
    console.error('Error refreshing image URLs:', error.message);
    res.status(500).json({ error: 'Failed to refresh URLs' });
  }
});


app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});