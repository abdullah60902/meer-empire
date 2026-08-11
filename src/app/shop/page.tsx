'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard/ProductCard';
import { products, categories, sizes, colors } from '@/data/products';
import styles from './Shop.module.css';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialSearch = searchParams.get('search') || '';

  const [filteredProducts, setFilteredProducts] = useState(products);
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [activeBrands, setActiveBrands] = useState<string[]>([]);
  const [activeSizes, setActiveSizes] = useState<string[]>([]);
  const [activeColors, setActiveColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 20000]);
  const [sort, setSort] = useState('featured');
  const [search, setSearch] = useState(initialSearch);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  useEffect(() => {
    let result = products;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
    }

    if (activeCategory !== 'all') {
      result = result.filter(p => p.category === activeCategory);
    }

    if (activeBrands.length > 0) {
      result = result.filter(p => activeBrands.includes(p.brand));
    }

    if (activeSizes.length > 0) {
      result = result.filter(p => p.sizes?.some(s => activeSizes.includes(s)));
    }

    if (activeColors.length > 0) {
      result = result.filter(p => p.colors?.some(c => activeColors.includes(c)));
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sort) {
      case 'price-low': result.sort((a, b) => a.price - b.price); break;
      case 'price-high': result.sort((a, b) => b.price - a.price); break;
      case 'newest': result.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1)); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
      default: break; // featured
    }

    setFilteredProducts([...result]);
  }, [activeCategory, activeBrands, activeSizes, activeColors, priceRange, sort, search]);

  const toggleFilter = (list: string[], setList: (v: string[]) => void, val: string) => {
    if (list.includes(val)) setList(list.filter(v => v !== val));
    else setList([...list, val]);
  };

  const clearFilters = () => {
    setActiveCategory('all');
    setActiveBrands([]);
    setActiveSizes([]);
    setActiveColors([]);
    setPriceRange([0, 20000]);
    setSearch('');
  };

  return (
    <div className={styles.shopContainer}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isMobileFilterOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <h3>Filters</h3>
          <button onClick={clearFilters} className={styles.clearBtn}>Clear All</button>
          <button className={styles.closeBtnMobile} onClick={() => setIsMobileFilterOpen(false)}>✕</button>
        </div>

        <div className={styles.filterSection}>
          <h4>Categories</h4>
          <ul className={styles.filterList}>
            <li className={activeCategory === 'all' ? styles.activeLi : ''} onClick={() => setActiveCategory('all')}>All Categories</li>
            {categories.map(c => (
              <li key={c.id} className={activeCategory === c.id ? styles.activeLi : ''} onClick={() => setActiveCategory(c.id)}>
                {c.name}
              </li>
            ))}
          </ul>
        </div>

      </aside>

      {/* Main Content */}
      <div className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.mobileFilterBtn} onClick={() => setIsMobileFilterOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filters
            </button>
            <span className={styles.resultsCount}>Showing {filteredProducts.length} Results</span>
            {search && <span className={styles.searchBadge}>Search: "{search}" <button onClick={() => setSearch('')}>✕</button></span>}
          </div>
          <div className={styles.sort}>
            <label>Sort By:</label>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className={styles.select}>
              <option value="featured">Featured</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredProducts.length > 0 ? (
          <div className={styles.grid}>
            {filteredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className={styles.noResults}>
            <div className={styles.noResultsIcon}>🔍</div>
            <h3>No products found</h3>
            <p>Try adjusting your filters or search query.</p>
            <button className="btn-premium" onClick={clearFilters} style={{ background: 'var(--primary)', color: '#fff', marginTop: '1rem' }}>Clear All Filters</button>
          </div>
        )}
      </div>

      {isMobileFilterOpen && <div className={styles.overlay} onClick={() => setIsMobileFilterOpen(false)} />}
    </div>
  );
}

export default function ShopPage() {
  return (
    <div style={{ background: 'var(--bg-body)', minHeight: '100vh' }}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <div className="container">
          <span className="eyebrow">Explore Our Collection</span>
          <h1 className="section-title" style={{ margin: 0, color: '#fff' }}>The <span className="silver">Shop</span></h1>
        </div>
      </div>
      <div className="container" style={{ padding: '3rem 1.5rem' }}>
        <Suspense fallback={<div className="skeleton" style={{ height: '500px', width: '100%' }} />}>
          <ShopContent />
        </Suspense>
      </div>
    </div>
  );
}
