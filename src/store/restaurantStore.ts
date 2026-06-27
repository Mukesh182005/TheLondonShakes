import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  MenuItem, 
  MenuCategory,
  UpcomingEvent,
  PrivateEventType,
  menuItems as initialMenuItems,
  restaurantInfo as initialRestaurantInfo,
  chef as initialChef,
  upcomingEvents as initialUpcomingEvents,
  menuCategories as initialMenuCategories,
  privateEventTypes as initialPrivateEventTypes
} from '../data/restaurantData';

export interface GalleryItem {
  id: string;
  category: 'food' | 'interior' | 'kitchen' | 'events' | 'team';
  title: string;
  desc: string;
  gradient: string;
  image: string | null; // base64 data URL
}

const initialGalleryItems: GalleryItem[] = [
  { id: 'g1', category: 'food',     title: 'Strawberry Monster Shake',     desc: 'Our signature thick shake bursting with fresh strawberry flavour.',             gradient: 'linear-gradient(135deg, #1f090d, #381219, #1f090d)', image: null },
  { id: 'g2', category: 'interior', title: 'The London Shakes Lounge',      desc: 'Premium ambience with warm lighting and cozy seating for all occasions.',     gradient: 'linear-gradient(135deg, #161616, #2d2a26, #161616)', image: null },
  { id: 'g3', category: 'food',     title: 'KitKat Shake',                 desc: 'Decadent milkshake loaded with KitKat chunks and whipped cream.',             gradient: 'linear-gradient(135deg, #120c08, #2a1b10, #120c08)', image: null },
  { id: 'g4', category: 'food',     title: 'Ice Cream Waffle',             desc: 'Freshly baked bubble waffles served with a generous scoop of ice cream.',     gradient: 'linear-gradient(135deg, #1c180d, #2e2417, #1c180d)', image: null },
  { id: 'g5', category: 'events',   title: 'Birthday Celebration',         desc: 'The perfect venue for birthdays, anniversaries, and special moments.',        gradient: 'linear-gradient(135deg, #0e121a, #1a2336, #0e121a)', image: null },
  { id: 'g6', category: 'food',     title: 'Loaded Cheese Burger',         desc: 'Double patty, loaded cheese, fresh lettuce — the ultimate bite.',            gradient: 'linear-gradient(135deg, #1c0a0c, #301416, #1c0a0c)', image: null },
  { id: 'g7', category: 'kitchen',  title: 'Shake Crafting Station',       desc: 'Where our team crafts each shake with care and premium ingredients.',         gradient: 'linear-gradient(135deg, #1f0f08, #361b0c, #1f0f08)', image: null },
  { id: 'g8', category: 'food',     title: 'White Sauce Pasta',            desc: 'Creamy Italian-style pasta loaded with herbs and fresh vegetables.',          gradient: 'linear-gradient(135deg, #080512, #130a21, #080512)', image: null },
  { id: 'g9', category: 'interior', title: 'Window Seating Area',          desc: 'Bright and cozy corner seats perfect for relaxed conversations.',             gradient: 'linear-gradient(135deg, #0d0d0d, #1a1a1a, #0d0d0d)', image: null },
];

export interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  gradient: string;
}

export interface User {
  name: string;
  email: string;
  membershipStatus: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tierPoints: number;
}

export interface Reservation {
  id: string;
  name: string;
  phone: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  occasion: string;
  requests: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  type: 'pickup' | 'delivery' | 'dine-in';
  customerName?: string;
  tableNumber?: string;
  address: {
    name: string;
    phone: string;
    email: string;
    flat: string;
    street: string;
    city: string;
  };
  status: 'confirmed' | 'preparing' | 'out for delivery' | 'delivered' | 'cancelled';
  paymentMethod: 'upi' | 'cod' | 'card_on_delivery';
  upiTxnId?: string;
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
  createdAt: string;
}

// ── Store 1: Dynamic Customer/Transaction Store ──
export interface RestaurantState {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;

  cart: {
    items: CartItem[];
    type: 'pickup' | 'delivery';
    address: {
      name: string;
      phone: string;
      email: string;
      flat: string;
      street: string;
      city: string;
    };
  };
  addToCart: (item: Omit<CartItem, 'qty'>) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  setOrderType: (type: 'pickup' | 'delivery') => void;
  setDeliveryAddress: (address: RestaurantState['cart']['address']) => void;

  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id' | 'status' | 'createdAt'>) => string;
  cancelReservation: (id: string) => void;

