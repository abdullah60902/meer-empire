import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Product from '@/models/Product';
import { products as staticProducts } from '@/data/products';

export async function GET() {
  try {
    await connectDB();
    const dbProducts = await Product.find().sort({ createdAt: -1 }).lean();
    
    // Format db products to match frontend expects (id as number/string)
    const formattedDbProducts = dbProducts.map((p: any) => ({
      ...p,
      id: p.id || p._id.toString(),
    }));

    // Merge DB products with static products (DB products first)
    const mergedProducts = [...formattedDbProducts, ...staticProducts];

    return NextResponse.json({
      success: true,
      products: mergedProducts,
      dbCount: dbProducts.length,
    });
  } catch (error: any) {
    console.error('Error fetching products from DB:', error);
    // Fallback to static products if DB fails
    return NextResponse.json({
      success: true,
      products: staticProducts,
      dbCount: 0,
      fallback: true,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const {
      name,
      brand = 'Meer Empire',
      category = 'sports',
      price,
      oldPrice,
      stock = 10,
      badge = 'Premium Quality',
      description,
      features = [],
      colors = [],
      sizes = [],
      images = [],
      isNew = true,
      isBestSeller = false,
      isFlashSale = false,
    } = body;

    if (!name || !price || !description || !images || images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Product name, price, description, and at least one image are required.' },
        { status: 400 }
      );
    }

    const numPrice = Number(price);
    const numOldPrice = oldPrice ? Number(oldPrice) : undefined;
    const discount = numOldPrice && numOldPrice > numPrice 
      ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100)
      : 0;

    const customId = `prod_${Date.now()}`;

    const newProduct = await Product.create({
      id: customId,
      name,
      brand,
      category,
      price: numPrice,
      oldPrice: numOldPrice,
      discount,
      stock: Number(stock),
      badge,
      description,
      features: Array.isArray(features) ? features : [features],
      colors: Array.isArray(colors) ? colors : [colors],
      sizes: Array.isArray(sizes) ? sizes : [sizes],
      images: Array.isArray(images) ? images : [images],
      rating: 5.0,
      reviews: 1,
      isNew: Boolean(isNew),
      isBestSeller: Boolean(isBestSeller),
      isFlashSale: Boolean(isFlashSale),
    });

    return NextResponse.json({
      success: true,
      product: newProduct,
      message: 'Product uploaded successfully!',
    });
  } catch (error: any) {
    console.error('Error uploading product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload product' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
    }

    await Product.deleteOne({ id });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { id, name, brand, category, price, oldPrice, badge, description, features, sizes, images } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Product ID is required for update' }, { status: 400 });
    }

    const numPrice = Number(price);
    const numOldPrice = oldPrice ? Number(oldPrice) : undefined;
    const discount = numOldPrice && numOldPrice > numPrice 
      ? Math.round(((numOldPrice - numPrice) / numOldPrice) * 100)
      : 0;

    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      {
        $set: {
          name,
          brand,
          category,
          price: numPrice,
          oldPrice: numOldPrice,
          discount,
          badge,
          description,
          features: Array.isArray(features) ? features : [],
          sizes: Array.isArray(sizes) ? sizes : [],
          images: Array.isArray(images) ? images : [],
        }
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: 'Product updated successfully!',
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update product' },
      { status: 500 }
    );
  }
}
