'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useCMSStore, useRestaurantStore } from '@/store/restaurantStore';
import { useRouter } from 'next/navigation';
import { 
  menuItems as initialMenuItems,
  menuCategories as initialMenuCategories 
} from '@/data/restaurantData';
import { Search, Filter, X } from 'lucide-react';

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

export default function MenuPage() {
  const storeMenuItems      = useCMSStore((s) => s.menuItems);
  const storeMenuCategories = useCMSStore((s) => s.menuCategories);
  const user                = useRestaurantStore((s) => s.user);
  const router              = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !user) {
      router.push('/account?redirect=/menu');
    }
  }, [isMounted, user, router]);

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

  useEffect(() => {
    if (isMounted) {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'new') {
        setActiveCategory('new-arrivals');
      }
    }
  }, [isMounted]);

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

  if (!isMounted || !user) {
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

  const renderMenuItemCard = (item: typeof menuItems[0]) => {
    const portions = getPortionsConfig(item);
    const availableSizes = (['small', 'medium', 'large'] as const).filter((s) => portions[s]?.available);
    const selectedSize = selectedSizes[item.id];
    // Ensure currentSize always points to an available portion
    const currentSize = (selectedSize && portions[selectedSize]?.available)
      ? selectedSize
      : (availableSizes[0] || 'medium');
    const currentPrice = portions[currentSize]?.price || item.price;
    return (
      <div
        key={item.id}
        style={{
          background:   'var(--dark-card)',
          border:       '1px solid var(--dark-border)',
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
          transition:   'background 0.3s ease, transform 0.4s var(--ease-expo), box-shadow 0.4s var(--ease-expo)',
          width:        '100%',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = 'var(--dark-card-2)';
          el.style.transform = 'translateY(-5px)';
          el.style.boxShadow = '0 24px 48px rgba(0,0,0,0.28)';
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLElement;
          el.style.background = 'var(--dark-card)';
          el.style.transform = 'translateY(0)';
          el.style.boxShadow = 'none';
        }}
      >
        {/* Clickable Area for Pop-up Details */}
        <div
          onClick={() => setActiveDetailItem(item)}
          style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', flex: 1 }}
        >
          {/* Image Zone */}
          <div
            style={{
              height: '160px', position: 'relative', overflow: 'hidden',
              background: (item as { image?: string | null }).image ? '#000' : undefined,
            }}
            className={!(item as { image?: string | null }).image ? `food-photo img-zoom-wrap ${item.gradient}` : 'food-photo img-zoom-wrap'}
          >
            {(item as { image?: string | null }).image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={(item as { image?: string | null }).image!}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            )}
            {item.badge && (
              <span className="badge-red" style={{ position:'absolute', top:'12px', left:'12px', fontSize:'0.5rem' }}>
                {item.badge}
              </span>
            )}
            {/* Category chip */}
            <span style={{
              position:      'absolute',
              bottom:        '12px',
              right:         '12px',
              fontFamily:    'var(--font-sans)',
              fontSize:      '0.52rem',
              fontWeight:    700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color:         'rgba(225,29,46,0.55)',
            }}>
              {item.course}
            </span>
          </div>

          {/* Content */}
          <div style={{ padding:'24px 20px', flex:1, display:'flex', flexDirection:'column', gap:'8px' }}>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize:   '1.15rem',
              color:      'var(--cream)',
              lineHeight: 1.1,
            }}>
              {item.name}
            </h3>
            <p style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6, flex:1 }}>
              {item.description}
            </p>

            {/* Dietary */}
            {item.dietary.length > 0 && (
              <div style={{ display:'flex', gap:'4px', flexWrap:'wrap', marginTop:'4px' }}>
                {item.dietary.map((tag) => (
                  <span key={tag} className={`dietary-tag ${tag}`}>{tag.toUpperCase()}</span>
                ))}
              </div>
            )}

            {/* Allergens */}
            {item.allergens.length > 0 && (
              <p style={{ fontSize:'0.62rem', color:'var(--text-muted)', letterSpacing:'0.05em', marginTop:'4px' }}>
                Contains: {item.allergens.join(', ')}
              </p>
            )}
          </div>
        </div>

        {/* Portion Size Selection */}
        {availableSizes.length > 1 && (
          <div style={{ display: 'flex', gap: '8px', padding: '0 20px 12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Size:</span>
            <div style={{ display: 'flex', gap: '4px' }}>
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
                      fontWeight: 750,
                      textTransform: 'uppercase',
                      cursor: 'pointer',
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

        {/* Footer */}
        <div style={{
          padding:      '16px 20px',
          borderTop:    '1px solid var(--dark-border)',
          display:      'flex',
          alignItems:   'center',
          justifyContent:'space-between',
          gap:          '12px',
        }}>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontSize:   '1.85rem',
            color:      'var(--red)',
            lineHeight: 1,
            whiteSpace: 'nowrap',
          }}>
            ₹{currentPrice}
          </span>
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
          radial-gradient(ellipse 70% 60% at 50% 50%, rgba(225,29,46,0.05) 0%, transparent 70%),
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


      {/* ── Category Tabs ── */}
      <div style={{
        background:     'var(--dark-surface)',
        borderBottom:   '1px solid var(--dark-border)',
        position:       'sticky',
        top:            'var(--navbar-h)',
        zIndex:         40,
        overflowX:      'auto',
      }}>
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
        ) : filtered.length === 1 ? (
          // Single Item: Premium horizontal banner layout, centered and perfectly sized
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {(() => {
              const item = filtered[0];
              return (
                <div
                  style={{
                    background: 'var(--dark-card)',
                    border: '1px solid var(--dark-border)',
                    display: 'flex',
                    flexDirection: 'row',
                    flexWrap: 'wrap',
                    width: '100%',
                    maxWidth: '850px',
                    minHeight: '320px',
                    overflow: 'hidden',
                  }}
                >
                  {/* Image Zone */}
                  <div
                    style={{
                      flex: '1 1 350px',
                      height: 'auto',
                      minHeight: '260px',
                      position: 'relative',
                      overflow: 'hidden',
                      background: (item as { image?: string | null }).image ? '#000' : undefined,
                    }}
                    className={!(item as { image?: string | null }).image ? `food-photo ${item.gradient}` : 'food-photo'}
                  >
                    {(item as { image?: string | null }).image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={(item as { image?: string | null }).image!}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', position: 'absolute', inset: 0 }}
                      />
                    )}
                    {item.badge && (
                      <span className="badge-red" style={{ position:'absolute', top:'16px', left:'16px', fontSize:'0.55rem' }}>
                        {item.badge}
                      </span>
                    )}
                    <span style={{
                      position:      'absolute',
                      bottom:        '16px',
                      right:         '16px',
                      fontFamily:    'var(--font-sans)',
                      fontSize:      '0.55rem',
                      fontWeight:    700,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color:         'rgba(225,29,46,0.7)',
                    }}>
                      {item.course}
                    </span>
                  </div>

                  {/* Content & Action Zone */}
                  <div style={{ flex: '1 2 400px', padding: '36px 30px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', margin: 0, lineHeight: 1.1 }}>
                        {item.name}
                      </h3>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                        {item.description}
                      </p>
                      
                      {/* Dietary */}
                      {item.dietary.length > 0 && (
                        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                          {item.dietary.map((tag) => (
                            <span key={tag} className={`dietary-tag ${tag}`} style={{ fontSize: '0.62rem', padding: '2px 8px' }}>{tag.toUpperCase()}</span>
                          ))}
                        </div>
                      )}

                      {/* Allergens */}
                      {item.allergens.length > 0 && (
                        <p style={{ fontSize:'0.65rem', color:'var(--text-muted)', letterSpacing:'0.05em', margin: 0 }}>
                          Contains: {item.allergens.join(', ')}
                        </p>
                      )}
                    </div>

                    {/* Footer / Price — view-only, no add button */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--dark-border)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.85rem', color: 'var(--red)' }}>
                        ₹{item.price}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : filtered.length === 2 ? (
          // Dual Items: Grid with centered columns that wrap nicely on mobile
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              width: '100%',
              maxWidth: '850px',
            }}>
              {filtered.map(renderMenuItemCard)}
            </div>
          </div>
        ) : (
          // 3 or more items: Flexbox layout that centers incomplete rows and prevents empty spaces
          <div style={{
            display:        'flex',
            flexWrap:       'wrap',
            gap:            '24px',
            justifyContent: 'center',
          }}>
            {filtered.map((item) => (
              <div key={item.id} style={{ flex: '1 1 300px', maxWidth: '380px', display: 'flex' }}>
                {renderMenuItemCard(item)}
              </div>
            ))}
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

      {/* ── CUSTOMER MENU DETAILS POPUP MODAL ──────────────────────────────── */}
      {activeDetailItem && (() => {
        const item = activeDetailItem;
        const portions = getPortionsConfig(item);
        const availableSizes = (['small', 'medium', 'large'] as const).filter((s) => portions[s]?.available);
        const selectedSize = selectedSizes[item.id];
        const currentSize = (selectedSize && portions[selectedSize]?.available)
          ? selectedSize
          : (availableSizes[0] || 'medium');
        const currentPrice = portions[currentSize]?.price || item.price;

        return (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setActiveDetailItem(null)}
          >
            {/* Modal Card */}
            <div style={{
              background: 'var(--dark-card)',
              border: '1px solid rgba(225, 29, 46, 0.25)',
              width: '100%',
              maxWidth: '780px',
              position: 'relative',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => setActiveDetailItem(null)}
                style={{
                  position: 'absolute',
                  top: '16px',
                  right: '16px',
                  background: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(225, 29, 46, 0.2)',
                  color: 'var(--red)',
                  cursor: 'pointer',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  zIndex: 10,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(225, 29, 46, 0.15)'; e.currentTarget.style.borderColor = 'var(--red)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0, 0, 0, 0.4)'; e.currentTarget.style.borderColor = 'rgba(225, 29, 46, 0.2)'; }}
              >
                <X size={18} />
              </button>

              {/* Left - Image */}
              <div style={{
                position: 'relative',
                height: '340px',
                background: item.image ? '#000' : undefined,
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
                  <span className="badge-red" style={{ position: 'absolute', top: '20px', left: '20px' }}>
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Right - Details */}
              <div style={{
                padding: '36px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: 'var(--red)',
                  }}>
                    {item.course} — {item.category}
                  </span>
                  <h2 style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    color: 'var(--cream)',
                    marginTop: '6px',
                    marginBottom: '12px',
                    lineHeight: 1.15,
                  }}>
                    {item.name}
                  </h2>
                  <p style={{
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.75,
                    marginBottom: '20px',
                  }}>
                    {item.description}
                  </p>

                  {/* Dietary Tags */}
                  {item.dietary.length > 0 && (
                    <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
                      {item.dietary.map((tag) => (
                        <span key={tag} className={`dietary-tag ${tag}`} style={{ padding: '4px 10px', fontSize: '0.65rem' }}>{tag.toUpperCase()}</span>
                      ))}
                    </div>
                  )}

                  {/* Allergens */}
                  {item.allergens.length > 0 && (
                    <div style={{ borderTop: '1px solid var(--dark-border)', paddingTop: '16px', marginBottom: '16px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Allergen Info:</span>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Contains {item.allergens.join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Portion selection */}
                  {availableSizes.length > 1 && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px', borderTop: '1px solid var(--dark-border)', paddingTop: '16px' }}>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 700 }}>Choose Size:</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {availableSizes.map((size) => {
                          const active = currentSize === size;
                          return (
                            <button
                              key={size}
                              onClick={() => setSelectedSizes((prev) => ({ ...prev, [item.id]: size }))}
                              style={{
                                padding: '6px 12px',
                                background: active ? 'rgba(225,29,46,0.12)' : 'transparent',
                                border: `1px solid ${active ? 'var(--red)' : 'var(--dark-border)'}`,
                                color: active ? 'var(--red)' : 'var(--text-secondary)',
                                fontFamily: 'var(--font-sans)',
                                fontSize: '0.65rem',
                                fontWeight: 750,
                                textTransform: 'uppercase',
                                cursor: 'pointer',
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

                {/* Footer Action */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderTop: '1px solid var(--dark-border)',
                  paddingTop: '20px',
                  marginTop: '20px',
                  gap: '16px',
                }}>
                  <span style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: '2.25rem',
                    color: 'var(--red)',
                    lineHeight: 1,
                    whiteSpace: 'nowrap',
                  }}>
                    ₹{currentPrice}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </main>
  );
}
