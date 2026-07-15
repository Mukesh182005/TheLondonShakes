'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useCMSStore } from '@/store/restaurantStore';
import { 
  menuItems as initialMenuItems,
  menuCategories as initialMenuCategories 
} from '@/data/restaurantData';
import { Search, Filter, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

const DIETARY_OPTIONS = [
  { key: 'v',  label: 'Vegetarian' },
  { key: 'vg', label: 'Vegan'      },
  { key: 'gf', label: 'Gluten Free'},
  { key: 'df', label: 'Dairy Free' },
];

interface FloatingImageConfig {
  src: string;
  category: string;
  offsetTop: string;
}

const DEFAULT_CATEGORY_IMAGES: Record<string, { left: FloatingImageConfig[]; right: FloatingImageConfig[]; glow: string }> = {
  all: {
    left: [
      { src: '/menu-burger.png', category: 'burgers', offsetTop: '20%' },
      { src: '/menu-pasta.png', category: 'pastas', offsetTop: '55%' }
    ],
    right: [
      { src: '/event-shake.png', category: 'shakes', offsetTop: '25%' },
      { src: '/menu-fries.png', category: 'snacks', offsetTop: '60%' }
    ],
    glow: 'rgba(225, 29, 46, 0.35)'
  },
  shakes: {
    left: [
      { src: '/event-shake.png', category: 'shakes', offsetTop: '20%' },
      { src: '/event-shake.png', category: 'shakes', offsetTop: '55%' }
    ],
    right: [
      { src: '/event-shake.png', category: 'shakes', offsetTop: '25%' },
      { src: '/event-shake.png', category: 'shakes', offsetTop: '60%' }
    ],
    glow: 'rgba(236, 72, 153, 0.35)'
  },
  burgers: {
    left: [
      { src: '/menu-burger.png', category: 'burgers', offsetTop: '20%' },
      { src: '/menu-sandwich.png', category: 'burgers', offsetTop: '55%' }
    ],
    right: [
      { src: '/menu-burger.png', category: 'burgers', offsetTop: '25%' },
      { src: '/menu-sandwich.png', category: 'burgers', offsetTop: '60%' }
    ],
    glow: 'rgba(245, 158, 11, 0.35)'
  },
  pastas: {
    left: [
      { src: '/menu-pasta.png', category: 'pastas', offsetTop: '20%' },
      { src: '/menu-noodle.png', category: 'pastas', offsetTop: '55%' }
    ],
    right: [
      { src: '/menu-pasta.png', category: 'pastas', offsetTop: '25%' },
      { src: '/menu-noodle.png', category: 'pastas', offsetTop: '60%' }
    ],
    glow: 'rgba(16, 185, 129, 0.35)'
  },
  snacks: {
    left: [
      { src: '/menu-fries.png', category: 'snacks', offsetTop: '20%' },
      { src: '/menu-nuggets.png', category: 'snacks', offsetTop: '55%' }
    ],
    right: [
      { src: '/menu-fries.png', category: 'snacks', offsetTop: '25%' },
      { src: '/menu-nuggets.png', category: 'snacks', offsetTop: '60%' }
    ],
    glow: 'rgba(239, 68, 68, 0.35)'
  },
  waffles: {
    left: [
      { src: '/event-waffle.png', category: 'waffles', offsetTop: '20%' },
      { src: '/event-waffle.png', category: 'waffles', offsetTop: '55%' }
    ],
    right: [
      { src: '/event-waffle.png', category: 'waffles', offsetTop: '25%' },
      { src: '/event-waffle.png', category: 'waffles', offsetTop: '60%' }
    ],
    glow: 'rgba(139, 92, 246, 0.35)'
  },
  drinks: {
    left: [
      { src: '/menu-coffee.png', category: 'drinks', offsetTop: '20%' },
      { src: '/menu-coffee.png', category: 'drinks', offsetTop: '55%' }
    ],
    right: [
      { src: '/menu-coffee.png', category: 'drinks', offsetTop: '25%' },
      { src: '/menu-coffee.png', category: 'drinks', offsetTop: '60%' }
    ],
    glow: 'rgba(6, 182, 212, 0.35)'
  }
};

const CATEGORY_BANNER_IMAGES: Record<string, string> = {
  shakes: '/event-shake.png',
  burgers: '/menu-burger.png',
  pastas: '/menu-pasta.png',
  snacks: '/menu-fries.png',
  waffles: '/event-waffle.png',
  drinks: '/menu-coffee.png',
  'new-arrivals': '/london-gallery-bg.jpg'
};

const getBadgeStyle = (badge?: string | null) => {
  if (!badge) return {};
  const b = badge.toLowerCase();
  if (b.includes('best') || b.includes('must')) {
    return { background: '#FFF0F2', color: '#E11D2E', border: '1px solid rgba(225, 29, 46, 0.1)' };
  }
  if (b.includes('popular') || b.includes('trending') || b.includes('hot')) {
    return { background: '#E6F4FE', color: '#0E223D', border: '1px solid rgba(14, 34, 61, 0.1)' };
  }
  if (b.includes('season') || b.includes('spicy')) {
    return { background: '#FFF3E0', color: '#FF9800', border: '1px solid rgba(255, 152, 0, 0.1)' };
  }
  if (b.includes('classic') || b.includes('comfort') || b.includes('favorite') || b.includes('favourite')) {
    return { background: '#E8F5E9', color: '#1F543C', border: '1px solid rgba(31, 84, 60, 0.1)' };
  }
  return { background: '#FFF8E1', color: '#78602E', border: '1px solid rgba(120, 96, 46, 0.1)' };
};

/* ── Mobile 3-Column Grid (Swiggy / Zomato style) ── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function MobileGrid({ items, renderCard }: { items: any[]; renderCard: (item: any) => React.ReactNode }) {
  if (items.length === 0) return null;

  return (
    <div
      className="mobile-dish-scroll"
      style={{
        display: 'flex',
        flexDirection: 'row',
        gap: '12px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        padding: '4px 4px 12px 4px',
        width: 'calc(100% + 8px)',
        margin: '0 -4px',
        msOverflowStyle: 'none',
        scrollbarWidth: 'none',
      }}
    >
      <style>{`
        .mobile-dish-scroll::-webkit-scrollbar {
          display: none;
        }
        .mobile-dish-card-wrapper {
          flex: 0 0 130px;
          width: 130px;
        }
      `}</style>
      {items.map((item) => (
        <div key={item.id} className="mobile-dish-card-wrapper">
          {renderCard(item)}
        </div>
      ))}
    </div>
  );
}

export default function MenuPage() {
  const storeMenuItems      = useCMSStore((s) => s.menuItems);
  const storeMenuCategories = useCMSStore((s) => s.menuCategories);

  const [isMounted, setIsMounted] = useState(false);
  const isMobile = useIsMobile();
  useEffect(() => {
    setIsMounted(true);
  }, []);



  const menuItems      = isMounted ? storeMenuItems : initialMenuItems;
  const menuCategories = isMounted ? storeMenuCategories : initialMenuCategories;

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery,    setSearchQuery]    = useState('');
  const [dietary,        setDietary]        = useState<string[]>([]);
  const [maxPrice,       setMaxPrice]       = useState(500);
  const [sortBy,         setSortBy]         = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');
  const [filterOpen,     setFilterOpen]     = useState(false);
  const [selectedSizes,  setSelectedSizes]  = useState<Record<string, 'small' | 'medium' | 'large'>>({});
  const [activeDetailItem, setActiveDetailItem] = useState<typeof menuItems[0] | null>(null);

  const handleNextDish = () => {
    if (!activeDetailItem || filtered.length <= 1) return;
    const idx = filtered.findIndex(item => item.id === activeDetailItem.id);
    if (idx !== -1) {
      const nextIdx = (idx + 1) % filtered.length;
      setActiveDetailItem(filtered[nextIdx]);
    }
  };

  const handlePrevDish = () => {
    if (!activeDetailItem || filtered.length <= 1) return;
    const idx = filtered.findIndex(item => item.id === activeDetailItem.id);
    if (idx !== -1) {
      const prevIdx = (idx - 1 + filtered.length) % filtered.length;
      setActiveDetailItem(filtered[prevIdx]);
    }
  };

  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    if (isLeftSwipe) {
      handleNextDish();
    } else if (isRightSwipe) {
      handlePrevDish();
    }
  };

  useEffect(() => {
    if (isMounted) {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'new') {
        setActiveCategory('new-arrivals');
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (activeDetailItem) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeDetailItem]);

  const list1 = useMemo(() => menuItems.map(i => i.name), [menuItems]);
  const list2 = useMemo(() => [...list1].reverse(), [list1]);

  const scrollItems1 = useMemo(() => {
    if (list1.length === 0) return [];
    let result = [...list1];
    while (result.length < 30) {
      result = [...result, ...list1];
    }
    return result;
  }, [list1]);

  const scrollItems2 = useMemo(() => {
    if (list2.length === 0) return [];
    let result = [...list2];
    while (result.length < 30) {
      result = [...result, ...list2];
    }
    return result;
  }, [list2]);

  const [displayedCategory, setDisplayedCategory] = useState(activeCategory);
  const [transitionOpacity, setTransitionOpacity] = useState(1);

  useEffect(() => {
    setTransitionOpacity(0);
    const t = setTimeout(() => {
      setDisplayedCategory(activeCategory);
      setTransitionOpacity(1);
    }, 280);
    return () => clearTimeout(t);
  }, [activeCategory]);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGutterClick = (category: string) => {
    setActiveCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const categoryImagesConfig = useMemo(() => {
    const merged = JSON.parse(JSON.stringify(DEFAULT_CATEGORY_IMAGES)) as typeof DEFAULT_CATEGORY_IMAGES;
    
    menuCategories.forEach((cat) => {
      const id = cat.id;
      if (merged[id]) {
        if (cat.gutterImageLeftTop)    merged[id].left[0].src = cat.gutterImageLeftTop;
        if (cat.gutterImageLeftBottom) merged[id].left[1].src = cat.gutterImageLeftBottom;
        if (cat.gutterImageRightTop)   merged[id].right[0].src = cat.gutterImageRightTop;
        if (cat.gutterImageRightBottom) merged[id].right[1].src = cat.gutterImageRightBottom;
      } else {
        merged[id] = {
          left: [
            { src: cat.gutterImageLeftTop || '/menu-burger.png', category: id, offsetTop: '20%' },
            { src: cat.gutterImageLeftBottom || '/menu-pasta.png', category: id, offsetTop: '55%' }
          ],
          right: [
            { src: cat.gutterImageRightTop || '/event-shake.png', category: id, offsetTop: '25%' },
            { src: cat.gutterImageRightBottom || '/menu-fries.png', category: id, offsetTop: '60%' }
          ],
          glow: 'rgba(225, 29, 46, 0.35)'
        };
      }
    });

    const burgerCat = menuCategories.find(c => c.id === 'burgers');
    const pastaCat = menuCategories.find(c => c.id === 'pastas');
    const shakeCat = menuCategories.find(c => c.id === 'shakes');
    const snackCat = menuCategories.find(c => c.id === 'snacks');

    if (burgerCat?.gutterImageLeftTop) merged.all.left[0].src = burgerCat.gutterImageLeftTop;
    if (pastaCat?.gutterImageLeftTop)  merged.all.left[1].src = pastaCat.gutterImageLeftTop;
    if (shakeCat?.gutterImageLeftTop)  merged.all.right[0].src = shakeCat.gutterImageLeftTop;
    if (snackCat?.gutterImageLeftTop)  merged.all.right[1].src = snackCat.gutterImageLeftTop;

    return merged;
  }, [menuCategories]);

  const currentConfig = categoryImagesConfig[displayedCategory] || categoryImagesConfig.all;

  const newArrivalsDaysThreshold = useCMSStore((s) => s.newArrivalsDaysThreshold) || 10;

  const hasNewArrivals = useMemo(() => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - newArrivalsDaysThreshold);
    return menuItems.some(
      (item) => item.active && item.createdAt && new Date(item.createdAt) >= cutoffDate
    );
  }, [menuItems, newArrivalsDaysThreshold]);

  const filtered = useMemo(() => {
    let items = [...menuItems];

    if (activeCategory === 'new-arrivals') {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - newArrivalsDaysThreshold);
      items = items.filter(
        (i) => i.active !== false && i.createdAt && new Date(i.createdAt) >= cutoffDate
      );
    } else if (activeCategory !== 'all') {
      items = items.filter((i) => i.category === activeCategory && i.active !== false);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      items = items.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.category.toLowerCase().includes(q)
      );
    }
    if (dietary.length > 0) {
      items = items.filter((i) => dietary.every((d) => i.dietary.includes(d)));
    }
    items = items.filter((i) => i.price <= maxPrice);

    if (sortBy === 'price-asc')  items.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') items.sort((a, b) => b.price - a.price);
    if (sortBy === 'name')       items.sort((a, b) => a.name.localeCompare(b.name));

    return items;
  }, [menuItems, activeCategory, searchQuery, dietary, maxPrice, sortBy, newArrivalsDaysThreshold]);

  const itemsByCategory = useMemo(() => {
    const grouped: Record<string, typeof menuItems> = {};
    menuCategories.forEach((cat) => {
      grouped[cat.id] = [];
    });
    filtered.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });
    return grouped;
  }, [filtered, menuCategories]);

  if (!isMounted) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}>Loading Menu…</p>
      </div>
    );
  }



  const getGutterOffsets = (count: number) => {
    let numImages = Math.min(count, 7);
    if (activeCategory === 'shakes' || activeCategory === 'snacks') {
      numImages = Math.max(1, Math.round(numImages / 2));
    }
    const leftOffsets: Record<number, string[]> = {
      0: [],
      1: ['40%'],
      2: ['20%', '65%'],
      3: ['15%', '45%', '75%'],
      4: ['15%', '35%', '60%', '80%'],
      5: ['12%', '30%', '48%', '66%', '84%'],
      6: ['10%', '25%', '40%', '55%', '70%', '85%'],
      7: ['8%', '20%', '32%', '44%', '56%', '68%', '80%']
    };
    const rightOffsets: Record<number, string[]> = {
      0: [],
      1: ['45%'],
      2: ['30%', '75%'],
      3: ['25%', '55%', '85%'],
      4: ['25%', '45%', '70%', '90%'],
      5: ['20%', '38%', '56%', '74%', '90%'],
      6: ['18%', '33%', '48%', '63%', '78%', '90%'],
      7: ['14%', '26%', '38%', '50%', '62%', '74%', '86%']
    };

    return {
      left: leftOffsets[numImages] || [],
      right: rightOffsets[numImages] || []
    };
  };

  const getPortionsConfig = (item: typeof menuItems[0]) => {
    const defaultPortions = {
      small: { available: true, price: Math.round(item.price * 0.8) },
      medium: { available: true, price: item.price },
      large: { available: true, price: Math.round(item.price * 1.3) },
    };
    return item.portions || defaultPortions;
  };

  const toggleDietary = (key: string) =>
    setDietary((prev) => prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]);

  const renderCategoryBanner = (catId: string, label: string, desc: string, itemCount: number) => {
    const categoryObj = menuCategories.find((c) => c.id === catId);
    const bgImage = categoryObj?.bannerImage || CATEGORY_BANNER_IMAGES[catId] || CATEGORY_BANNER_IMAGES['new-arrivals'];
    
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '160px',
          borderRadius: '16px',
          overflow: 'hidden',
          marginBottom: '24px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.45) 60%, rgba(0, 0, 0, 0.2) 100%)',
          }}
        />
        <div
          style={{
            position: 'relative',
            height: '100%',
            padding: '24px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '8px',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '999px',
              backgroundColor: '#FFFFFF',
              color: '#1C1915',
              fontSize: '0.62rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#E11D2E',
              }}
            />
            {itemCount} Item{itemCount !== 1 ? 's' : ''}
          </div>
          
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.85rem',
              fontWeight: 400,
              color: '#FFFFFF',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            {label}
          </h2>
          
          <p
            style={{
              fontSize: '0.8rem',
              color: 'rgba(255, 255, 255, 0.8)',
              margin: 0,
              maxWidth: '500px',
              lineHeight: 1.4,
            }}
          >
            {desc}
          </p>
        </div>
      </div>
    );
  };

  const renderMenuItemCard = (item: typeof menuItems[0]) => {
    const portions = getPortionsConfig(item);
    const availableSizes = (['small', 'medium', 'large'] as const).filter((s) => portions[s]?.available);
    const selectedSize = selectedSizes[item.id];
    const currentSize = (selectedSize && portions[selectedSize]?.available)
      ? selectedSize
      : (availableSizes[0] || 'medium');
    const currentPrice = portions[currentSize]?.price || item.price;
    const isVeg = item.dietary.includes('v') || item.dietary.includes('vg');

    return (
      <div
        key={item.id}
        onClick={() => setActiveDetailItem(item)}
        style={{
          background: 'var(--dark-card)',
          border: '1px solid var(--dark-border)',
          borderRadius: '16px',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
          position: 'relative',
          gap: '16px',
          width: '100%',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.backgroundColor = 'var(--dark-card-2)';
          el.style.transform = 'translateY(-2px)';
          el.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.06)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.backgroundColor = 'var(--dark-card)';
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.03)';
        }}
      >
        {/* Left Column: Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: 0 }}>
          {/* Badge & Veg Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Veg / Non-veg Indicator */}
            <div style={{
              width: '14px',
              height: '14px',
              border: `1.5px solid ${isVeg ? '#1F543C' : '#8F1D2F'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '3px',
              flexShrink: 0,
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: isVeg ? '#1F543C' : '#8F1D2F',
              }} />
            </div>

            {/* Badge Tag */}
            {item.badge && (
              <span style={{
                fontSize: '0.55rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                letterSpacing: '0.05em',
                ...getBadgeStyle(item.badge),
              }}>
                {item.badge}
              </span>
            )}
          </div>

          {/* Item Name */}
          <h3 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1.05rem',
            fontWeight: 600,
            color: 'var(--cream)',
            margin: 0,
            lineHeight: 1.2,
          }}>
            {item.name}
          </h3>

          {/* Price */}
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.95rem',
            fontWeight: 700,
            color: 'var(--cream)',
            lineHeight: 1,
          }}>
            ₹{currentPrice}
          </span>

          {/* Description */}
          <p style={{
            fontSize: '0.8rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {item.description}
          </p>

          {/* Portion Size Selection */}
          {availableSizes.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()} // Prevent modal trigger
              style={{ display: 'flex', gap: '6px', alignItems: 'center', marginTop: '4px' }}
            >
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Size:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {availableSizes.map((size) => {
                  const active = currentSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSizes((prev) => ({ ...prev, [item.id]: size }))}
                      style={{
                        padding: '2px 6px',
                        background: active ? 'rgba(143, 29, 47, 0.08)' : 'transparent',
                        border: `1px solid ${active ? 'var(--red)' : 'var(--dark-border)'}`,
                        color: active ? 'var(--red)' : 'var(--text-secondary)',
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.55rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        borderRadius: '4px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Image */}
        <div style={{
          position: 'relative',
          width: '96px',
          height: '96px',
          flexShrink: 0,
          borderRadius: '12px',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}>
          {!item.image ? (
            <div
              className={`food-photo ${item.gradient}`}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
              }}
            >
              {item.category === 'shakes' ? '🥤' : item.category === 'burgers' ? '🍔' : item.category === 'pastas' ? '🍝' : item.category === 'snacks' ? '🍟' : item.category === 'waffles' ? '🧇' : '☕'}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.image}
              alt={item.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                border: '1px solid var(--dark-border)',
              }}
            />
          )}
        </div>
      </div>
    );
  };

  /* ── Compact Mobile Card (Swiggy / Zomato style) ── */
  const renderMobileCard = (item: typeof menuItems[0]) => {
    const portions = getPortionsConfig(item);
    const availableSizes = (['small', 'medium', 'large'] as const).filter((s) => portions[s]?.available);
    const selectedSize = selectedSizes[item.id];
    const currentSize = (selectedSize && portions[selectedSize]?.available)
      ? selectedSize
      : (availableSizes[0] || 'medium');
    const currentPrice = portions[currentSize]?.price || item.price;
    const isVeg = item.dietary.includes('v') || item.dietary.includes('vg');

    // Create a stable mock rating based on item id
    const mockRating = ((item.name.charCodeAt(0) + item.name.charCodeAt(1 || 0)) % 6) / 10 + 4.0;

    return (
      <div
        key={item.id}
        style={{
          background: 'var(--dark-card)',
          border: '1px solid var(--dark-border)',
          borderRadius: '10px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Top: Square image section with overlays */}
        <div
          onClick={() => setActiveDetailItem(item)}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '1',
            backgroundColor: '#0a0a14',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          {!item.image ? (
            <div className={`food-photo ${item.gradient}`} style={{
              width: '100%', height: '100%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
            }}>
              {item.category === 'shakes' ? '🥤' : item.category === 'burgers' ? '🍔' : item.category === 'pastas' ? '🍝' : item.category === 'snacks' ? '🍟' : item.category === 'waffles' ? '🧇' : '☕'}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}

          {/* Overlay 1: Veg / Non-veg tag (Top-right) */}
          <div style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '12px',
            height: '12px',
            background: 'rgba(10, 10, 20, 0.75)',
            border: `1px solid ${isVeg ? '#1F543C' : '#8F1D2F'}`,
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2,
          }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', backgroundColor: isVeg ? '#1F543C' : '#8F1D2F' }} />
          </div>

          {/* Overlay 2: Bestseller / Popular badge (Top-left) */}
          {item.badge && (
            <span style={{
              position: 'absolute',
              top: '4px',
              left: '4px',
              fontSize: '0.42rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              padding: '1px 4px',
              borderRadius: '3px',
              letterSpacing: '0.02em',
              zIndex: 2,
              ...getBadgeStyle(item.badge),
            }}>
              {item.badge}
            </span>
          )}

          {/* Overlay 3: Rating (Bottom-left) */}
          <div style={{
            position: 'absolute',
            bottom: '4px',
            left: '4px',
            background: '#1F543C',
            color: '#FFFFFF',
            fontSize: '0.45rem',
            fontWeight: 800,
            padding: '1px 4px',
            borderRadius: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            zIndex: 2,
          }}>
            <span>★</span>
            <span>{mockRating.toFixed(1)}</span>
          </div>
        </div>

        {/* Bottom details */}
        <div style={{ padding: '6px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Name (2-line limit) */}
          <h4 style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.62rem',
            fontWeight: 600,
            color: 'var(--cream)',
            margin: 0,
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            minHeight: '2.5em',
          }}>
            {item.name}
          </h4>

          {/* Price */}
          <span style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.62rem',
            fontWeight: 700,
            color: 'var(--cream)',
            marginTop: '2px',
            display: 'block',
          }}>
            ₹{currentPrice}
          </span>

          {/* Size Selector (Compact S / M / L) */}
          {availableSizes.length > 1 && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                marginTop: 'auto',
                paddingTop: '4px',
              }}
            >
              {availableSizes.map((size) => {
                const active = currentSize === size;
                const abbrev = size === 'small' ? 'S' : size === 'medium' ? 'M' : 'L';
                return (
                  <button
                    key={size}
                    onClick={() => setSelectedSizes((prev) => ({ ...prev, [item.id]: size }))}
                    style={{
                      padding: '1px 3px',
                      background: active ? 'rgba(225,29,46,0.1)' : 'transparent',
                      border: `1px solid ${active ? 'var(--red)' : 'var(--dark-border)'}`,
                      color: active ? 'var(--red)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.42rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderRadius: '3px',
                      flex: 1,
                      textAlign: 'center',
                    }}
                  >
                    {abbrev}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="page-wrapper" style={{ position: 'relative' }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        {/* ── Hero Bar ── */}
      <div style={{
        paddingTop:   '48px',
        paddingBottom:'48px',
        background:   `
          radial-gradient(ellipse 40% 40% at 30% 40%, rgba(42,90,159,0.06) 0%, transparent 80%),
          radial-gradient(ellipse 50% 50% at 70% 60%, rgba(225,29,46,0.04) 0%, transparent 80%),
          var(--black)
        `,
        borderBottom: '1px solid var(--dark-border)',
      }}>
        <div className="container" style={{ textAlign:'center' }}>
          <div className="eyebrow" style={{ justifyContent:'center' }}>Our Menu</div>
          <h1 className="display-md" style={{ marginBottom:'12px' }}>
            Crafted with <em className="text-shimmer-red" style={{ fontStyle:'italic' }}>passion</em>
          </h1>
          <p className="body-lg" style={{ maxWidth:'440px', margin:'0 auto' }}>
            Every item made fresh daily. Bold flavours, thoughtful craft.
          </p>
        </div>
      </div>

      {/* ── Double Marquee Scrolling Bands ── */}
      <div style={{
        background: 'var(--void)',
        borderBottom: '1px solid var(--dark-border)',
        padding: '16px 0',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        userSelect: 'none',
      }}>
        <style>{`
          @keyframes menu-marquee-rtl {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes menu-marquee-ltr {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
          }
        `}</style>

        {/* Band 1: Right to Left */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{
            display: 'flex',
            width: 'max-content',
            alignItems: 'center',
            animation: 'menu-marquee-rtl 70s linear infinite',
          }}>
            {scrollItems1.map((name, idx) => (
              <React.Fragment key={`rtl-${idx}`}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(0.95rem, 1.4vw, 1.2rem)',
                  color: 'var(--cream)',
                  whiteSpace: 'nowrap',
                  padding: '0 6px',
                }}>
                  {name}
                </span>
                <span aria-hidden style={{
                  margin: '0 20px',
                  color: 'var(--gold)',
                  fontSize: '0.85rem',
                }}>
                  ✦
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Band 2: Left to Right */}
        <div style={{ overflow: 'hidden', width: '100%' }}>
          <div style={{
            display: 'flex',
            width: 'max-content',
            alignItems: 'center',
            animation: 'menu-marquee-ltr 70s linear infinite',
          }}>
            {scrollItems2.map((name, idx) => (
              <React.Fragment key={`ltr-${idx}`}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  fontSize: 'clamp(0.95rem, 1.4vw, 1.2rem)',
                  color: 'var(--cream)',
                  whiteSpace: 'nowrap',
                  padding: '0 6px',
                }}>
                  {name}
                </span>
                <span aria-hidden style={{
                  margin: '0 20px',
                  color: 'var(--gold)',
                  fontSize: '0.85rem',
                }}>
                  ✦
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>


      {/* ── Category Tabs (Zomato / Swiggy style circular icons on mobile) ── */}
      <div style={{
        background:     'var(--dark-surface)',
        borderBottom:   '1px solid var(--dark-border)',
        position:       'sticky',
        top:            'var(--navbar-h)',
        zIndex:         40,
        overflowX:      'auto',
        msOverflowStyle: 'none',
        scrollbarWidth:  'none',
        padding:        isMobile ? '16px 0 10px' : '0',
      }}>
        <style>{`
          .mobile-cat-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {isMobile ? (
          <div 
            className="mobile-cat-scroll"
            style={{ 
              display: 'flex', 
              gap: '16px', 
              padding: '0 20px', 
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              width: '100%',
            }}
          >
            {/* "All" category */}
            <div 
              onClick={() => setActiveCategory('all')}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
            >
              <div style={{
                width: '60px', height: '60px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: activeCategory === 'all' ? '2.5px solid var(--red)' : '1px solid var(--dark-border)',
                background: 'var(--dark-card)',
                boxShadow: activeCategory === 'all' ? '0 0 10px rgba(225, 29, 46, 0.25)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                <img src="/menu-burger.png" alt="All" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.65rem',
                fontWeight: activeCategory === 'all' ? 700 : 500,
                color: activeCategory === 'all' ? 'var(--red)' : 'var(--text-secondary)',
                marginTop: '6px',
                textAlign: 'center',
              }}>
                All
              </span>
            </div>

            {/* "New Arrivals" category */}
            {(hasNewArrivals || activeCategory === 'new-arrivals') && (
              <div 
                onClick={() => setActiveCategory('new-arrivals')}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
              >
                <div style={{
                  width: '60px', height: '60px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: activeCategory === 'new-arrivals' ? '2.5px solid var(--red)' : '1px solid var(--dark-border)',
                  background: 'var(--dark-card)',
                  boxShadow: activeCategory === 'new-arrivals' ? '0 0 10px rgba(225, 29, 46, 0.25)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease',
                }}>
                  <span style={{ fontSize: '1.5rem' }}>✨</span>
                </div>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.65rem',
                  fontWeight: activeCategory === 'new-arrivals' ? 700 : 500,
                  color: activeCategory === 'new-arrivals' ? 'var(--red)' : 'var(--text-secondary)',
                  marginTop: '6px',
                  textAlign: 'center',
                }}>
                  New
                </span>
              </div>
            )}

            {/* Regular categories */}
            {menuCategories.map((cat) => {
              const active = activeCategory === cat.id;
              // Dynamically map category ID to representative image
              let imgPath = '/menu-burger.png';
              if (cat.id === 'shakes') imgPath = '/event-shake.png';
              else if (cat.id === 'burgers') imgPath = '/menu-burger.png';
              else if (cat.id === 'pastas') imgPath = '/menu-pasta.png';
              else if (cat.id === 'snacks') imgPath = '/menu-fries.png';
              else if (cat.id === 'waffles') imgPath = '/event-waffle.png';
              else if (cat.id === 'drinks') imgPath = '/menu-coffee.png';

              return (
                <div 
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', flexShrink: 0 }}
                >
                  <div style={{
                    width: '60px', height: '60px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    border: active ? '2.5px solid var(--red)' : '1px solid var(--dark-border)',
                    background: 'var(--dark-card)',
                    boxShadow: active ? '0 0 10px rgba(225, 29, 46, 0.25)' : 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}>
                    <img src={imgPath} alt={cat.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.65rem',
                    fontWeight: active ? 700 : 500,
                    color: active ? 'var(--red)' : 'var(--text-secondary)',
                    marginTop: '6px',
                    textAlign: 'center',
                  }}>
                    {cat.label}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="container" style={{ display:'flex', alignItems:'center', gap:'0', padding:'0 var(--container-px)' }}>
            <button
              onClick={() => setActiveCategory('all')}
              className={`menu-tab ${activeCategory === 'all' ? 'active' : ''}`}
            >
              All
            </button>
            {(hasNewArrivals || activeCategory === 'new-arrivals') && (
              <button
                onClick={() => setActiveCategory('new-arrivals')}
                className={`menu-tab ${activeCategory === 'new-arrivals' ? 'active' : ''}`}
                style={{
                  borderColor: activeCategory === 'new-arrivals' ? 'var(--red)' : undefined,
                  color: activeCategory === 'new-arrivals' ? 'var(--red)' : undefined,
                }}
              >
                New Arrivals ✨
              </button>
            )}
            {menuCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`menu-tab ${activeCategory === cat.id ? 'active' : ''}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="container" style={{ padding:'40px var(--container-px)' }}>

        {/* ── Search + Filter Bar ── */}
        <div style={{ display:'flex', gap:'12px', marginBottom:'32px', flexWrap:'wrap', alignItems:'center' }}>
          {/* Search */}
          <div style={{ position:'relative', flex:'1', minWidth:'200px' }}>
            <Search size={14} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dishes..."
              style={{ paddingLeft:'40px' }}
            />
          </div>

          {/* Sort */}
          <div style={{ position:'relative' }}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              style={{ minWidth:'160px' }}
            >
              <option value="default">Default Order</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="name">Name A–Z</option>
            </select>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            style={{
              display:     'flex',
              alignItems:  'center',
              gap:         '6px',
              padding:     '14px 20px',
              background:  filterOpen ? 'rgba(225,29,46,0.1)' : 'transparent',
              border:      `1px solid ${filterOpen ? 'rgba(225,29,46,0.4)' : 'var(--dark-border-2)'}`,
              color:       filterOpen ? 'var(--red)' : 'var(--text-secondary)',
              fontFamily:  'var(--font-sans)',
              fontSize:    '0.78rem',
              cursor:      'pointer',
              transition:  'all 0.2s ease',
            }}
          >
            <Filter size={14} />
            Filters
            {(dietary.length > 0) && (
              <span style={{ background:'var(--red)', color:'var(--black)', width:'16px', height:'16px', borderRadius:'50%', fontSize:'0.55rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
                {dietary.length}
              </span>
            )}
          </button>
        </div>

        {/* ── Expanded Filter Panel ── */}
        {filterOpen && (
          <div style={{
            background:   'var(--dark-card)',
            border:       '1px solid var(--dark-border)',
            padding:      '24px',
            marginBottom: '24px',
            display:      'flex',
            gap:          '40px',
            flexWrap:     'wrap',
          }}>
            {/* Dietary */}
            <div>
              <p className="form-label" style={{ marginBottom:'12px' }}>Dietary</p>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {DIETARY_OPTIONS.map((d) => (
                  <button
                    key={d.key}
                    onClick={() => toggleDietary(d.key)}
                    style={{
                      padding:    '6px 16px',
                      background: dietary.includes(d.key) ? 'rgba(225,29,46,0.12)' : 'transparent',
                      border:     `1px solid ${dietary.includes(d.key) ? 'rgba(225,29,46,0.5)' : 'var(--dark-border-2)'}`,
                      color:      dietary.includes(d.key) ? 'var(--red)' : 'var(--text-secondary)',
                      fontFamily: 'var(--font-sans)',
                      fontSize:   '0.72rem',
                      fontWeight: 600,
                      cursor:     'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <p className="form-label" style={{ marginBottom:'12px' }}>Max Price: ₹{maxPrice}</p>
              <input
                type="range"
                min={40}
                max={500}
                step={10}
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{
                  width:'200px', height:'2px', accentColor:'var(--red)',
                  background:'var(--dark-border-2)',
                }}
              />
            </div>

            {/* Clear */}
            {(dietary.length > 0 || maxPrice < 500) && (
              <button
                onClick={() => { setDietary([]); setMaxPrice(500); }}
                className="btn-ghost"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* ── Count ── */}
        <p style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginBottom:'24px', letterSpacing:'0.08em' }}>
          Showing <span style={{ whiteSpace: 'nowrap' }}>{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
          {activeCategory !== 'all' && ` in ${menuCategories.find((c) => c.id === activeCategory)?.label}`}
        </p>

        {/* ── Menu Grid ── */}
        {filtered.length === 0 ? (
          <div style={{
            textAlign:    'center',
            padding:      '80px 20px',
            color:        'var(--text-secondary)',
            border:       '1px dashed var(--dark-border-2)',
          }}>
            <p style={{ fontFamily:'var(--font-display)', fontSize:'1.5rem', color:'var(--cream)', marginBottom:'8px' }}>No items found</p>
            <p style={{ fontSize:'0.875rem' }}>Try adjusting your filters or search query.</p>
          </div>
        ) : activeCategory === 'new-arrivals' ? (
          <div style={{ marginBottom: '56px' }}>
            {renderCategoryBanner('new-arrivals', 'New Arrivals ✨', 'Check out our latest creations, fresh from the kitchen.', filtered.length)}
            {isMobile ? (
              <MobileGrid items={filtered} renderCard={renderMobileCard} />
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                gap: '24px',
              }}>
                {filtered.map(renderMenuItemCard)}
              </div>
            )}
          </div>
        ) : (
          <div>
            {menuCategories.map((cat) => {
              if (activeCategory !== 'all' && activeCategory !== cat.id) return null;
              
              const catItems = itemsByCategory[cat.id] || [];
              if (catItems.length === 0) return null;
              
              return (
                <div key={cat.id} style={{ marginBottom: '56px' }}>
                  {renderCategoryBanner(cat.id, cat.label, cat.desc, catItems.length)}
                  {isMobile ? (
                    <MobileGrid items={catItems} renderCard={renderMobileCard} />
                  ) : (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
                      gap: '24px',
                    }}>
                      {catItems.map(renderMenuItemCard)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>

      {/* Floating Gutters (Desktop Only) */}
      <div className="floating-gutters" style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}>
        <style>{`
          @keyframes morph-1 {
            0%, 100% { border-radius: 40% 60% 70% 30% / 45% 45% 55% 55%; }
            33% { border-radius: 60% 40% 50% 50% / 55% 45% 55% 45%; }
            66% { border-radius: 50% 50% 30% 70% / 40% 60% 40% 60%; }
          }
          @keyframes morph-2 {
            0%, 100% { border-radius: 70% 30% 50% 50% / 60% 40% 60% 40%; }
            33% { border-radius: 40% 60% 30% 70% / 45% 55% 45% 55%; }
            66% { border-radius: 60% 40% 70% 30% / 50% 50% 50% 50%; }
          }
          @keyframes morph-3 {
            0%, 100% { border-radius: 50% 50% 70% 30% / 40% 60% 50% 50%; }
            33% { border-radius: 70% 30% 40% 60% / 55% 45% 65% 35%; }
            66% { border-radius: 40% 60% 50% 50% / 60% 40% 40% 60%; }
          }
          @keyframes morph-4 {
            0%, 100% { border-radius: 60% 40% 30% 70% / 50% 50% 60% 40%; }
            33% { border-radius: 50% 50% 60% 40% / 45% 55% 50% 50%; }
            66% { border-radius: 70% 30% 50% 50% / 55% 45% 65% 35%; }
          }
          
          @keyframes drift-left-1 {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(4.5vw, -4vh); }
            50% { transform: translate(-1.5vw, 5vh); }
            75% { transform: translate(3vw, 2vh); }
          }
          @keyframes drift-left-2 {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(-2vw, 5vh); }
            66% { transform: translate(5vw, -3vh); }
          }
          @keyframes drift-right-1 {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-4.5vw, 4vh); }
            50% { transform: translate(1.5vw, -5vh); }
            75% { transform: translate(-3vw, -2vh); }
          }
          @keyframes drift-right-2 {
            0%, 100% { transform: translate(0, 0); }
            33% { transform: translate(2vw, -5vh); }
            66% { transform: translate(-4vw, 3vh); }
          }

          .morph-item-1 { animation: morph-1 12s ease-in-out infinite; }
          .morph-item-2 { animation: morph-2 15s ease-in-out infinite; }
          .morph-item-3 { animation: morph-3 18s ease-in-out infinite; }
          .morph-item-4 { animation: morph-4 20s ease-in-out infinite; }

          .drift-item-l1 { animation: drift-left-1 25s ease-in-out infinite; }
          .drift-item-l2 { animation: drift-left-2 28s ease-in-out infinite; }
          .drift-item-r1 { animation: drift-right-1 26s ease-in-out infinite; }
          .drift-item-r2 { animation: drift-right-2 30s ease-in-out infinite; }

          .amoeba-float-container {
            transition: opacity 0.4s ease-in-out, box-shadow 0.3s ease-in-out, transform 0.3s ease-in-out;
            cursor: pointer;
            pointer-events: auto;
          }
          .amoeba-float-container:hover {
            opacity: 0.95 !important;
            transform: scale(1.06) !important;
          }
          @media (max-width: 1023px) {
            .floating-gutters {
              display: none !important;
            }
          }
        `}</style>

        {/* Left Floating Gutters */}
        {(() => {
          const offsets = getGutterOffsets(filtered.length).left;
          
          return offsets.map((topOffset, index) => {
            const list = currentConfig.left;
            if (list.length === 0) return null;
            const imgConfig = list[index % list.length];
            const driftClass = index % 2 === 0 ? "drift-item-l1" : "drift-item-l2";
            const morphClass = `morph-item-${(index % 4) + 1}`;
            
            return (
              <div
                key={`left-${index}`}
                style={{
                  position: 'absolute',
                  left: index % 2 === 0 ? '1.5vw' : '4.5vw',
                  top: topOffset,
                  width: '11vw',
                  height: '11vw',
                  maxHeight: '160px',
                  maxWidth: '160px',
                  transform: `translateY(${scrollY * 0.08}px)`,
                  transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none',
                }}
              >
                <div className={driftClass} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <div
                    onClick={() => handleGutterClick(imgConfig.category)}
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      opacity: transitionOpacity * 0.5,
                      boxShadow: `0 15px 45px ${currentConfig.glow}, 0 0 25px rgba(255,255,255,0.01)`,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: 'var(--panel-dark)',
                      pointerEvents: 'auto',
                    }}
                    className={`${morphClass} amoeba-float-container`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgConfig.src}
                      alt={`Left item ${index}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            );
          });
        })()}

        {/* Right Floating Gutters */}
        {(() => {
          const offsets = getGutterOffsets(filtered.length).right;
          
          return offsets.map((topOffset, index) => {
            const list = currentConfig.right;
            if (list.length === 0) return null;
            const imgConfig = list[index % list.length];
            const driftClass = index % 2 === 0 ? "drift-item-r1" : "drift-item-r2";
            const morphClass = `morph-item-${((index + 2) % 4) + 1}`;
            
            return (
              <div
                key={`right-${index}`}
                style={{
                  position: 'absolute',
                  right: index % 2 === 0 ? '1.5vw' : '4.5vw',
                  top: topOffset,
                  width: '11vw',
                  height: '11vw',
                  maxHeight: '160px',
                  maxWidth: '160px',
                  transform: `translateY(${scrollY * 0.08}px)`,
                  transition: 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                  pointerEvents: 'none',
                }}
              >
                <div className={driftClass} style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                  <div
                    onClick={() => handleGutterClick(imgConfig.category)}
                    style={{
                      width: '100%',
                      height: '100%',
                      overflow: 'hidden',
                      opacity: transitionOpacity * 0.5,
                      boxShadow: `0 15px 45px ${currentConfig.glow}, 0 0 25px rgba(255,255,255,0.01)`,
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      backgroundColor: 'var(--panel-dark)',
                      pointerEvents: 'auto',
                    }}
                    className={`${morphClass} amoeba-float-container`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imgConfig.src}
                      alt={`Right item ${index}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* ── CUSTOMER MENU DETAILS POPUP MODAL (Zomato Style) ── */}
      {activeDetailItem && (() => {
        const item = activeDetailItem;
        const portions = getPortionsConfig(item);
        const availableSizes = (['small', 'medium', 'large'] as const).filter((s) => portions[s]?.available);
        const selectedSize = selectedSizes[item.id];
        const currentSize = (selectedSize && portions[selectedSize]?.available)
          ? selectedSize
          : (availableSizes[0] || 'medium');
        const currentPrice = portions[currentSize]?.price || item.price;
        const isVeg = item.dietary.includes('v') || item.dietary.includes('vg');
        const mockRating = ((item.name.charCodeAt(0) + item.name.charCodeAt(1 || 0)) % 6) / 10 + 4.0;

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: isMobile ? 'flex-end' : 'center',
            justifyContent: 'center',
            padding: isMobile ? '0' : '24px',
          }}
          onClick={() => setActiveDetailItem(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          >
            {/* Nav Arrows (Desktop Only) */}
            {!isMobile && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); handlePrevDish(); }}
                  aria-label="Previous dish"
                  style={{
                    position: 'absolute',
                    left: '40px',
                    background: 'rgba(20, 20, 30, 0.6)',
                    border: '1px solid rgba(225, 29, 46, 0.3)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10000,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(225, 29, 46, 0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 20, 30, 0.6)'; }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); handleNextDish(); }}
                  aria-label="Next dish"
                  style={{
                    position: 'absolute',
                    right: '40px',
                    background: 'rgba(20, 20, 30, 0.6)',
                    border: '1px solid rgba(225, 29, 46, 0.3)',
                    color: '#fff',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    zIndex: 10000,
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(225, 29, 46, 0.25)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(20, 20, 30, 0.6)'; }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </button>
              </>
            )}

            {/* Modal Card Wrapper */}
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: isMobile ? '100vw' : '520px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveDetailItem(null)}
                style={{
                  position: 'absolute',
                  top: isMobile ? '-56px' : '16px',
                  right: isMobile ? 'auto' : '16px',
                  left: isMobile ? '50%' : 'auto',
                  transform: isMobile ? 'translateX(-50%)' : 'none',
                  background: 'rgba(0, 0, 0, 0.6)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#fff',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  zIndex: 10000,
                }}
              >
                <X size={18} />
              </button>

              {/* Inner Modal Card */}
              <div style={{
                background: 'var(--dark-card)',
                border: isMobile ? 'none' : '1px solid rgba(225, 29, 46, 0.25)',
                width: '100%',
                height: isMobile ? 'auto' : 'auto',
                maxHeight: isMobile ? '82vh' : '85vh',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: isMobile ? '24px 24px 0 0' : '18px',
                overflow: 'hidden',
              }}>

              {/* Top - Image Section */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: isMobile ? '220px' : '260px',
                background: item.image ? '#000' : undefined,
                flexShrink: 0,
                padding: isMobile ? '16px 16px 0 16px' : '0',
                boxSizing: 'border-box',
              }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: isMobile ? '16px' : '0',
                  overflow: 'hidden',
                }}
                className={!item.image ? `food-photo ${item.gradient}` : 'food-photo'}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 40vw"
                      style={{ objectFit: 'cover' }}
                      unoptimized={item.image.startsWith('data:') || item.image.startsWith('blob:')}
                    />
                  ) : (
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                      🥤
                    </div>
                  )}
                  {item.badge && (
                    <span className="badge-red" style={{ position: 'absolute', top: '16px', left: '16px', fontSize: '0.6rem' }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Middle - Information (Scrollable on Mobile) */}
              <div style={{
                padding: isMobile ? '16px 20px' : '24px 20px',
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch',
              }}>
                {/* Veg / Non-Veg Icon & Name Row */}
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                  {/* Veg / Non-Veg Icon */}
                  <div style={{
                    width: '14px', height: '14px',
                    border: `1.5px solid ${isVeg ? '#1F543C' : '#8F1D2F'}`,
                    borderRadius: '3px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    marginTop: '4px',
                  }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: isVeg ? '#1F543C' : '#8F1D2F' }} />
                  </div>
                  
                  {/* Name */}
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: isMobile ? '1.35rem' : '1.6rem',
                    color: 'var(--cream)',
                    margin: 0,
                    lineHeight: 1.2,
                    fontWeight: 400,
                  }}>
                    {item.name}
                  </h2>
                </div>

                {/* Popularity Badge (Zomato-style Pill) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(31,84,60,0.06)',
                  border: '1px solid rgba(31,84,60,0.12)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  alignSelf: 'flex-start',
                  marginBottom: '14px',
                }}>
                  <div style={{ width: '24px', height: '5px', background: '#1F543C', borderRadius: '3px' }} />
                  <span style={{ fontSize: '0.65rem', color: '#88cca7', fontWeight: 700, letterSpacing: '0.02em' }}>Highly reordered</span>
                </div>

                {/* Description */}
                <p style={{
                  fontSize: isMobile ? '0.78rem' : '0.82rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  margin: '0 0 16px 0',
                }}>
                  {item.description}
                </p>

                {/* Dietary Tags */}
                {item.dietary.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
                    {item.dietary.map((tag) => (
                      <span key={tag} className={`dietary-tag ${tag}`} style={{ padding: '3px 8px', fontSize: '0.58rem', borderRadius: '4px' }}>{tag.toUpperCase()}</span>
                    ))}
                  </div>
                )}

                {/* Allergens info */}
                {item.allergens.length > 0 && (
                  <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '12px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allergens:</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginLeft: '6px' }}>
                      Contains {item.allergens.join(', ')}
                    </span>
                  </div>
                )}

                {/* Portion Sizing */}
                {availableSizes.length > 1 && (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', borderTop: '1px solid var(--dark-border)', paddingTop: '12px', marginTop: 'auto' }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Size:</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {availableSizes.map((size) => {
                        const active = currentSize === size;
                        return (
                          <button
                            key={size}
                            onClick={() => setSelectedSizes((prev) => ({ ...prev, [item.id]: size }))}
                            style={{
                              padding: '4px 10px',
                              background: active ? 'rgba(225,29,46,0.12)' : 'transparent',
                              border: `1px solid ${active ? 'var(--red)' : 'var(--dark-border)'}`,
                              color: active ? 'var(--red)' : 'var(--text-secondary)',
                              fontFamily: 'var(--font-sans)',
                              fontSize: '0.6rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              cursor: 'pointer',
                              borderRadius: '4px',
                            }}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom - Sticky Footer with Price */}
              <div style={{
                borderTop: '1px solid var(--dark-border)',
                padding: '16px 20px',
                background: 'var(--dark-card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '2px' }}>Price</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', fontWeight: 700 }}>₹{currentPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    })()}
  </main>
);
}
