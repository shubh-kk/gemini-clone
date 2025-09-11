import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { streamText, UIMessage, convertToModelMessages } from 'ai';

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY!,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const model = google('gemini-2.5-flash');

export async function POST(req: Request) {
    const { messages }: { messages: UIMessage[] } = await req.json();

    const result = streamText({
        model: model,
        messages: convertToModelMessages(messages),

    });

    return result.toUIMessageStreamResponse();
}
