import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useSyncExternalStore } from 'react';

// Track the latest database sync promise to prevent race conditions in Gmail sharing
let lastSyncPromise: Promise<any> = Promise.resolve();
export function getLastSyncPromise() {
  return lastSyncPromise;
}
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
  privateEventTypes as initialPrivateEventTypes,
  HomepageData,
  initialHomepageData
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
  image?: string | null;
  size?: 'small' | 'medium' | 'large';
  isAdditive?: boolean;
  type?: string;
  value?: number;
}

export interface User {
  name: string;
  email: string;
  phone?: string;
  membershipStatus: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  tierPoints: number;
  isAdmin?: boolean;
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
  paymentMethod: 'upi' | 'cod' | 'card_on_delivery' | 'pay_later';
  upiTxnId?: string;
  paymentStatus: 'unpaid' | 'pending_verification' | 'paid';
  createdAt: string;
  adminPlaced?: boolean;
  receiptPhoto?: string;
  discount?: number;
  tax?: number;
  cashier?: string;
}

export interface BillAdditive {
  id: string;
  name: string;
  type: 'percentage' | 'flat';
  value: number;
}

export interface TableOrder {
  tableNumber: string;
  items: (CartItem & { notes?: string })[];
  customerName: string;
  covers: number;
  status: 'open' | 'billed' | 'paid';
  openedAt: string;
  additives?: BillAdditive[];
  orderId?: string;
  isDbOrder?: boolean;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod?: 'upi' | 'cod' | 'card_on_delivery' | 'pay_later';
  customerAlert?: string;
}

// ── Store 1: Dynamic Customer/Transaction Store ──
export interface RestaurantState {
  user: User | null;
  login: (email: string, name?: string, phone?: string, isAdmin?: boolean) => void;
  logout: () => void;

