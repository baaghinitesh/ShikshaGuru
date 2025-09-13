import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/upload/avatar`, {
      method: 'POST',
      body: formData,
      headers: {
        // Forward authentication headers
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
    });

    const result = await backendResponse.json();
    
    return NextResponse.json(result, { 
      status: backendResponse.status 
    });
  } catch (error) {
    console.error('Frontend avatar upload proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process avatar upload request' 
      },
      { status: 500 }
    );
  }
}