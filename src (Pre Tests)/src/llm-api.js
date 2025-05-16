const dotenv = require('dotenv');
dotenv.config();
const fetch = require('node-fetch');

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_SITE_URL = process.env.OPENROUTER_SITE_URL || 'https://asadpersonalspace.site/'; // Your site URL for referral

async function getLLMResponse(question, caption, modelName) {
    if (!OPENROUTER_API_KEY) {
        throw new Error('OpenRouter API key not configured. Please set OPENROUTER_API_KEY environment variable.');
    }
    if (!modelName) {
        throw new Error('Model name is required for OpenRouter API call.');
    }

    try {
        const payload = {
            model: modelName,
            messages: [
                { 
                    role: "system", 
                    content: "You are a helpful assistant answering questions about a YouTube video based on its captions."
                },
                {
                    role: "user",
                    content: `Video Captions:\n\n${caption}\n\n---\n\nQuestion: ${question}`
                }
            ]
            // Add other OpenRouter parameters like temperature, max_tokens if needed
            // temperature: 0.7,
            // max_tokens: 1024,
        };

        const url = `https://openrouter.ai/api/v1/chat/completions`;
        console.log(`Making request to OpenRouter API for model: ${modelName}`);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': OPENROUTER_SITE_URL, // Required for free models on localhost
                'X-Title': 'AI YouTube Assistant' // Optional: Identifies your app
            },
            body: JSON.stringify(payload)
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse OpenRouter response as JSON:', responseText);
            throw new Error('Failed to parse API response as JSON');
        }

        if (!response.ok) {
            console.error('OpenRouter API Error Response:', result);
            const errorMessage = result.error?.message || `API returned status ${response.status}`;
            throw new Error(`OpenRouter API Error: ${errorMessage}`);
        }
        
        if (result.choices && result.choices[0] && result.choices[0].message && result.choices[0].message.content) {
            return result.choices[0].message.content;
        }
        
        console.error('Unexpected OpenRouter API response structure:', JSON.stringify(result, null, 2));
        return 'No answer returned from OpenRouter API';

    } catch (error) {
        console.error('Error getting response from OpenRouter:', error);
        throw new Error(`Failed to process with OpenRouter API: ${error.message}`);
    }
}

/**
 * Fetches the list of available models from OpenRouter.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of model objects.
 */
async function getAvailableModels() {
    try {
        console.log('Fetching available models from OpenRouter...');
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            method: "GET",
            headers: {
                // Authorization might be needed depending on future OpenRouter policies
                // 'Authorization': `Bearer ${OPENROUTER_API_KEY}` 
            },
        });

        const responseText = await response.text();
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            console.error('Failed to parse OpenRouter /models response as JSON:', responseText);
            throw new Error('Failed to parse models list API response as JSON');
        }

        if (!response.ok) {
            console.error('OpenRouter /models API Error Response:', result);
            const errorMessage = result.error?.message || `API returned status ${response.status}`;
            throw new Error(`OpenRouter /models API Error: ${errorMessage}`);
        }

        if (result.data && Array.isArray(result.data)) {
            console.log(`Fetched ${result.data.length} models.`);
            return result.data; // The list of models is in the 'data' property
        } else {
            console.error('Unexpected structure in /models response:', result);
            throw new Error('Unexpected structure in OpenRouter /models API response');
        }

    } catch (error) {
        console.error('Error fetching models from OpenRouter:', error);
        // Don't throw here, allow the caller to handle the error (e.g., use a default list)
        return []; // Return empty array on error
    }
}

module.exports = {
    getLLMResponse,
    getAvailableModels // Export the new function
}; 