  cart: {
    items: CartItem[];
    type: 'pickup' | 'delivery' | 'dine-in';
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
  setOrderType: (type: 'pickup' | 'delivery' | 'dine-in') => void;
  setDeliveryAddress: (address: RestaurantState['cart']['address']) => void;

  reservations: Reservation[];
  addReservation: (res: Omit<Reservation, 'id' | 'status' | 'createdAt'>) => string;
  cancelReservation: (id: string) => void;

  orders: Order[];
  setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
  placeOrder: (paymentMethod?: Order['paymentMethod'], upiTxnId?: string, customSettings?: { type: Order['type']; tableNumber?: string; customerName?: string; customerPhone?: string; customerEmail?: string; adminPlaced?: boolean; receiptPhoto?: string; paymentStatus?: Order['paymentStatus']; status?: Order['status']; discount?: number; tax?: number; cashier?: string }) => string;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  updateOrder: (id: string, status: Order['status']) => void;
  updateOrderPaymentStatus: (id: string, status: Order['paymentStatus']) => void;
  clearOrders: () => void;

  tableOrders: TableOrder[];
  setTableOrders: (orders: TableOrder[] | ((prev: TableOrder[]) => TableOrder[]), skipBroadcast?: boolean) => void;

  activeOrderId: string | null;
  setActiveOrderId: (id: string | null) => void;
  modifyOrderItems: (orderId: string, items: CartItem[], changeType: 'add' | 'delete') => void;
  lockOrder: (orderId: string) => void;
}

export const useRestaurantStore = create<RestaurantState>()(
  persist(
    (set, get) => ({
      user: null,
      login: (email, name = 'Valued Guest', phone, isAdmin = false) => {
        set({
          user: {
            name: isAdmin ? 'Maître d\' London' : name,
            email,
            phone,
            membershipStatus: isAdmin ? 'Platinum' : 'Gold',
            tierPoints: isAdmin ? 9999 : 320,
            isAdmin,
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
          const cartItemId = item.size ? `${item.id}-${item.size}` : item.id;
          const existing = state.cart.items.find((i) => i.id === cartItemId);
          let newItems;
          if (existing) {
            newItems = state.cart.items.map((i) =>
              i.id === cartItemId ? { ...i, qty: i.qty + 1 } : i
            );
          } else {
            newItems = [...state.cart.items, { ...item, id: cartItemId, qty: 1 }];
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

        // Log action to DB
        try {
          const user = get().user;
          fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'ADD_RESERVATION',
              details: `Added new reservation ID: ${id} for ${res.name} (guests: ${res.guests}) on ${res.date} at ${res.time}.`,
              adminEmail: user?.email || 'unknown@thelondon.co.uk',
            }),
          }).catch(() => {});
        } catch (e) {
          console.warn('Failed to log reservation addition:', e);
        }

        return id;
      },
      cancelReservation: (id) => {
        set((state) => ({
          reservations: state.reservations.map((r) =>
            r.id === id ? { ...r, status: 'cancelled' as const } : r
          ),
        }));

        // Log action to DB
        try {
          const user = get().user;
          const res = get().reservations.find((r) => r.id === id);
          if (res) {
            fetch('/api/admin/logs', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                action: 'CANCEL_RESERVATION',
                details: `Cancelled reservation ID: ${id} for ${res.name} on ${res.date} at ${res.time}.`,
                adminEmail: user?.email || 'unknown@thelondon.co.uk',
              }),
            }).catch(() => {});
          }
        } catch (e) {
          console.warn('Failed to log reservation cancellation:', e);
        }
      },

      orders: [],
      placeOrder: (paymentMethod = 'cod', upiTxnId = '', customSettings) => {
        // Generate DDMMY### format order ID
        const now = new Date();
        const dd = String(now.getDate()).padStart(2, '0');
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const y = String(now.getFullYear()).slice(-1); // last digit of year
        const prefix = `${dd}${mm}${y}`;

        // Find the next sequence number for today
        const todaysOrders = get().orders.filter(o => o.id.startsWith(prefix));
        let nextSeq = 1;
        if (todaysOrders.length > 0) {
          const seqs = todaysOrders.map(o => parseInt(o.id.slice(5), 10)).filter(n => !isNaN(n));
          nextSeq = (seqs.length > 0 ? Math.max(...seqs) : 0) + 1;
        }
        if (nextSeq > 999) nextSeq = 999; // cap at 999
        const id = `${prefix}${String(nextSeq).padStart(3, '0')}`;
        const items = get().cart.items;
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        const deliveryFee = 0;
        const total = subtotal;

        const currentAdminEmail = get().user?.email;
        const isAdminSession = !!(get().user?.isAdmin);
        const isPlacedByAdmin = !!(customSettings?.adminPlaced || isAdminSession);

        let customerNameVal = customSettings?.customerName !== undefined 
          ? customSettings.customerName 
          : (isPlacedByAdmin ? '' : (get().cart.address.name || 'Guest'));

        if (!customerNameVal || customerNameVal.trim() === '') {
          if (customSettings?.type === 'dine-in' && customSettings.tableNumber) {
            customerNameVal = `Guest (${customSettings.tableNumber})`;
          } else if (isPlacedByAdmin) {
            customerNameVal = 'Walk-in Customer';
          } else {
            customerNameVal = 'Guest';
          }
        }
        const customerPhoneVal = customSettings?.customerPhone !== undefined
          ? customSettings.customerPhone
          : (isPlacedByAdmin ? '' : (get().cart.address.phone || 'N/A'));
        const customerEmailVal = customSettings?.customerEmail !== undefined
          ? customSettings.customerEmail
          : (isPlacedByAdmin ? '' : (get().cart.address.email || 'N/A'));

        const newOrder: Order = {
          id,
          items,
          total,
          type: customSettings?.type || get().cart.type,
          customerName: customerNameVal,
          tableNumber: customSettings?.tableNumber,
          address: {
            name: customerNameVal,
            phone: customerPhoneVal,
            email: customerEmailVal,
            flat: isPlacedByAdmin ? 'ADMIN_PLACED' : (get().cart.address.flat || ''),
            street: get().cart.address.street || '',
            city: get().cart.address.city || '',
          },
          status: customSettings?.status || 'confirmed',
          paymentMethod,
          upiTxnId,
          paymentStatus: customSettings?.paymentStatus || (paymentMethod === 'upi' ? 'pending_verification' : 'unpaid'),
          createdAt: new Date().toISOString(),
          adminPlaced: isPlacedByAdmin,
          receiptPhoto: customSettings?.receiptPhoto,
          discount: customSettings?.discount || 0,
          tax: customSettings?.tax || 0,
          cashier: customSettings?.cashier || (isPlacedByAdmin ? (currentAdminEmail || 'Counter Staff') : 'Online'),
        };

        let updatedTableOrders = [...get().tableOrders];
        if (newOrder.type === 'dine-in' && newOrder.tableNumber && !customSettings?.adminPlaced) {
          const tableNum = newOrder.tableNumber;
          const existingIndex = updatedTableOrders.findIndex(t => t.tableNumber === tableNum);
          const customerName = newOrder.customerName || `Guest (${tableNum})`;
          
          if (existingIndex !== -1) {
            const existingTable = updatedTableOrders[existingIndex];
            const mergedItems = [...existingTable.items];
            newOrder.items.forEach(newItem => {
              const itemIndex = mergedItems.findIndex(i => i.id === newItem.id);
              if (itemIndex !== -1) {
                mergedItems[itemIndex] = {
                  ...mergedItems[itemIndex],
                  qty: mergedItems[itemIndex].qty + newItem.qty
                };
              } else {
                mergedItems.push({ ...newItem });
              }
            });
            updatedTableOrders = updatedTableOrders.map((t, idx) => 
              idx === existingIndex 
                ? { ...t, items: mergedItems, customerName: t.customerName || customerName, status: 'open' as const, paymentMethod: t.paymentMethod || newOrder.paymentMethod }
                : t
            );
          } else {
            const newTableOrder: TableOrder = {
              tableNumber: tableNum,
              items: newOrder.items.map(item => ({ ...item })),
              customerName,
              covers: 2,
              status: 'open',
              openedAt: newOrder.createdAt,
              orderId: newOrder.id,
              customerPhone: newOrder.address.phone,
              customerEmail: newOrder.address.email,
              paymentMethod: newOrder.paymentMethod,
              additives: [
                { id: 'default-gst', name: 'GST (5%)', type: 'percentage', value: 5 }
              ]
            };
            updatedTableOrders = [...updatedTableOrders, newTableOrder];
          }
        }

        // Background HTTP POST to sync order with backend database and trigger Pusher socket
        lastSyncPromise = fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder),
        })
          .then((res) => {
            if (!res.ok) {
              console.warn('Sync failed:', res.statusText);
              throw new Error(`Server returned ${res.status} ${res.statusText}`);
            }
            return res;
          })
          .catch(err => {
            console.warn('Failed to sync order via API:', err);
            throw err;
          });

        set((state) => ({
          orders: [newOrder, ...state.orders],
          tableOrders: updatedTableOrders,
        }));

        // Broadcast updated table orders to all SSE subscribers (admin/manager/owner)
        if (typeof window !== 'undefined' && newOrder.type === 'dine-in') {
          fetch('/api/table-orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedTableOrders),
          }).catch(() => {/* silent */});
        }

        // Log action to DB
        try {
          const user = get().user;
          const actor = user ? `Admin (${user.name})` : `Customer (${newOrder.address.name})`;
          fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'PLACE_ORDER',
              details: `Placed new order ${id} (${newOrder.type}) via ${newOrder.paymentMethod}. Total: ₹${newOrder.total}. Actor: ${actor}`,
              adminEmail: user?.email || newOrder.address.email || 'customer@thelondon.co.uk',
            }),
          }).catch(() => {});
        } catch (e) {
          console.warn('Failed to log order placement:', e);
        }

        get().clearCart();
        return id;
      },
      setOrders: (orders) => {
        set((state) => ({
          orders: typeof orders === 'function' ? orders(state.orders) : orders,
        }));
      },
      updateOrderStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
        fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id, status }),
        }).catch(err => console.warn('Failed to sync status update:', err));

        // Log order status change
        try {
          const user = get().user;
          fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'UPDATE_ORDER_STATUS',
              details: `Updated order ${id} status to "${status}".`,
              adminEmail: user?.email || 'unknown@thelondon.co.uk',
            }),
          }).catch(() => {});
        } catch (e) {
          console.warn('Failed to log order status change:', e);
        }
      },
      updateOrder: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        }));
        fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id, status }),
        }).catch(err => console.warn('Failed to sync status update:', err));

        // Log order status change
        try {
          const user = get().user;
          fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'UPDATE_ORDER_STATUS',
              details: `Updated order ${id} status to "${status}".`,
              adminEmail: user?.email || 'unknown@thelondon.co.uk',
            }),
          }).catch(() => {});
        } catch (e) {
          console.warn('Failed to log order status change:', e);
        }
      },
      updateOrderPaymentStatus: (id, status) => {
        set((state) => ({
          orders: state.orders.map((o) => (o.id === id ? { ...o, paymentStatus: status } : o)),
        }));
        fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: id, paymentStatus: status }),
        }).catch(err => console.warn('Failed to sync payment status update:', err));

        // Log order payment status change
        try {
          const user = get().user;
          fetch('/api/admin/logs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'UPDATE_ORDER_PAYMENT',
              details: `Updated order ${id} payment status to "${status}".`,
              adminEmail: user?.email || 'unknown@thelondon.co.uk',
            }),
          }).catch(() => {});
        } catch (e) {
          console.warn('Failed to log order payment status change:', e);
        }
      },
      clearOrders: () => {
        set({ 
          orders: [],
          tableOrders: [],
          activeOrderId: null,
        });
      },

      tableOrders: [],
      setTableOrders: (orders, skipBroadcast = false) => {
        set((state) => {
          const next = typeof orders === 'function' ? orders(state.tableOrders) : orders;
          // Broadcast to all connected SSE clients (admin/manager/owner screens)
          if (!skipBroadcast && typeof window !== 'undefined') {
            fetch('/api/table-orders', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(next),
            }).catch(() => {/* silent */});
          }
          return { tableOrders: next };
        });
      },

      activeOrderId: null,
      setActiveOrderId: (id) => {
        set({ activeOrderId: id });
      },

      modifyOrderItems: (orderId, items, changeType) => {
        const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
        
        set((state) => {
          // 1. Update the order in state.orders
          const updatedOrders = state.orders.map((o) => {
            if (o.id === orderId) {
              const deliveryFee = 0;
              return {
                ...o,
                items,
                total: subtotal,
              };
            }
            return o;
          });

          // 2. Update the corresponding table order in state.tableOrders
          const updatedTableOrders = state.tableOrders.map((to) => {
            if (to.orderId === orderId) {
              const alertMsg = changeType === 'add' ? 'Dish added by customer' : 'Dish deleted by customer';
              return {
                ...to,
                items: items.map(i => ({ ...i })),
                customerAlert: alertMsg,
              };
            }
            return to;
          });

          // Broadcast update to other devices
          if (typeof window !== 'undefined') {
            fetch('/api/table-orders', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedTableOrders),
            }).catch(() => {/* silent */});
          }

          return {
            orders: updatedOrders,
            tableOrders: updatedTableOrders,
          };
        });
      },
      lockOrder: (orderId) => {
        set((state) => {
          const lockedTime = new Date(Date.now() - 120 * 1000).toISOString();
          
          const updatedOrders = state.orders.map((o) => {
            if (o.id === orderId) {
              return {
                ...o,
                createdAt: lockedTime,
              };
            }
            return o;
          });

          const updatedTableOrders = state.tableOrders.map((to) => {
            if (to.orderId === orderId) {
              return {
                ...to,
                openedAt: lockedTime,
              };
            }
            return to;
          });

          // Broadcast update to other devices
          if (typeof window !== 'undefined') {
            fetch('/api/table-orders', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedTableOrders),
            }).catch(() => {/* silent */});
          }

          return {
            orders: updatedOrders,
            tableOrders: updatedTableOrders,
          };
        });
      },
    }),
    {
      name: 'thelondon-restaurant-store',
    }
  )
);

