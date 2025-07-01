import { NextResponse } from 'next/server';
import { adminAPI } from '@/lib/api';

export async function GET() {
  try {
    const response = await adminAPI.getDepartments();
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Failed to fetch departments:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
} 