  orders: Order[];
  placeOrder: (paymentMethod?: Order['paymentMethod'], upiTxnId?: string, customSettings?: { type: Order['type']; tableNumber?: string; customerName?: string }) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrder: (id: string, status: Order['status']) => void;
  updateOrderPaymentStatus: (id: string, status: Order['paymentStatus']) => void;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (email, name = 'Valued Guest') => {
        const isDefaultAdmin = email === 'admin@thelondon.co.uk';
        set({
          user: {
            name: isDefaultAdmin ? 'Maître d\' London' : name,
            email,
            membershipStatus: isDefaultAdmin ? 'Platinum' : 'Gold',
            tierPoints: isDefaultAdmin ? 9999 : 320,
          },
        });
      },
      logout: () => set({ user: null }),

      cart: {
        items: [],
        type: 'pickup',
        address: {
          name: '',
          phone: '',
          email: '',
          flat: '',
          street: '',
          city: '',
        },
      },
      addToCart: (item) => {
        set((state) => {
          const existing = state.cart.items.find((i) => i.id === item.id);
          let newItems;
          if (existing) {
            newItems = state.cart.items.map((i) =>
              i.id === item.id ? { ...i, qty: i.qty + 1 } : i
            );
          } else {
            newItems = [...state.cart.items, { ...item, qty: 1 }];
          }
          return { cart: { ...state.cart, items: newItems } };
        });
      },
      removeFromCart: (id) => {
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.filter((i) => i.id !== id),
          },
        }));
      },
      updateQty: (id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(id);
          return;
        }
        set((state) => ({
          cart: {
            ...state.cart,
            items: state.cart.items.map((i) => (i.id === id ? { ...i, qty } : i)),
          },
        }));
      },
      clearCart: () => {
        set((state) => ({
          cart: {
            ...state.cart,
            items: [],
          },
        }));
      },
      setOrderType: (type) => {
        set((state) => ({
          cart: { ...state.cart, type },
        }));
      },
      setDeliveryAddress: (address) => {
        set((state) => ({
          cart: { ...state.cart, address },
        }));
      },

      reservations: [],
      addReservation: (res) => {
        const id = 'RES-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const newRes: Reservation = {
          ...res,
          id,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          reservations: [newRes, ...state.reservations],
        }));
        return id;
      },
      cancelReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' as const } : r
          ),
        }));
      },

      orders: [],
      placeOrder: (paymentMethod = 'cod', upiTxnId = '', customSettings) => {
        const id = 'ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        const items = get().cart.items;
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const deliveryFee = customSettings?.type === 'dine-in' ? 0 : (get().cart.type === 'delivery' ? 30 : 0);
        const total = subtotal + deliveryFee;
        const newOrder: Order = {
          id,
          items,
          total,
          type: customSettings?.type || get().cart.type,
          customerName: customSettings?.customerName || get().cart.address.name || 'Guest',
          tableNumber: customSettings?.tableNumber,
          address: get().cart.address,
          status: 'confirmed',
          paymentMethod,
          upiTxnId,
          paymentStatus: paymentMethod === 'upi' ? 'pending_verification' : 'unpaid',
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
        }));
        get().clearCart();
        return id;
      },
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
      },
      updateOrder: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
      },
      updateOrderPaymentStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, paymentStatus: status } : o)),
        }));
      },
    }),
    {
      name: 'thelondon-restaurant-store',
    }
  )
);

// ── Store 2: Administrative/CMS Store ──
export interface CMSState {
  menuItems: MenuItem[];
  addMenuItem: (item: Omit<MenuItem, 'id' | 'gradient'> & { gradient?: string; image?: string | null }) => void;
  deleteMenuItem: (id: string) => void;
  updateMenuItem: (id: string, updated: Partial<MenuItem>) => void;

  menuCategories: MenuCategory[];
  addMenuCategory: (category: MenuCategory) => void;
  deleteMenuCategory: (id: string) => void;
  updateMenuCategory: (id: string, updated: Partial<MenuCategory>) => void;

  upcomingEvents: UpcomingEvent[];
  addUpcomingEvent: (event: Omit<UpcomingEvent, 'id' | 'gradient'> & { gradient?: string; image?: string | null }) => void;
  deleteUpcomingEvent: (id: string) => void;
  updateUpcomingEvent: (id: string, updated: Partial<UpcomingEvent>) => void;

  privateEventTypes: PrivateEventType[];
  addPrivateEventType: (event: Omit<PrivateEventType, 'id'>) => void;
  deletePrivateEventType: (id: string) => void;
  updatePrivateEventType: (id: string, updated: Partial<PrivateEventType>) => void;