export type TableStatus = 'available' | 'occupied' | 'reserved' | 'cleaning';

export interface FloorTable {
  id: string;
  number: number;
  seats: number;
  status: TableStatus;
  guestName?: string;
  since?: string;
}

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
  maintenanceMode: boolean;
  setMaintenanceMode: (val: boolean) => void;

  acceptingOrders: boolean;
  setAcceptingOrders: (val: boolean) => void;
  requireReceiptPhoto: boolean;
  setRequireReceiptPhoto: (val: boolean) => void;
  newArrivalsDaysThreshold: number;
  setNewArrivalsDaysThreshold: (val: number) => void;
  loadSystemSettings: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadMenuItems: () => Promise<void>;

  homepageData: HomepageData;
  updateHomepageData: (data: Partial<HomepageData>) => void;

  tables: FloorTable[];
  addTable: (seats: number) => void;
  deleteTable: (id: string) => void;
  updateTableStatus: (id: string, status: TableStatus) => void;
  updateTableSeats: (id: string, seats: number) => void;
  resetTables: () => void;
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
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          menuItems: [...state.menuItems, newItem],
        }));
        fetch('/api/menu-items', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: newItem.id,
            name: newItem.name,
            description: newItem.description,
            price: newItem.price,
            category: newItem.category,
            image: newItem.image,
            active: newItem.active,
          }),
        }).catch((err) => console.warn('Failed to save menu item to DB:', err));
      },
      deleteMenuItem: (id) => {
        set((state) => ({
          menuItems: state.menuItems.filter((i) => i.id !== id),
        }));
        fetch(`/api/menu-items/${id}`, {
          method: 'DELETE',
        }).catch((err) => console.warn('Failed to delete menu item from DB:', err));
      },
      updateMenuItem: (id, updated) => {
        set((state) => ({
          menuItems: state.menuItems.map((item) =>
            item.id === id ? { ...item, ...updated } : item
          ),
        }));
        fetch(`/api/menu-items/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch((err) => console.warn('Failed to update menu item in DB:', err));
      },

      menuCategories: initialMenuCategories,
      addMenuCategory: (category) => {
        set((state) => ({
          menuCategories: [...state.menuCategories, category],
        }));
        fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(category),
        }).catch((err) => console.warn('Failed to save category to DB:', err));
      },
      deleteMenuCategory: (id) => {
        set((state) => ({
          menuCategories: state.menuCategories.filter((c) => c.id !== id),
        }));
        fetch(`/api/categories/${id}`, {
          method: 'DELETE',
        }).catch((err) => console.warn('Failed to delete category from DB:', err));
      },
      updateMenuCategory: (id, updated) => {
        set((state) => ({
          menuCategories: state.menuCategories.map((c) =>
            c.id === id ? { ...c, ...updated } : c
          ),
        }));
        fetch(`/api/categories/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        }).catch((err) => console.warn('Failed to update category in DB:', err));
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

      maintenanceMode: false,
      setMaintenanceMode: (val) => {
        set({ maintenanceMode: val });
        // Set cookie synchronously for middleware check
        document.cookie = `tls_maintenance=${val}; path=/; max-age=31536000; SameSite=Lax`;
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'maintenanceMode', value: String(val) }),
        }).catch((err) => console.warn('Failed to sync maintenanceMode:', err));
      },

      acceptingOrders: true,
      setAcceptingOrders: (val) => {
        set({ acceptingOrders: val });
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'acceptingOrders', value: String(val) }),
        }).catch((err) => console.warn('Failed to sync acceptingOrders:', err));
      },

      requireReceiptPhoto: true,
      setRequireReceiptPhoto: (val) => {
        set({ requireReceiptPhoto: val });
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'requireReceiptPhoto', value: String(val) }),
        }).catch((err) => console.warn('Failed to sync requireReceiptPhoto:', err));
      },

      newArrivalsDaysThreshold: 10,
      setNewArrivalsDaysThreshold: (val) => {
        set({ newArrivalsDaysThreshold: val });
        fetch('/api/admin/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'newArrivalsDaysThreshold', value: String(val) }),
        }).catch((err) => console.warn('Failed to sync newArrivalsDaysThreshold:', err));
      },

      loadSystemSettings: async () => {
        try {
          const res = await fetch(`/api/admin/settings?t=${Date.now()}`, { cache: 'no-store' });
          const data = await res.json();
          if (data.success && data.settings) {
            set({
              maintenanceMode: data.settings.maintenanceMode,
              acceptingOrders: data.settings.acceptingOrders,
              requireReceiptPhoto: data.settings.requireReceiptPhoto !== false,
              newArrivalsDaysThreshold: data.settings.newArrivalsDaysThreshold ? parseInt(data.settings.newArrivalsDaysThreshold, 10) : 10,
            });
            document.cookie = `tls_maintenance=${data.settings.maintenanceMode}; path=/; max-age=31536000; SameSite=Lax`;
          }
        } catch (e) {
          console.warn('Failed to load system settings:', e);
        }
      },

      loadCategories: async () => {
        try {
          const res = await fetch(`/api/categories?t=${Date.now()}`, { cache: 'no-store' });
          const data = await res.json();
          if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
            set({
              menuCategories: data.categories.map((c: any) => ({
                id: c.id,
                label: c.label || c.name || c.id,
                icon: c.icon || '◆',
                desc: c.desc || '',
                bannerImage: c.bannerImage || null,
                gutterImageLeftTop: c.gutterImageLeftTop || null,
                gutterImageLeftBottom: c.gutterImageLeftBottom || null,
                gutterImageRightTop: c.gutterImageRightTop || null,
                gutterImageRightBottom: c.gutterImageRightBottom || null,
              })),
            });
          }
        } catch (e) {
          console.warn('Failed to load menu categories from DB:', e);
        }
      },

      loadMenuItems: async () => {
        try {
          const res = await fetch(`/api/menu-items?t=${Date.now()}`, { cache: 'no-store' });
          const data = await res.json();
          if (data.success && Array.isArray(data.items) && data.items.length > 0) {
            set((state) => {
              const dbMap = new Map<string, any>(data.items.map((i: any) => [i.id, i]));
              const merged = state.menuItems.map((item) => {
                const dbItem = dbMap.get(item.id);
                if (dbItem) {
                  dbMap.delete(item.id);
                  return {
                    ...item,
                    name: dbItem.name,
                    description: dbItem.description,
                    price: dbItem.price,
                    category: dbItem.category,
                    image: dbItem.imageUrl || item.image || null,
                    active: dbItem.active !== undefined ? dbItem.active : item.active,
                  };
                }
                return item;
              });

              dbMap.forEach((dbItem: any) => {
                merged.push({
                  id: dbItem.id,
                  category: dbItem.category,
                  course: dbItem.category,
                  name: dbItem.name,
                  description: dbItem.description,
                  price: dbItem.price,
                  dietary: ['v'],
                  allergens: [],
                  gradient: 'food-photo-dinner',
                  image: dbItem.imageUrl || null,
                  active: dbItem.active,
                  createdAt: dbItem.createdAt,
                  updatedAt: dbItem.updatedAt,
                });
              });

              return { menuItems: merged };
            });
          }
        } catch (e) {
          console.warn('Failed to load menu items from DB:', e);
        }
      },

      homepageData: initialHomepageData,
      updateHomepageData: (data) => set((state) => ({ homepageData: { ...state.homepageData, ...data } })),

      tables: [
        { id: 't1',  number: 1,  seats: 2, status: 'available' },
        { id: 't2',  number: 2,  seats: 4, status: 'available' },
        { id: 't3',  number: 3,  seats: 4, status: 'available' },
        { id: 't4',  number: 4,  seats: 6, status: 'available' },
        { id: 't5',  number: 5,  seats: 2, status: 'available' },
        { id: 't6',  number: 6,  seats: 4, status: 'available' },
        { id: 't7',  number: 7,  seats: 2, status: 'available' },
        { id: 't8',  number: 8,  seats: 8, status: 'available' },
        { id: 't9',  number: 9,  seats: 4, status: 'available' },
        { id: 't10', number: 10, seats: 2, status: 'available' },
        { id: 't11', number: 11, seats: 4, status: 'available' },
        { id: 't12', number: 12, seats: 6, status: 'available' },
      ],
      addTable: (seats) => {
        set((state) => {
          const maxNum = state.tables.reduce((max, t) => t.number > max ? t.number : max, 0);
          const newTable: FloorTable = {
            id: 't-' + Math.random().toString(36).substring(2, 8),
            number: maxNum + 1,
            seats,
            status: 'available'
          };
          return { tables: [...state.tables, newTable] };
        });
      },
      deleteTable: (id) => {
        set((state) => ({
          tables: state.tables.filter((t) => t.id !== id)
        }));
      },
      updateTableStatus: (id, status) => {
        set((state) => ({
          tables: state.tables.map((t) => t.id === id ? { ...t, status } : t)
        }));
      },
      updateTableSeats: (id, seats) => {
        set((state) => ({
          tables: state.tables.map((t) => t.id === id ? { ...t, seats } : t)
        }));
      },
      resetTables: () => {
        set({
          tables: [
            { id: 't1',  number: 1,  seats: 2, status: 'available' },
            { id: 't2',  number: 2,  seats: 4, status: 'available' },
            { id: 't3',  number: 3,  seats: 4, status: 'available' },
            { id: 't4',  number: 4,  seats: 6, status: 'available' },
            { id: 't5',  number: 5,  seats: 2, status: 'available' },
            { id: 't6',  number: 6,  seats: 4, status: 'available' },
            { id: 't7',  number: 7,  seats: 2, status: 'available' },
            { id: 't8',  number: 8,  seats: 8, status: 'available' },
            { id: 't9',  number: 9,  seats: 4, status: 'available' },
            { id: 't10', number: 10, seats: 2, status: 'available' },
            { id: 't11', number: 11, seats: 4, status: 'available' },
            { id: 't12', number: 12, seats: 6, status: 'available' },
          ]
        });
      },
    }),
    {
      name: 'thelondon-cms-store',
    }
  )
);

const emptySubscribe = () => () => {};

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
