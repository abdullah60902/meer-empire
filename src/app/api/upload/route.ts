import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'ztm6kmfz',
  api_key: process.env.CLOUDINARY_API_KEY || '366533789671688',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'TZArm6gSVq8SYvuO4NjJdyIZH8s',
  secure: true,
});

export async function POST(req: NextRequest) {
  try {
    const { image, folder = 'meer_empire' } = await req.json();

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image provided' }, { status: 400 });
    }

    const uploadResponse = await cloudinary.uploader.upload(image, {
      folder: folder,
      resource_type: 'auto',
    });

    return NextResponse.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
    });
  } catch (error: any) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