  restaurantInfo: typeof initialRestaurantInfo;
  chef: typeof initialChef;
  updateRestaurantInfo: (info: Partial<typeof initialRestaurantInfo>) => void;
  updateChefInfo: (chef: Partial<typeof initialChef>) => void;
  updateUpcomingEvents: (events: typeof initialUpcomingEvents) => void;

  galleryItems: GalleryItem[];
  addGalleryItem: (item: Omit<GalleryItem, 'id'>) => void;
  updateGalleryItem: (id: string, updated: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  reorderGalleryItems: (items: GalleryItem[]) => void;
}

export const useCMSStore = create<CMSState>()(
  persist(
    (set) => ({
      menuItems: initialMenuItems,
      addMenuItem: (item) => {
        const id = 'custom-' + Math.random().toString(36).substring(2, 8);
        const newItem: MenuItem = {
          ...item,
          id,
          gradient: item.gradient || 'food-photo-dinner',
          image: item.image || null,
        };
        set((state) => ({
          menuItems: [...state.menuItems, newItem],
        }));
      },
      deleteMenuItem: (id) => {
        set((state) => ({
          menuItems: state.menuItems.filter((i) => i.id !== id),
        }));
      },
      updateMenuItem: (id, updated) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updated } : item
          ),
        }));
      },

      menuCategories: initialMenuCategories,
      addMenuCategory: (category) => {
        set((state) => ({
          menuCategories: [...state.menuCategories, category],
        }));
      },
      deleteMenuCategory: (id) => {
        set((state) => ({
          menuCategories: state.menuCategories.filter((c) => c.id !== id),
        }));
      },
      updateMenuCategory: (id, updated) => {
        set((state) => ({
          menuCategories: state.menuCategories.map((c) =>
            c.id === id ? { ...c, ...updated } : c
          ),
        }));
      },

      upcomingEvents: initialUpcomingEvents,
      addUpcomingEvent: (event) => {
        const id = 'event-' + Math.random().toString(36).substring(2, 8);
        const newEvent: UpcomingEvent = {
          ...event,
          id,
          gradient: event.gradient || 'linear-gradient(135deg, #0e0514, #190924, #0e0514)',
          image: event.image || null,
        };
        set((state) => ({
          upcomingEvents: [...state.upcomingEvents, newEvent],
        }));
      },
      deleteUpcomingEvent: (id) => {
        set((state) => ({
          upcomingEvents: state.upcomingEvents.filter((e) => e.id !== id),
        }));
      },
      updateUpcomingEvent: (id, updated) => {
        set((state) => ({
          upcomingEvents: state.upcomingEvents.map((e) =>
            e.id === id ? { ...e, ...updated } : e
          ),
        }));
      },

      privateEventTypes: initialPrivateEventTypes,
      addPrivateEventType: (event) => {
        const id = 'private-' + Math.random().toString(36).substring(2, 8);
        const newEvent: PrivateEventType = {
          ...event,
          id,
          rooms: event.rooms || [],
          includes: event.includes || [],
          image: event.image || null,
        };
        set((state) => ({
          privateEventTypes: [...state.privateEventTypes, newEvent],
        }));
      },
      deletePrivateEventType: (id) => {
        set((state) => ({
          privateEventTypes: state.privateEventTypes.filter((e) => e.id !== id),
        }));
      },
      updatePrivateEventType: (id, updated) => {
        set((state) => ({
          privateEventTypes: state.privateEventTypes.map((e) =>
            e.id === id ? { ...e, ...updated } : e
          ),
        }));
      },

      restaurantInfo: initialRestaurantInfo,
      chef: initialChef,
      updateRestaurantInfo: (info) => {
        set((state) => ({
          restaurantInfo: { ...state.restaurantInfo, ...info }
        }));
      },
      updateChefInfo: (chefInfo) => {
        set((state) => ({
          chef: { ...state.chef, ...chefInfo }
        }));
      },
      updateUpcomingEvents: (events) => {
        set({ upcomingEvents: events });
      },

      galleryItems: initialGalleryItems,
      addGalleryItem: (item) => {
        const id = 'gallery-' + Math.random().toString(36).substring(2, 8);
        set((state) => ({ galleryItems: [...state.galleryItems, { ...item, id }] }));
      },
      updateGalleryItem: (id, updated) => {
        set((state) => ({
          galleryItems: state.galleryItems.map((g) => g.id === id ? { ...g, ...updated } : g),
        }));
      },
      deleteGalleryItem: (id) => {
        set((state) => ({ galleryItems: state.galleryItems.filter((g) => g.id !== id) }));
      },
      reorderGalleryItems: (items) => set({ galleryItems: items }),
    }),
    {
      name: 'thelondon-cms-store',
    }
  )
);
