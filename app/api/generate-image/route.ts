import { NextRequest, NextResponse } from 'next/server';
import { generateImageMock } from '@/server/image'; // Your backend function

export async function POST(request: NextRequest) {
    try {

        const imageUrl = await generateImageMock();

        return NextResponse.json({
            imageUrl,
            success: true
        });
    } catch (error: any) {
        console.error('API Error:', error);
        return NextResponse.json(
            {
                error: error.message || 'Failed to generate image',
                success: false
            },
            { status: 500 }
        );
    }
}
