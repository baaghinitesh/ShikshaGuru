import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params;
    
    // Forward the request to the backend
    const backendResponse = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/upload/${encodeURIComponent(publicId)}`, {
      method: 'DELETE',
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
    console.error('Frontend file delete proxy error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to process delete request' 
      },
      { status: 500 }
    );
  }
}