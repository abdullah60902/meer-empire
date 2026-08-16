export const categories = [
  { id: 'sports', name: 'Sports Shoes', icon: '🏃', count: 24, description: 'High-performance athletic footwear' },
  { id: 'casual', name: 'Casual Shoes', icon: '👟', count: 18, description: 'Everyday comfort and style' },
  { id: 'sneakers', name: 'Sneakers', icon: '✨', count: 32, description: 'Trendy street-style sneakers' },
  { id: 'accessories', name: 'Accessories', icon: '🧦', count: 20, description: 'Socks, laces, care products' },
];

export const brands = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Reebok', 'Vans', 'Converse', 'Under Armour', 'Skechers', 'Clarks'];

export const sizes = [
  'UK/PK 5 | US 6 | EUR 38',
  'UK/PK 5.5 | US 6.5 | EUR 38.5',
  'UK/PK 6 | US 7 | EUR 39',
  'UK/PK 6.5 | US 7.5 | EUR 40',
  'UK/PK 7 | US 8 | EUR 41',
  'UK/PK 7.5 | US 8.5 | EUR 41.5',
  'UK/PK 8 | US 9 | EUR 42',
  'UK/PK 8.5 | US 9.5 | EUR 42.5',
  'UK/PK 9 | US 10 | EUR 43',
  'UK/PK 9.5 | US 10.5 | EUR 43.5',
  'UK/PK 10 | US 11 | EUR 44',
  'UK/PK 10.5 | US 11.5 | EUR 44.5',
  'UK/PK 11 | US 12 | EUR 45',
  'UK/PK 11.5 | US 12.5 | EUR 45.5',
  'UK/PK 12 | US 13 | EUR 46',
];

export const colors = ['#FFFFFF', '#0B2345', '#000000', '#C0392B', '#27AE60', '#F39C12', '#8E44AD', '#D4AF37'];

const qualityBadges = ['Premium Quality', 'Excellent Quality', 'Very Good Quality'];

export const products: any[] = [];

export const reviews = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    location: 'Karachi',
    rating: 5,
    date: '2 days ago',
    text: 'Absolutely love my Nike Air Max! The quality is outstanding and exactly as shown on the website. Fast delivery and professional packaging. Highly recommend MEER EMPIRE!',
    product: 'Nike Air Max 270 React',
    avatar: 'AH',
  },
  {
    id: 2,
    name: 'Fatima Sheikh',
    location: 'Lahore',
    rating: 5,
    date: '1 week ago',
    text: 'Best shoe store in Pakistan! Ordered Adidas Ultraboost and received it in 2 days. The shoes are 100% original and the comfort is unmatched. Will definitely order again!',
    product: 'Adidas Ultraboost 22',
    avatar: 'FS',
  },
  {
    id: 3,
    name: 'Muhammad Ali',
    location: 'Islamabad',
    rating: 5,
    date: '2 weeks ago',
    text: 'Excellent service! The Puma RS-X3 I ordered are amazing quality. Cash on Delivery option is very convenient. The unboxing experience was premium and the packaging was perfect.',
    product: 'Puma RS-X3 Puzzle',
    avatar: 'MA',
  },
  {
    id: 4,
    name: 'Sara Malik',
    location: 'Rawalpindi',
    rating: 5,
    date: '3 weeks ago',
    text: 'MEER EMPIRE has the best imported shoes! Size exchange was easy when I needed a different size. The team was very helpful and responsive on WhatsApp.',
    product: 'Vans Old Skool Pro',
    avatar: 'SM',
  },
  {
    id: 5,
    name: 'Usman Tariq',
    location: 'Faisalabad',
    rating: 4,
    date: '1 month ago',
    text: 'Very happy with my Converse Chuck Taylor purchase. Great quality for the price. Delivery was fast and the shoe matches exactly what was shown in the product images.',
    product: 'Converse Chuck Taylor',
    avatar: 'UT',
  },
  {
    id: 6,
    name: 'Ayesha Raza',
    location: 'Multan',
    rating: 5,
    date: '1 month ago',
    text: 'Ordered New Balance 990v5 and I am blown away by the quality! Premium imported shoes at great prices. The website is very professional and the checkout process is smooth.',
    product: 'New Balance 990v5',
    avatar: 'AR',
  },
];

export const coupons = {
  'MEER10': { discount: 10, type: 'percent', description: '10% off your order' },
  'MEER200': { discount: 200, type: 'fixed', description: 'Rs.200 off your order' },
  'EMPIRE15': { discount: 15, type: 'percent', description: '15% off your order' },
  'WELCOME': { discount: 5, type: 'percent', description: '5% welcome discount' },
};

export const stats = [
  { value: 5000, suffix: '+', label: 'Happy Customers' },
  { value: 200, suffix: '+', label: 'Premium Products' },
  { value: 10, suffix: '+', label: 'Top Brands' },
  { value: 99, suffix: '%', label: 'Satisfaction Rate' },
];
