"use server"

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'node:fs';

// Create Google AI client with API key from environment
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// Add request tracking to prevent multiple simultaneous requests
let isGenerating = false;
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests

export async function generateImage(prompt: string) {
    try {
        console.log('🚀 Starting image generation for prompt:', prompt);

        // Prevent multiple simultaneous requests
        if (isGenerating) {
            throw new Error('Another image generation is already in progress. Please wait.');
        }

        // Rate limiting - prevent rapid successive requests
        const now = Date.now();
        if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
            const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
            throw new Error(`Please wait ${waitTime} seconds before generating another image.`);
        }

        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        isGenerating = true;
        lastRequestTime = now;

        console.log('✅ API key found, calling generateText...');

        // Add timeout wrapper with shorter timeout to prevent long waits
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000);
        });

        const generatePromise = generateText({
            model: google('gemini-2.5-flash-image-preview'),
            prompt: `Generate an image of: ${prompt}`,
            providerOptions: {
                google: {
                    responseModalities: ['IMAGE'],
                },
            },
            maxRetries: 1, // Reduce from default 3 to 1 to save quota
        });

        const result = await Promise.race([generatePromise, timeoutPromise]) as any;
        console.log('📝 Generate text result:', {
            hasFiles: !!result.files,
            fileCount: result.files?.length || 0,
            text: result.text
        });

        let fileName = '';

        // Save generated images
        if (result.files && result.files.length > 0) {
            for (const file of result.files) {
                console.log('📁 Processing file:', { mediaType: file.mediaType, hasUint8Array: !!file.uint8Array });
                if (file.mediaType.startsWith('image/')) {
                    const timestamp = Date.now();
                    fileName = `generated-${timestamp}.png`;

                    await fs.promises.writeFile(`public/${fileName}`, file.uint8Array);
                    console.log('💾 Image saved:', fileName);
                }
            }
        } else {
            console.log('⚠️ No files returned from API');
            throw new Error('No image files were generated');
        }

        if (!fileName) {
            throw new Error('No image files were found in the response');
        }

        console.log('✅ Image generation completed:', fileName);
        return `/${fileName}`;
    } catch (error: any) {
        console.error('Image generation error:', error);

        // Handle quota exceeded error specifically
        if (error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            throw new Error('API quota exceeded. Please try again later or upgrade your plan.');
        }

        // Handle other errors
        throw new Error(`Image generation failed: ${error.message || 'Unknown error'}`);
    } finally {
        // Always reset the generating flag
        isGenerating = false;
    }
}

export async function generateImageMock() {
    try {

        const fileName = `generated-${Date.now()}.png`;
        const imageUrl = `https://picsum.photos/512/512?random=${Date.now()}`;

        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.statusText}`);
        }

        const imageBuffer = await response.arrayBuffer();

        await fs.promises.writeFile(`public/${fileName}`, Buffer.from(imageBuffer));

        return `/${fileName}`;
    } catch (error: any) {
        console.error('Mock image generation error:', error);
        throw new Error(`Mock image generation failed: ${error.message || 'Unknown error'}`);
    }
}