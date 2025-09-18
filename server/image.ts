"use server"

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';
import fs from 'node:fs';

// Create Google AI client with API key from environment
const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

export async function generateImage(prompt: string) {
    try {
        console.log('🚀 Starting image generation for prompt:', prompt);
        
        // Check if API key exists
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set');
        }

        console.log('✅ API key found, calling generateText...');

        // Add timeout wrapper
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Request timeout after 60 seconds')), 60000);
        });

        const generatePromise = generateText({
            model: google('gemini-2.5-flash-image-preview'),
            prompt: `Generate an image of: ${prompt}`,
            providerOptions: {
                google: {
                    responseModalities: ['IMAGE'],
                },
            },
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
    }
}
