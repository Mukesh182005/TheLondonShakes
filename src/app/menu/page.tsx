'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRestaurantStore, useCMSStore } from '@/store/restaurantStore';
import { 
  menuItems as initialMenuItems,
  menuCategories as initialMenuCategories 
} from '@/data/restaurantData';
import { Search, Filter, ShoppingBag, Plus, Minus } from 'lucide-react';

const DIETARY_OPTIONS = [
  { key: 'v',  label: 'Vegetarian' },
  { key: 'vg', label: 'Vegan'      },
  { key: 'gf', label: 'Gluten Free'},
  { key: 'df', label: 'Dairy Free' },
];

export default function MenuPage() {
  const storeMenuItems      = useCMSStore((s) => s.menuItems);
  const storeMenuCategories = useCMSStore((s) => s.menuCategories);
  const cart                = useRestaurantStore((s) => s.cart);
  const addToCart           = useRestaurantStore((s) => s.addToCart);
  const updateQty           = useRestaurantStore((s) => s.updateQty);

  const [isMounted, setIsMounted] = useState(false);
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

  const filtered = useMemo(() => {
    let items = [...menuItems];

    if (activeCategory !== 'all') {
      items = items.filter((i) => i.category === activeCategory);
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
  }, [menuItems, activeCategory, searchQuery, dietary, maxPrice, sortBy]);

  const getCartItem = (id: string) => cart.items.find((i) => i.id === id);

  const toggleDietary = (key: string) =>
    setDietary((prev) => prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key]);

  const renderMenuItemCard = (item: typeof menuItems[0]) => {
    const inCart = getCartItem(item.id);
    return (
      <div
        key={item.id}
        style={{
          background:   'var(--dark-card)',
          border:       '1px solid var(--dark-border)',
          display:      'flex',
          flexDirection:'column',
          overflow:     'hidden',
          transition:   'background 0.3s ease',
          width:        '100%',
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--dark-card-2)')}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--dark-card)')}
      >
        {/* Image Zone */}
        <div
          style={{
            height: '160px', position: 'relative', overflow: 'hidden',
            background: (item as { image?: string | null }).image ? '#000' : undefined,
          }}
          className={!(item as { image?: string | null }).image ? `food-photo ${item.gradient}` : 'food-photo'}
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
            <span className="badge-gold" style={{ position:'absolute', top:'12px', left:'12px', fontSize:'0.5rem' }}>
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
            color:         'rgba(197,168,92,0.55)',
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
            <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
              {item.dietary.map((tag) => (
                <span key={tag} className={`dietary-tag ${tag}`}>{tag.toUpperCase()}</span>
              ))}
            </div>
          )}

          {/* Allergens */}
          {item.allergens.length > 0 && (
            <p style={{ fontSize:'0.62rem', color:'var(--text-muted)', letterSpacing:'0.05em' }}>
              Contains: {item.allergens.join(', ')}
            </p>
          )}
        </div>

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
            fontSize:   '1.4rem',
            color:      'var(--gold)',
            lineHeight: 1,
          }}>
            ₹{item.price}
          </span>

          {/* Cart Controls */}
          {inCart ? (
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <button
                onClick={() => updateQty(item.id, inCart.qty - 1)}
                style={{
                  width:'32px', height:'32px',
                  background:'rgba(197,168,92,0.1)',
                  border:'1px solid rgba(197,168,92,0.3)',
                  color:'var(--gold)', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >
                <Minus size={13} />
              </button>
              <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.84rem', fontWeight:700, color:'var(--cream)', minWidth:'16px', textAlign:'center' }}>
                {inCart.qty}
              </span>
              <button
                onClick={() => addToCart({ id:item.id, name:item.name, price:item.price, gradient:item.gradient })}
                style={{
                  width:'32px', height:'32px',
                  background:'rgba(197,168,92,0.1)',
                  border:'1px solid rgba(197,168,92,0.3)',
                  color:'var(--gold)', cursor:'pointer',
                  display:'flex', alignItems:'center', justifyContent:'center',
                }}
              >
                <Plus size={13} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart({ id:item.id, name:item.name, price:item.price, gradient:item.gradient })}
              style={{
                display:    'flex',
                alignItems: 'center',
                gap:        '6px',
                padding:    '10px 18px',
                background: 'transparent',
                border:     '1px solid rgba(197,168,92,0.3)',
                color:      'var(--gold)',
                fontFamily: 'var(--font-sans)',
                fontSize:   '0.65rem',
                fontWeight: 600,
                letterSpacing:'0.15em',
                textTransform:'uppercase',
                cursor:     'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(197,168,92,0.08)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--gold)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(197,168,92,0.3)'; }}
            >
              <ShoppingBag size={13} />
              Add
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <main className="page-wrapper">
      {/* ── Hero Bar ── */}
      <div style={{
        paddingTop:   '48px',
        paddingBottom:'48px',
        background:   `
          radial-gradient(ellipse 70% 60% at 50% 50%, rgba(197,168,92,0.05) 0%, transparent 70%),
          var(--black)
        `,
        borderBottom: '1px solid var(--dark-border)',
      }}>
        <div className="container" style={{ textAlign:'center' }}>
          <div className="eyebrow" style={{ justifyContent:'center' }}>Our Menu</div>
          <h1 className="display-md" style={{ marginBottom:'12px' }}>
            Crafted with <em style={{ color:'var(--gold)', fontStyle:'italic' }}>passion</em>
          </h1>
          <p className="body-lg" style={{ maxWidth:'440px', margin:'0 auto' }}>
            Every item made fresh daily. Bold flavours, thoughtful craft.
          </p>
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
              background:  filterOpen ? 'rgba(197,168,92,0.1)' : 'transparent',
              border:      `1px solid ${filterOpen ? 'rgba(197,168,92,0.4)' : 'var(--dark-border-2)'}`,
              color:       filterOpen ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily:  'var(--font-sans)',
              fontSize:    '0.78rem',
              cursor:      'pointer',
              transition:  'all 0.2s ease',
            }}
          >
            <Filter size={14} />
            Filters
            {(dietary.length > 0) && (
              <span style={{ background:'var(--gold)', color:'var(--black)', width:'16px', height:'16px', borderRadius:'50%', fontSize:'0.55rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                      background: dietary.includes(d.key) ? 'rgba(197,168,92,0.12)' : 'transparent',
                      border:     `1px solid ${dietary.includes(d.key) ? 'rgba(197,168,92,0.5)' : 'var(--dark-border-2)'}`,
                      color:      dietary.includes(d.key) ? 'var(--gold)' : 'var(--text-secondary)',
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
                  width:'200px', height:'2px', accentColor:'var(--gold)',
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
          Showing {filtered.length} item{filtered.length !== 1 ? 's' : ''}
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
              const inCart = getCartItem(item.id);
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
                      <span className="badge-gold" style={{ position:'absolute', top:'16px', left:'16px', fontSize:'0.55rem' }}>
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
                      color:         'rgba(197,168,92,0.7)',
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

                    {/* Footer / Price & Add */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--dark-border)' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', color: 'var(--gold)' }}>
                        ₹{item.price}
                      </span>
                      {inCart ? (
                        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                          <button onClick={() => updateQty(item.id, inCart.qty - 1)} style={{ width:'32px', height:'32px', background:'rgba(197,168,92,0.1)', border:'1px solid rgba(197,168,92,0.3)', color:'var(--gold)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Minus size={12} /></button>
                          <span style={{ fontFamily:'var(--font-sans)', fontSize:'0.85rem', fontWeight:700, color:'var(--cream)' }}>{inCart.qty}</span>
                          <button onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, gradient: item.gradient })} style={{ width:'32px', height:'32px', background:'rgba(197,168,92,0.1)', border:'1px solid rgba(197,168,92,0.3)', color:'var(--gold)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Plus size={12} /></button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart({ id: item.id, name: item.name, price: item.price, gradient: item.gradient })} style={{ display:'flex', alignItems:'center', gap:'6px', padding:'10px 18px', background:'transparent', border:'1px solid rgba(197,168,92,0.3)', color:'var(--gold)', fontFamily:'var(--font-sans)', fontSize:'0.65rem', fontWeight:600, letterSpacing:'0.15em', textTransform:'uppercase', cursor:'pointer' }}>
                          <ShoppingBag size={12} />
                          <span>Add to Order</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : filtered.length === 2 ? (
          // Dual Items: Grid with exactly two centered columns so they layout nicely without huge blank spaces
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(280px, 1fr))',
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
    </main>
  );
}
