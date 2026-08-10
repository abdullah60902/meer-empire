'use client';
import ProductCard from './ProductCard';

export default function ProductCardWrapper({ product }: { product: any }) {
  return <ProductCard product={product} />;
}
