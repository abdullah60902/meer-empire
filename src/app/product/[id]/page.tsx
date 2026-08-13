'use client';
import { useState, use, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fetchProductsFromDB, type ProductItem } from '@/lib/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import styles from './ProductDetail.module.css';
import ProductCardWrapper from '@/components/ProductCard/ProductCardWrapper';
import ImageZoom from '@/components/ImageZoom/ImageZoom';
import ProductReviews from '@/components/ProductReviews/ProductReviews';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productIdStr = String(resolvedParams.id);

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const { dispatch: cartDispatch } = useCart();
  const { isWishlisted, dispatch: wishlistDispatch } = useWishlist();

  useEffect(() => {
    window.scrollTo(0, 0);
    async function load() {
      setLoading(true);
      const list = await fetchProductsFromDB();
      setAllProducts(list);
      const found = list.find((p) => String(p.id) === productIdStr);
      if (found) {
        setProduct(found);
        setSelectedSize(found.sizes?.[0] || '');
        setSelectedColor(found.colors?.[0] || '');
      }
      setLoading(false);
    }
    load();
  }, [productIdStr]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        <h2>Loading Product Details...</h2>
      </div>
    );
  }

  if (!product) return notFound();

  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    cartDispatch({ type: 'ADD_ITEM', payload: { ...product, size: selectedSize, color: selectedColor, quantity } });
    cartDispatch({ type: 'OPEN_CART' });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    cartDispatch({ type: 'ADD_ITEM', payload: { ...product, size: selectedSize, color: selectedColor, quantity } });
    window.location.href = '/cart';
  };

  const relatedProducts = allProducts.filter(p => p.category === product.category && String(p.id) !== String(product.id)).slice(0, 4);

  return (
    <div className={styles.pageWrap}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <div className="container">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href="/shop">Shop</Link>
          <span>/</span>
          <Link href={`/shop?category=${product.category}`} style={{ textTransform: 'capitalize' }}>
            {product.category}
          </Link>
          <span>/</span>
          <span className={styles.current}>{product.name}</span>
        </div>
      </div>

      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <div className={styles.productGrid}>
          {/* Gallery */}
          <div className={styles.gallery}>
            <div style={{ position: 'relative' }}>
              <ImageZoom
                src={product.images[activeImage]}
                alt={product.name}
                zoomLevel={2.5}
              />
              <div className={styles.badges}>
                {product.isNew && <span className={styles.badgeNew}>New</span>}
                {(product.discount ?? 0) > 0 && <span className={styles.badgeSale}>-{product.discount}%</span>}
              </div>
            </div>
            <div className={styles.thumbnails}>
              {product.images.map((img, i) => (
                <button
                  key={i}
                  className={`${styles.thumbnail} ${i === activeImage ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                >
                  <Image src={img} alt={`Thumb ${i}`} fill className={styles.thumbImage} />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className={styles.details}>
            <div className={styles.brand}>{product.brand}</div>
            <h1 className={styles.title}>{product.name}</h1>
            
            <div className={styles.meta}>
              <div className={styles.rating}>
                <div className={styles.stars}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < Math.floor(product.rating) ? '#D4AF37' : '#ddd' }}>⭐</span>
                  ))}
                </div>
                <a href="#reviews-section" style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>
                  {product.rating} ({product.reviews} Reviews)
                </a>
              </div>
              <div className={styles.qualityBadge}>
                <span className={styles.qualityDot} />
                {product.badge}
              </div>
            </div>

            <div className={styles.priceWrap}>
              <span className={styles.price}>Rs. {product.price.toLocaleString()}</span>
              {product.oldPrice && (
                <span className={styles.oldPrice}>Rs. {product.oldPrice.toLocaleString()}</span>
              )}
            </div>

            <p className={styles.desc}>{product.description}</p>

            <div className={styles.divider} />



            {/* Actions */}
            <div className={styles.actions}>

              <button className={`${styles.addBtn} ${added ? styles.added : ''}`} onClick={handleAddToCart}>
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
              <button className={styles.wishBtn} onClick={() => wishlistDispatch({ type: 'TOGGLE', payload: product })}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill={wishlisted ? '#e74c3c' : 'none'} stroke={wishlisted ? '#e74c3c' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </button>
            </div>

            <button className={styles.buyBtn} onClick={handleBuyNow}>Buy It Now</button>
            <button className={styles.codBtn} onClick={handleAddToCart}>
              📦 Cash On Delivery Available (Rs. 250 Advance)
            </button>

            {/* Features List */}
            <div className={styles.features}>
              <h4>Product Features</h4>
              <ul>
                {product.features?.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
            
            <div className={styles.trustBadges}>
              <div className={styles.trustItem}><span>✓</span> 100% Original</div>
              <div className={styles.trustItem}><span>✓</span> Premium Quality</div>
              <div className={styles.trustItem}><span>✓</span> Secure Checkout</div>
            </div>
          </div>
        </div>

        {/* Product Reviews Section */}
        <ProductReviews
          productId={product.id}
          productName={product.name}
          initialRating={product.rating}
          initialReviewsCount={product.reviews}
        />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className={styles.related}>
            <div className="section-header aos">
              <h2 className="section-title">Related <span className="blue">Products</span></h2>
            </div>
            <div className={styles.relatedGrid}>
              {relatedProducts.map((p) => (
                <ProductCardWrapper key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
