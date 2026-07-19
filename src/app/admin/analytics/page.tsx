'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRestaurantStore, useIsMounted } from '@/store/restaurantStore';
import { useCMSStore } from '@/store/restaurantStore';
import {
  BarChart2, TrendingUp, DollarSign, ShoppingBag, CreditCard, Clock,
  Utensils, Truck, Printer, FileText, Activity, User, ShieldAlert,
  Calendar, Search, ArrowUpDown, ChevronLeft, ChevronRight, Download,
  Brain, Sparkles, PieChart, Database, Percent, ShoppingCart, Users
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AuditLog {
  id: string;
  action: string;
  details: string;
  adminEmail: string;
  createdAt: string;
}

export default function AnalyticsPage() {
  const orders = useRestaurantStore((s) => s.orders);
  const setOrders = useRestaurantStore((s) => s.setOrders);
  const menuItems = useCMSStore((s) => s.menuItems);
  const user = useRestaurantStore((s) => s.user);
  const hydrated = useIsMounted();

  // Tab State: overview, sales, payments, products, customers, employees, forecast, reports
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'payments' | 'products' | 'customers' | 'employees' | 'forecast' | 'reports'>('overview');

  // Date Filter State
  const [timeRange, setTimeRange] = useState<'today' | 'yesterday' | 'week' | 'last7' | 'last30' | 'lastWeek' | 'month' | 'lastMonth' | 'year' | 'custom'>('all' as any);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Table Search / Sorting / Pagination States
  const [productSearch, setProductSearch] = useState('');
  const [productSortField, setProductSortField] = useState<'name' | 'qty' | 'revenue'>('qty');
  const [productSortAsc, setProductSortAsc] = useState(false);
  const [productPage, setProductPage] = useState(1);
  const productsPerPage = 8;

  const [customerSearch, setCustomerSearch] = useState('');
  const [customerSortField, setCustomerSortField] = useState<'name' | 'orders' | 'spent'>('spent');
  const [customerSortAsc, setCustomerSortAsc] = useState(false);
  const [customerPage, setCustomerPage] = useState(1);
  const customersPerPage = 8;

  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch orders from database on mount
  useEffect(() => {
    setLoading(true);
    fetch('/api/orders?all=true&t=' + Date.now(), { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrders(data);
        }
      })
      .catch((err) => console.warn('Failed to load orders for analytics:', err))
      .finally(() => setLoading(false));
  }, [setOrders]);

  useEffect(() => {
    if (hydrated && user) {
      const isOwner = user.email === (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || '');
      setIsSuperAdmin(isOwner);
    }
  }, [user, hydrated]);


  // ── Date Filters Calculations ──
  const now = new Date();
  const startOfDay = (d: Date) => { const r = new Date(d); r.setHours(0, 0, 0, 0); return r; };
  const endOfDay = (d: Date) => { const r = new Date(d); r.setHours(23, 59, 59, 999); return r; };

  const filterBounds = (() => {
    let start = new Date(0); // Epoch beginning
    let end = endOfDay(now);

    switch (timeRange) {
      case 'today':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'yesterday':
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        start = startOfDay(yest);
        end = endOfDay(yest);
        break;
      case 'week': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(now);
        mon.setDate(diff);
        start = startOfDay(mon);
        end = endOfDay(now);
        break;
      }
      case 'last7':
        const l7 = new Date(now);
        l7.setDate(l7.getDate() - 7);
        start = startOfDay(l7);
        end = endOfDay(now);
        break;
      case 'last30':
        const l30 = new Date(now);
        l30.setDate(l30.getDate() - 30);
        start = startOfDay(l30);
        end = endOfDay(now);
        break;
      case 'lastWeek': {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1) - 7;
        const mon = new Date(now);
        mon.setDate(diff);
        const sun = new Date(mon);
        sun.setDate(sun.getDate() + 6);
        start = startOfDay(mon);
        end = endOfDay(sun);
        break;
      }
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
        end = endOfDay(now);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'year':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        end = endOfDay(now);
        break;
      case 'custom':
        if (customFrom) start = startOfDay(new Date(customFrom));
        if (customTo) end = endOfDay(new Date(customTo));
        break;
    }
    return { start, end };
  })();

  // Filter valid (non-cancelled) and timeframe-specific orders
  const validOrders = orders.filter((o) => o.status !== 'cancelled');
  const filteredOrders = validOrders.filter((o) => {
    const oDate = new Date(o.createdAt);
    return oDate >= filterBounds.start && oDate <= filterBounds.end;
  });

  // Helper to map item to its correct category
  const getItemCategory = (itemId: string, itemName: string): string => {
    const matched = menuItems.find((m) => m.id === itemId || m.name.toLowerCase() === itemName.toLowerCase());
    return matched?.category || 'Drinks';
  };

  // ── Overview KPI Calculations ──
  const kpis = (() => {
    const totalRev = filteredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrdersCount = filteredOrders.length;
    const avgOrderVal = totalOrdersCount > 0 ? Math.round(totalRev / totalOrdersCount) : 0;

    let itemsCount = 0;
    let cashColl = 0;
    let upiColl = 0;
    let cardColl = 0;
    let totalTax = 0;
    let totalDisc = 0;

    filteredOrders.forEach((o) => {
      o.items.forEach((i) => { itemsCount += i.qty; });
      if (o.paymentMethod === 'cod') cashColl += o.total;
      else if (o.paymentMethod === 'upi') upiColl += o.total;
      else cardColl += o.total; // card_on_delivery

      totalTax += o.tax || 0;
      totalDisc += o.discount || 0;
    });

    const refunds = orders
      .filter((o) => o.status === 'cancelled' && new Date(o.createdAt) >= filterBounds.start && new Date(o.createdAt) <= filterBounds.end)
      .reduce((sum, o) => sum + o.total, 0);

    const expenses = totalRev * 0.45; // Mock expenses (45% for ingredients/overhead)
    const netProfit = totalRev - totalTax - refunds - expenses;

    // Today vs Yesterday revenue
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const yestStart = new Date(todayStart); yestStart.setDate(yestStart.getDate() - 1);
    const yestEnd = new Date(todayEnd); yestEnd.setDate(yestEnd.getDate() - 1);

    const todayRev = validOrders.filter(o => { const d = new Date(o.createdAt); return d >= todayStart && d <= todayEnd; }).reduce((s, o) => s + o.total, 0);
    const yestRev = validOrders.filter(o => { const d = new Date(o.createdAt); return d >= yestStart && d <= yestEnd; }).reduce((s, o) => s + o.total, 0);
    const growth = yestRev > 0 ? Math.round(((todayRev - yestRev) / yestRev) * 100) : 0;

    return {
      totalRevenue: totalRev,
      totalOrders: totalOrdersCount,
      avgOrderValue: avgOrderVal,
      totalItemsSold: itemsCount,
      cashCollection: cashColl,
      upiCollection: upiColl,
      cardCollection: cardColl,
      refundAmount: refunds,
      discountGiven: totalDisc,
      taxCollected: totalTax,
      netProfit: Math.round(netProfit > 0 ? netProfit : 0),
      grossRevenue: totalRev + totalDisc,
      todayRevenue: todayRev,
      yesterdayRevenue: yestRev,
      revenueGrowth: growth
    };
  })();

  // ── Daily Breakdown Calculations ──
  const dailyData = useMemo(() => {
    const daysMap: Record<string, { date: string; orders: number; revenue: number; items: number; cash: number; upi: number; itemQtys: Record<string, number> }> = {};
    
    filteredOrders.forEach((o) => {
      const dStr = o.createdAt.split('T')[0];
      if (!daysMap[dStr]) {
        daysMap[dStr] = { date: dStr, orders: 0, revenue: 0, items: 0, cash: 0, upi: 0, itemQtys: {} };
      }
      daysMap[dStr].orders += 1;
      daysMap[dStr].revenue += o.total;
      o.items.forEach((i) => {
        daysMap[dStr].items += i.qty;
        daysMap[dStr].itemQtys[i.name] = (daysMap[dStr].itemQtys[i.name] || 0) + i.qty;
      });
      if (o.paymentMethod === 'cod') daysMap[dStr].cash += o.total;
      else if (o.paymentMethod === 'upi') daysMap[dStr].upi += o.total;
    });

    return Object.values(daysMap).map((d) => {
      const topItem = Object.entries(d.itemQtys).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      return {
        date: d.date,
        orders: d.orders,
        revenue: Math.round(d.revenue),
        items: d.items,
        cash: Math.round(d.cash),
        upi: Math.round(d.upi),
        aov: d.orders > 0 ? Math.round(d.revenue / d.orders) : 0,
        topItem
      };
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredOrders]);

  // ── Weekly Weekday Calculations (Phase 7) ──
  const weeklyData = useMemo(() => {
    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekdayMap = Array.from({ length: 7 }, (_, i) => ({
      name: weekdayNames[i],
      orders: 0,
      revenue: 0,
      cash: 0,
      upi: 0,
      items: 0,
      itemQtys: {} as Record<string, number>
    }));

    filteredOrders.forEach((o) => {
      const dayIdx = new Date(o.createdAt).getDay();
      const wDay = weekdayMap[dayIdx];
      wDay.orders += 1;
      wDay.revenue += o.total;
      if (o.paymentMethod === 'cod') wDay.cash += o.total;
      else if (o.paymentMethod === 'upi') wDay.upi += o.total;
      o.items.forEach((i) => {
        wDay.items += i.qty;
        wDay.itemQtys[i.name] = (wDay.itemQtys[i.name] || 0) + i.qty;
      });
    });

    return weekdayMap.map((w) => {
      const topItem = Object.entries(w.itemQtys).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      return {
        ...w,
        revenue: Math.round(w.revenue),
        cash: Math.round(w.cash),
        upi: Math.round(w.upi),
        aov: w.orders > 0 ? Math.round(w.revenue / w.orders) : 0,
        topItem
      };
    });
  }, [filteredOrders]);

  // Peak weekdays
  const weekdayRankings = useMemo(() => {
    const sortedRev = [...weeklyData].sort((a, b) => b.revenue - a.revenue);
    const sortedVol = [...weeklyData].sort((a, b) => b.orders - a.orders);
    return {
      mostProfitable: sortedRev[0]?.name || 'N/A',
      leastProfitable: sortedRev[sortedRev.length - 1]?.name || 'N/A',
      busiest: sortedVol[0]?.name || 'N/A',
      slowest: sortedVol[sortedVol.length - 1]?.name || 'N/A'
    };
  }, [weeklyData]);

  // ── Monthly Calculations (Phase 8) ──
  const monthlyData = useMemo(() => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const months = Array.from({ length: 12 }, (_, i) => ({
      name: monthNames[i],
      orders: 0,
      revenue: 0,
      cash: 0,
      upi: 0,
      items: 0,
      itemQtys: {} as Record<string, number>
    }));

    filteredOrders.forEach((o) => {
      const mIdx = new Date(o.createdAt).getMonth();
      const m = months[mIdx];
      m.orders += 1;
      m.revenue += o.total;
      if (o.paymentMethod === 'cod') m.cash += o.total;
      else if (o.paymentMethod === 'upi') m.upi += o.total;
      o.items.forEach((i) => {
        m.items += i.qty;
        m.itemQtys[i.name] = (m.itemQtys[i.name] || 0) + i.qty;
      });
    });

    return months.map((m, idx) => {
      const topItem = Object.entries(m.itemQtys).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      const prevRev = idx > 0 ? months[idx - 1].revenue : 0;
      const growth = prevRev > 0 ? Math.round(((m.revenue - prevRev) / prevRev) * 100) : 0;
      return {
        ...m,
        revenue: Math.round(m.revenue),
        cash: Math.round(m.cash),
        upi: Math.round(m.upi),
        aov: m.orders > 0 ? Math.round(m.revenue / m.orders) : 0,
        topItem,
        growth
      };
    });
  }, [filteredOrders]);

  // ── Hourly Heatmap Calculations (Phase 9) ──
  const hourlyData = useMemo(() => {
    const hours = Array.from({ length: 16 }, (_, i) => {
      const hVal = i + 8; // 8 AM to 11 PM
      const label = hVal >= 12 ? (hVal === 12 ? '12 PM' : `${hVal - 12} PM`) : `${hVal} AM`;
      return { hour: hVal, label, revenue: 0, orders: 0, items: 0 };
    });

    filteredOrders.forEach((o) => {
      const hr = new Date(o.createdAt).getHours();
      const matched = hours.find((h) => h.hour === hr);
      if (matched) {
        matched.orders += 1;
        matched.revenue += o.total;
        o.items.forEach((i) => { matched.items += i.qty; });
      }
    });

    return hours;
  }, [filteredOrders]);

  // ── Product Analytics Calculations (Phase 10 & 11) ──
  const productData = useMemo(() => {
    const pMap: Record<string, { name: string; category: string; timesSold: number; qty: number; revenue: number }> = {};
    
    filteredOrders.forEach((o) => {
      o.items.forEach((i) => {
        if (!pMap[i.name]) {
          pMap[i.name] = {
            name: i.name,
            category: getItemCategory(i.id, i.name),
            timesSold: 0,
            qty: 0,
            revenue: 0
          };
        }
        pMap[i.name].timesSold += 1;
        pMap[i.name].qty += i.qty;
        pMap[i.name].revenue += i.price * i.qty;
      });
    });

    const activeDays = dailyData.length || 1;
    const activeWeeks = Math.ceil(activeDays / 7) || 1;
    const activeMonths = Math.ceil(activeDays / 30) || 1;

    return Object.values(pMap).map((p) => ({
      ...p,
      revenue: Math.round(p.revenue),
      avgQtyPerOrder: Number((p.qty / p.timesSold).toFixed(1)),
      dailyAvg: Number((p.qty / activeDays).toFixed(1)),
      weeklyAvg: Number((p.qty / activeWeeks).toFixed(1)),
      monthlyAvg: Number((p.qty / activeMonths).toFixed(1))
    }));
  }, [filteredOrders, dailyData]);

  // Sort & Filter Products
  const sortedProducts = useMemo(() => {
    const filtered = productData.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    return filtered.sort((a, b) => {
      let aVal: any = a[productSortField];
      let bVal: any = b[productSortField];
      if (typeof aVal === 'string') {
        return productSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return productSortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [productData, productSearch, productSortField, productSortAsc]);

  const paginatedProducts = useMemo(() => {
    const startIdx = (productPage - 1) * productsPerPage;
    return sortedProducts.slice(startIdx, startIdx + productsPerPage);
  }, [sortedProducts, productPage]);

  // Product Rankings
  const productRankings = useMemo(() => {
    const sortedQty = [...productData].sort((a, b) => b.qty - a.qty);
    const sortedRev = [...productData].sort((a, b) => b.revenue - a.revenue);
    return {
      top10: sortedQty.slice(0, 10),
      bottom10: sortedQty.slice(-10).reverse(),
      highestRevenue: sortedRev[0] || null,
      lowestRevenue: sortedRev[sortedRev.length - 1] || null,
    };
  }, [productData]);

  // Category Analytics (Phase 11)
  const categoryData = useMemo(() => {
    const cMap: Record<string, { category: string; revenue: number; orders: number; items: number; itemQtys: Record<string, number> }> = {};
    
    filteredOrders.forEach((o) => {
      o.items.forEach((i) => {
        const cat = getItemCategory(i.id, i.name);
        if (!cMap[cat]) {
          cMap[cat] = { category: cat, revenue: 0, orders: 0, items: 0, itemQtys: {} };
        }
        cMap[cat].revenue += i.price * i.qty;
        cMap[cat].items += i.qty;
        cMap[cat].itemQtys[i.name] = (cMap[cat].itemQtys[i.name] || 0) + i.qty;
      });
      // count unique orders per category
      const uniqueCats = new Set(o.items.map(i => getItemCategory(i.id, i.name)));
      uniqueCats.forEach((cat) => {
        if (cMap[cat]) cMap[cat].orders += 1;
      });
    });

    return Object.values(cMap).map((c) => {
      const topItem = Object.entries(c.itemQtys).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
      return {
        category: c.category,
        revenue: Math.round(c.revenue),
        orders: c.orders,
        items: c.items,
        avgSale: c.orders > 0 ? Math.round(c.revenue / c.orders) : 0,
        topItem
      };
    });
  }, [filteredOrders]);

  // ── Customer Analytics (Phase 12) ──
  const customerData = useMemo(() => {
    const custMap: Record<string, { phone: string; name: string; orders: number; spent: number }> = {};
    
    filteredOrders.forEach((o) => {
      const key = o.address.phone || o.address.email || 'guest';
      if (key === 'guest') return;
      if (!custMap[key]) {
        custMap[key] = { phone: o.address.phone, name: o.customerName || 'Loyal Guest', orders: 0, spent: 0 };
      }
      custMap[key].orders += 1;
      custMap[key].spent += o.total;
    });

    const list = Object.values(custMap);
    const totalCustomers = list.length;
    const returning = list.filter((c) => c.orders > 1).length;
    const avgSpent = totalCustomers > 0 ? Math.round(list.reduce((sum, c) => sum + c.spent, 0) / totalCustomers) : 0;
    const topSpender = [...list].sort((a, b) => b.spent - a.spent)[0] || null;
    const frequentSpender = [...list].sort((a, b) => b.orders - a.orders)[0] || null;

    return {
      list,
      totalCustomers,
      returningCustomers: returning,
      newCustomers: totalCustomers - returning,
      avgSpending: avgSpent,
      highestSpender: topSpender,
      frequentSpender: frequentSpender
    };
  }, [filteredOrders]);

  // Sort & Filter Customers
  const sortedCustomers = useMemo(() => {
    const filtered = customerData.list.filter((c) => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone.includes(customerSearch));
    return filtered.sort((a, b) => {
      let aVal: any = a[customerSortField];
      let bVal: any = b[customerSortField];
      if (typeof aVal === 'string') {
        return customerSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return customerSortAsc ? aVal - bVal : bVal - aVal;
    });
  }, [customerData, customerSearch, customerSortField, customerSortAsc]);

  const paginatedCustomers = useMemo(() => {
    const startIdx = (customerPage - 1) * customersPerPage;
    return sortedCustomers.slice(startIdx, startIdx + customersPerPage);
  }, [sortedCustomers, customerPage]);

  // ── Employee/Cashier Analytics (Phase 13) ──
  const employeeData = useMemo(() => {
    const empMap: Record<string, { name: string; orders: number; revenue: number; bills: number[] }> = {};
    
    filteredOrders.forEach((o) => {
      const cashierKey = o.cashier || 'Online';
      if (!empMap[cashierKey]) {
        empMap[cashierKey] = { name: cashierKey, orders: 0, revenue: 0, bills: [] };
      }
      empMap[cashierKey].orders += 1;
      empMap[cashierKey].revenue += o.total;
      empMap[cashierKey].bills.push(o.total);
    });

    return Object.values(empMap).map((e) => ({
      name: e.name,
      orders: e.orders,
      revenue: Math.round(e.revenue),
      avgBill: Math.round(e.revenue / e.orders),
      highestBill: Math.round(Math.max(...e.bills)),
      lowestBill: Math.round(Math.min(...e.bills))
    }));
  }, [filteredOrders]);

  // ── Trend Comparisons (Phase 14) ──
  const trendAnalysis = useMemo(() => {
    // Determine prior period boundaries
    const duration = filterBounds.end.getTime() - filterBounds.start.getTime();
    const priorStart = new Date(filterBounds.start.getTime() - duration - 1000);
    const priorEnd = new Date(filterBounds.start.getTime() - 1000);

    const priorOrders = validOrders.filter((o) => {
      const d = new Date(o.createdAt);
      return d >= priorStart && d <= priorEnd;
    });

    const priorRev = priorOrders.reduce((sum, o) => sum + o.total, 0);
    const currentRev = kpis.totalRevenue;
    const revDiff = currentRev - priorRev;
    const revGrowth = priorRev > 0 ? Math.round((revDiff / priorRev) * 100) : 0;

    const priorCount = priorOrders.length;
    const currentCount = kpis.totalOrders;
    const countDiff = currentCount - priorCount;
    const countGrowth = priorCount > 0 ? Math.round((countDiff / priorCount) * 100) : 0;

    return {
      priorRevenue: Math.round(priorRev),
      currentRevenue: Math.round(currentRev),
      revenueDiff: Math.round(revDiff),
      revenueGrowth: revGrowth,
      priorOrders: priorCount,
      currentOrders: currentCount,
      orderDiff: countDiff,
      orderGrowth: countGrowth
    };
  }, [kpis, filterBounds, validOrders]);

  // ── Best Selling Item (Phase 15) ──
  const bestSellers = useMemo(() => {
    const getBestSellerInRange = (start: Date, end: Date) => {
      const qtyMap: Record<string, { name: string; qty: number; revenue: number }> = {};
      validOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d >= start && d <= end;
      }).forEach((o) => {
        o.items.forEach((i) => {
          if (!qtyMap[i.name]) qtyMap[i.name] = { name: i.name, qty: 0, revenue: 0 };
          qtyMap[i.name].qty += i.qty;
          qtyMap[i.name].revenue += i.price * i.qty;
        });
      });
      return Object.values(qtyMap).sort((a, b) => b.qty - a.qty)[0] || null;
    };

    const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayBs = getBestSellerInRange(startOfDay(now), endOfDay(now));
    const weekBs = getBestSellerInRange(startOfDay(weekStart), endOfDay(now));
    const monthBs = getBestSellerInRange(startOfDay(monthStart), endOfDay(now));
    const overallBs = getBestSellerInRange(new Date(0), endOfDay(now));

    return {
      today: todayBs,
      week: weekBs,
      month: monthBs,
      overall: overallBs
    };
  }, [validOrders]);

  // ── Peaks Analytics (Phase 17) ──
  const peakSales = useMemo(() => {
    const sortedDaily = [...dailyData].sort((a, b) => b.revenue - a.revenue);
    const sortedHourly = [...hourlyData].sort((a, b) => b.revenue - a.revenue);
    const sortedWeekly = [...weeklyData].sort((a, b) => b.revenue - a.revenue);
    const sortedMonthly = [...monthlyData].sort((a, b) => b.revenue - a.revenue);
    const sortedSingleOrder = [...filteredOrders].sort((a, b) => b.total - a.total);

    return {
      highestDay: sortedDaily[0]?.date || 'N/A',
      highestDayRev: sortedDaily[0]?.revenue || 0,
      highestHour: sortedHourly[0]?.label || 'N/A',
      highestHourRev: sortedHourly[0]?.revenue || 0,
      highestWeekday: sortedWeekly[0]?.name || 'N/A',
      highestWeekdayRev: sortedWeekly[0]?.revenue || 0,
      highestMonth: sortedMonthly[0]?.name || 'N/A',
      highestMonthRev: sortedMonthly[0]?.revenue || 0,
      highestSingleOrderVal: sortedSingleOrder[0]?.total || 0,
      highestSingleOrderCustomer: sortedSingleOrder[0]?.customerName || 'Guest'
    };
  }, [dailyData, hourlyData, weeklyData, monthlyData, filteredOrders]);

  // ── AI Forecasting & Inventory Predictions (Phase 18 & 19) ──
  const predictions = useMemo(() => {
    const activeDays = dailyData.length || 1;
    const avgDailyRev = kpis.totalRevenue / activeDays;

    // Revenue Forecast (Phase 18)
    const tomorrowForecast = Math.round(avgDailyRev * (now.getDay() === 5 || now.getDay() === 6 ? 1.2 : 0.95)); // +20% weight on Friday/Saturday
    const nextWeekForecast = Math.round(avgDailyRev * 7);
    const nextMonthForecast = Math.round(avgDailyRev * 30);

    // Inventory Prediction (Phase 19)
    // Formula mock weights per item category:
    let coffeeQty = 0;
    let teaQty = 0;
    let drinksQty = 0;
    let bakeryQty = 0;

    filteredOrders.forEach((o) => {
      o.items.forEach((i) => {
        const cat = getItemCategory(i.id, i.name).toLowerCase();
        if (cat.includes('coffee')) coffeeQty += i.qty;
        else if (cat.includes('tea') || cat.includes('chai')) teaQty += i.qty;
        else if (cat.includes('drink') || cat.includes('shake')) drinksQty += i.qty;
        else if (cat.includes('snack') || cat.includes('dessert') || cat.includes('burger')) bakeryQty += i.qty;
      });
    });

    const activeWeeks = Math.ceil(activeDays / 7) || 1;
    const avgCoffeeWeekly = coffeeQty / activeWeeks;
    const avgTeaWeekly = teaQty / activeWeeks;
    const avgDrinksWeekly = drinksQty / activeWeeks;
    const avgBakeryWeekly = bakeryQty / activeWeeks;

    // Estimates:
    // 0.2 Litres Milk per Drink/Shake/Coffee/Tea
    // 15g Coffee Beans per coffee
    // 10g Tea Powder per tea
    // 1 Bun/Loaf per bakery item
    const milkNeeded = Math.round((avgCoffeeWeekly + avgTeaWeekly + avgDrinksWeekly) * 0.2);
    const coffeeBeansNeeded = Number((avgCoffeeWeekly * 0.015).toFixed(1));
    const teaPowderNeeded = Number((avgTeaWeekly * 0.01).toFixed(1));
    const breadNeeded = Math.round(avgBakeryWeekly * 0.7);

    return {
      tomorrowRev: tomorrowForecast,
      nextWeekRev: nextWeekForecast,
      nextMonthRev: nextMonthForecast,
      milkWeeklyLitres: milkNeeded > 0 ? milkNeeded : 12,
      coffeeBeansWeeklyKg: coffeeBeansNeeded > 0 ? coffeeBeansNeeded : 1.5,
      teaPowderWeeklyKg: teaPowderNeeded > 0 ? teaPowderNeeded : 1.0,
      breadWeeklyUnits: breadNeeded > 0 ? breadNeeded : 25
    };
  }, [kpis, dailyData, filteredOrders]);

  // ── CSV Export Function (Phase 20) ──
  const exportCSV = (type: 'sales' | 'products' | 'customers') => {
    let headers = '';
    let rows: string[] = [];
    let filename = '';

    if (type === 'sales') {
      headers = 'Date,Orders Count,Gross Revenue (INR),Items Sold,Cash Collection,UPI Collection,Average Ticket (INR),Top Selling Item\n';
      rows = dailyData.map((d) => `"${d.date}",${d.orders},${d.revenue},${d.items},${d.cash},${d.upi},${d.aov},"${d.topItem}"`);
      filename = `Daily_Sales_Report_${timeRange}.csv`;
    } else if (type === 'products') {
      headers = 'Product Name,Category,Times Placed,Quantity Sold,Total Revenue (INR),Average Qty Per Bill,Daily Sales Avg\n';
      rows = productData.map((p) => `"${p.name}","${p.category}",${p.timesSold},${p.qty},${p.revenue},${p.avgQtyPerOrder},${p.dailyAvg}`);
      filename = `Product_Sales_Report_${timeRange}.csv`;
    } else {
      headers = 'Customer Name,Phone Number,Bills Count,Total Spent (INR)\n';
      rows = customerData.list.map((c) => `"${c.name}","${c.phone}",${c.orders},${c.spent}`);
      filename = `Customer_Audit_Log_${timeRange}.csv`;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + rows.join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${type.toUpperCase()} report exported successfully.`);
  };

  // ── PDF Print Function (Phase 20) ──
  const handlePrintPDF = () => {
    const printWindow = window.open('about:blank', '_blank', 'left=200,top=200,width=1000,height=900');
    if (!printWindow) return;

    // Create printable items view for the PDF
    const transactionLogsHtml = filteredOrders.map(o => {
      const itemsArr = Array.isArray(o.items) ? o.items : [];
      return `
        <div style="border: 1px solid #ddd; padding: 15px; margin-bottom: 20px; page-break-inside: avoid; display: flex; justify-content: space-between; align-items: flex-start; background: #fafafa; border-radius: 4px;">
          <div>
            <h4 style="margin: 0 0 8px 0; color: #c5a85c; font-size: 14px;">Order ID: ${o.id.toUpperCase()}</h4>
            <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Customer:</strong> ${o.customerName || 'Guest'}</p>
            <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Mobile:</strong> ${o.address?.phone || 'N/A'}</p>
            <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Email:</strong> ${o.address?.email || 'N/A'}</p>
            <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Date/Time:</strong> ${new Date(o.createdAt).toLocaleString('en-IN')}</p>
            <p style="margin: 0 0 5px 0; font-size: 12px;"><strong>Grand Total:</strong> ₹${o.total.toLocaleString('en-IN')}</p>
            <p style="margin: 0 0 8px 0; font-size: 12px;"><strong>Payment Method:</strong> ${o.paymentMethod.toUpperCase()} ${o.upiTxnId ? `(Txn ID: ${o.upiTxnId})` : ''}</p>
            
            <p style="margin: 0 0 4px 0; font-size: 11px; font-weight: bold; color: #555; text-transform: uppercase;">Items Ordered:</p>
            <ul style="margin: 0; padding-left: 20px; font-size: 11px; color: #444;">
              ${itemsArr.map(item => `
                <li>${item.name} x${item.qty} - ₹${(item.price * item.qty).toLocaleString()}</li>
              `).join('')}
            </ul>
          </div>
          <div style="text-align: center; margin-left: 20px;">
            <span style="font-size: 9px; font-weight: bold; color: #777; display: block; margin-bottom: 6px; text-transform: uppercase;">Receipt Image</span>
            ${o.receiptPhoto ? `
              <img src="${o.receiptPhoto}" style="width: 120px; height: 150px; object-fit: cover; border: 1px solid #ddd; border-radius: 4px; background: #eee;" />
            ` : `
              <div style="width: 120px; height: 150px; background: #f0f0f0; border: 1px dashed #ccc; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #999; font-size: 11px;">No Photo</div>
            `}
          </div>
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>The London Shakes - Cafe Performance Report</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 40px; color: #111; background: #fff; line-height: 1.5; }
            .header { border-bottom: 2px solid #c5a85c; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #111; letter-spacing: 1px; }
            .title { font-size: 20px; margin-top: 10px; font-weight: 600; text-transform: uppercase; color: #c5a85c; }
            .meta { font-size: 13px; color: #555; margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .kpi-card { border: 1px solid #ddd; padding: 20px; background: #fafafa; border-radius: 4px; }
            .kpi-title { font-size: 11px; text-transform: uppercase; color: #666; font-weight: bold; }
            .kpi-value { font-size: 24px; font-weight: bold; color: #111; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 30px; }
            th { border-bottom: 2px solid #ddd; padding: 10px 8px; text-align: left; font-size: 12px; text-transform: uppercase; background: #fafafa; }
            td { border-bottom: 1px solid #eee; padding: 8px 8px; font-size: 12px; }
            .page-break { page-break-before: always; }
            .footer { margin-top: 50px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; text-align: center; }
            h2 { color: #111; border-left: 4px solid #c5a85c; padding-left: 10px; margin-top: 30px; font-size: 16px; text-transform: uppercase; letter-spacing: 0.5px; }
            h3 { font-size: 13px; color: #333; margin-top: 20px; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">THE LONDON SHAKES</div>
            <div class="title">Performance Audit Report</div>
            <div class="meta">Generated on: ${new Date().toLocaleString('en-IN')} | Time Filter: ${timeRange.toUpperCase()}</div>
          </div>
          
          <!-- Tab 1: Overview KPIs -->
          <h2>Executive Overview</h2>
          <div class="grid">
            <div class="kpi-card">
              <div class="kpi-title">Gross Revenue</div>
              <div class="kpi-value">₹${kpis.totalRevenue.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Orders</div>
              <div class="kpi-value">${kpis.totalOrders}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Average Order Value</div>
              <div class="kpi-value">₹${kpis.avgOrderValue}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Items Sold</div>
              <div class="kpi-value">${kpis.totalItemsSold}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total Cash Collected</div>
              <div class="kpi-value">₹${kpis.cashCollection.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Total UPI Collected</div>
              <div class="kpi-value">₹${kpis.upiCollection.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Taxes Collected</div>
              <div class="kpi-value">₹${kpis.taxCollected.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Discounts Given</div>
              <div class="kpi-value">₹${kpis.discountGiven.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Growth Rate vs Last Period</div>
              <div class="kpi-value">${kpis.revenueGrowth >= 0 ? '+' : ''}${kpis.revenueGrowth}%</div>
            </div>
          </div>

          <div style="margin-top: 10px; font-size: 13px; color: #333;">
            <p><strong>Busiest Sales Peak Day:</strong> ${peakSales.highestDay || 'N/A'}</p>
            <p><strong>Busiest Week Peak:</strong> ${peakSales.highestWeekday || 'N/A'}</p>
            <p><strong>Busiest Month Peak:</strong> ${peakSales.highestMonth || 'N/A'}</p>
          </div>

          <!-- Tab 2: Sales Trends -->
          <div class="page-break"></div>
          <h2>Sales Trends & Daily Performance</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Cash Collection</th>
                <th>UPI Collection</th>
                <th>Average Bill</th>
                <th>Top Selling Product</th>
              </tr>
            </thead>
            <tbody>
              ${dailyData.map(d => `
                <tr>
                  <td>${d.date}</td>
                  <td>${d.orders}</td>
                  <td>₹${d.revenue.toLocaleString()}</td>
                  <td>₹${d.cash.toLocaleString()}</td>
                  <td>₹${d.upi.toLocaleString()}</td>
                  <td>₹${d.aov}</td>
                  <td>${d.topItem || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h3>Weekly Performance (Day Averages)</h3>
          <table>
            <thead>
              <tr>
                <th>Day</th>
                <th>Orders</th>
                <th>Revenue</th>
                <th>Cash Split</th>
                <th>UPI Split</th>
                <th>Average Bill</th>
              </tr>
            </thead>
            <tbody>
              ${weeklyData.map(w => `
                <tr>
                  <td>${w.name}</td>
                  <td>${w.orders}</td>
                  <td>₹${w.revenue.toLocaleString()}</td>
                  <td>₹${w.cash.toLocaleString()}</td>
                  <td>₹${w.upi.toLocaleString()}</td>
                  <td>₹${w.aov.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Tab 3: Payments Split -->
          <div class="page-break"></div>
          <h2>Payments & Collections Split</h2>
          <table>
            <thead>
              <tr>
                <th>Method</th>
                <th>Amount Collected</th>
                <th>Collection Percentage</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>UPI (Scan & Pay)</strong></td>
                <td>₹${kpis.upiCollection.toLocaleString()}</td>
                <td>${kpis.totalRevenue > 0 ? Math.round((kpis.upiCollection / kpis.totalRevenue) * 100) : 0}%</td>
              </tr>
              <tr>
                <td><strong>Cash (Counter / Cash on Delivery)</strong></td>
                <td>₹${kpis.cashCollection.toLocaleString()}</td>
                <td>${kpis.totalRevenue > 0 ? Math.round((kpis.cashCollection / kpis.totalRevenue) * 100) : 0}%</td>
              </tr>
              <tr>
                <td><strong>Card Payments</strong></td>
                <td>₹${kpis.cardCollection.toLocaleString()}</td>
                <td>${kpis.totalRevenue > 0 ? Math.round((kpis.cardCollection / kpis.totalRevenue) * 100) : 0}%</td>
              </tr>
            </tbody>
          </table>

          <!-- Tab 4: Product Audit -->
          <h2>Product Audit & Menu Analytics</h2>
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Quantity Sold</th>
                <th>Total Revenue</th>
              </tr>
            </thead>
            <tbody>
              ${productData.map(p => `
                <tr>
                  <td>${p.name}</td>
                  <td>${p.category}</td>
                  <td>${p.qty}</td>
                  <td>₹${p.revenue.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Tab 5: Customers -->
          <div class="page-break"></div>
          <h2>Customer Loyalty & Database Audit</h2>
          <div class="grid" style="margin-bottom: 20px;">
            <div class="kpi-card">
              <div class="kpi-title">Unique Customers</div>
              <div class="kpi-value">${customerData.totalCustomers}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Returning Customer Rate</div>
              <div class="kpi-value">${customerData.returningCustomers}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Average Spend Per Customer</div>
              <div class="kpi-value">₹${customerData.avgSpending}</div>
            </div>
          </div>

          <h3>Top Spender Details</h3>
          <p style="font-size: 13px;">
            <strong>Highest Spender:</strong> ${customerData.highestSpender ? `${customerData.highestSpender.name} (Spent: ₹${customerData.highestSpender.spent.toLocaleString()})` : 'N/A'}<br/>
            <strong>Most Frequent Visitor:</strong> ${customerData.frequentSpender ? `${customerData.frequentSpender.name} (${customerData.frequentSpender.orders} visits)` : 'N/A'}
          </p>

          <h3>Customer Ledger</h3>
          <table>
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Mobile / Key</th>
                <th>Total Orders</th>
                <th>Total Spending</th>
              </tr>
            </thead>
            <tbody>
              ${customerData.list.map(c => `
                <tr>
                  <td>${c.name}</td>
                  <td>${c.phone || 'Guest'}</td>
                  <td>${c.orders}</td>
                  <td><strong>₹${c.spent.toLocaleString()}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Tab 6: Employee Logs -->
          <div class="page-break"></div>
          <h2>Employee & Cashier Performance Audit</h2>
          <table>
            <thead>
              <tr>
                <th>Cashier Name</th>
                <th>Orders Processed</th>
                <th>Total Revenue Generated</th>
                <th>Average Bill size</th>
                <th>Highest Single Ticket</th>
              </tr>
            </thead>
            <tbody>
              ${employeeData.map(e => `
                <tr>
                  <td><strong>${e.name}</strong></td>
                  <td>${e.orders}</td>
                  <td>₹${e.revenue.toLocaleString()}</td>
                  <td>₹${e.avgBill}</td>
                  <td>₹${e.highestBill.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <!-- Tab 7: AI Forecasts -->
          <h2>AI Performance Forecasts & Weekly Ingredient Demands</h2>
          <div class="grid" style="margin-bottom: 20px;">
            <div class="kpi-card">
              <div class="kpi-title">Sales Forecast (Tomorrow)</div>
              <div class="kpi-value">₹${predictions.tomorrowRev.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Sales Forecast (Next Week)</div>
              <div class="kpi-value">₹${predictions.nextWeekRev.toLocaleString()}</div>
            </div>
            <div class="kpi-card">
              <div class="kpi-title">Sales Forecast (Next Month)</div>
              <div class="kpi-value">₹${predictions.nextMonthRev.toLocaleString()}</div>
            </div>
          </div>

          <h3>Predictive Ingredient Estimations (Next Week)</h3>
          <table>
            <thead>
              <tr>
                <th>Ingredient Item</th>
                <th>Estimated Demand Quantity</th>
                <th>Unit</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Fresh Milk</strong></td>
                <td>${predictions.milkWeeklyLitres}</td>
                <td>Litres</td>
              </tr>
              <tr>
                <td><strong>Coffee Beans</strong></td>
                <td>${predictions.coffeeBeansWeeklyKg}</td>
                <td>Kg</td>
              </tr>
              <tr>
                <td><strong>Tea Powder</strong></td>
                <td>${predictions.teaPowderWeeklyKg}</td>
                <td>Kg</td>
              </tr>
              <tr>
                <td><strong>Bread Buns / Loaves</strong></td>
                <td>${predictions.breadWeeklyUnits}</td>
                <td>Units (Pcs)</td>
              </tr>
            </tbody>
          </table>

          <!-- Tab 8: Transaction Bills & Photo Proofs -->
          <div class="page-break"></div>
          <h2>Transaction Log & Verified Bills (with Photo Proofs)</h2>
          <p style="font-size: 12px; color: #666; margin-bottom: 20px;">
            This section lists the individual detailed transaction logs within the selected time range along with their receipt verification photos captured by staff.
          </p>
          ${transactionLogsHtml}

          <div class="footer">
            CONFIDENTIAL - Performance Audit Report. © ${new Date().getFullYear()} The London Shakes Silchar.
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // ── Render Helpers for Custom Interactive SVG Charts ──

  // 1. Line/Area Chart for Revenue Trend
  const renderTrendChart = () => {
    const chartData = [...dailyData].reverse();
    if (chartData.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No transaction history available</p>;
    const maxVal = Math.max(...chartData.map((d) => d.revenue)) || 100;
    
    const width = 600;
    const height = 180;
    const padding = 35;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    const points = chartData.map((d, i) => {
      const x = padding + (i / (chartData.length - 1 || 1)) * plotW;
      const y = padding + plotH - (d.revenue / maxVal) * plotH;
      return { x, y, val: d.revenue, label: d.date };
    });

    const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    const areaD = `${pathD} L ${points[points.length - 1].x} ${padding + plotH} L ${points[0].x} ${padding + plotH} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: 'transparent' }}>
        <defs>
          <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={padding + plotH * f}
            x2={padding + plotW}
            y2={padding + plotH * f}
            stroke="var(--dark-border)"
            strokeWidth="0.5"
            strokeDasharray="4"
          />
        ))}
        {/* Area fill */}
        <path d={areaD} fill="url(#areaGlow)" />
        {/* Line stroke */}
        <path d={pathD} fill="none" stroke="var(--gold)" strokeWidth="2.5" />
        {/* Interactive nodes */}
        {points.map((p, i) => (
          <g key={i} style={{ cursor: 'pointer' }}>
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="var(--void)"
              stroke="var(--gold)"
              strokeWidth="2"
            />
            <title>{p.label}: ₹{p.val.toLocaleString()}</title>
          </g>
        ))}
      </svg>
    );
  };

  // 2. Donut/Pie Chart for Payment Distribution
  const renderPaymentDonut = () => {
    const cash = kpis.cashCollection;
    const upi = kpis.upiCollection;
    const card = kpis.cardCollection;
    const total = cash + upi + card || 1;

    const slices = [
      { label: 'UPI', val: upi, color: 'var(--gold)' },
      { label: 'Cash', val: cash, color: '#f59e0b' },
      { label: 'Card', val: card, color: '#3b82f6' }
    ].filter((s) => s.val > 0);

    if (slices.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No payment distribution logs</p>;

    let accumulatedAngle = 0;
    return (
      <svg viewBox="0 0 200 200" style={{ width: '150px', height: '150px' }}>
        {slices.map((s, idx) => {
          const percentage = s.val / total;
          const angle = percentage * 360;
          const largeArc = angle > 180 ? 1 : 0;
          
          const radStart = ((accumulatedAngle - 90) * Math.PI) / 180;
          const radEnd = ((accumulatedAngle + angle - 90) * Math.PI) / 180;
          accumulatedAngle += angle;

          const x1 = 100 + 70 * Math.cos(radStart);
          const y1 = 100 + 70 * Math.sin(radStart);
          const x2 = 100 + 70 * Math.cos(radEnd);
          const y2 = 100 + 70 * Math.sin(radEnd);

          const pathD = `M 100 100 L ${x1} ${y1} A 70 70 0 ${largeArc} 1 ${x2} ${y2} Z`;

          return (
            <g key={idx}>
              <path d={pathD} fill={s.color} stroke="var(--void)" strokeWidth="2">
                <title>{s.label}: ₹{s.val.toLocaleString()} ({Math.round(percentage * 100)}%)</title>
              </path>
            </g>
          );
        })}
        <circle cx="100" cy="100" r="40" fill="var(--void)" />
      </svg>
    );
  };

  // 3. Stacked Bar Chart comparing Cash vs UPI (Phase 5)
  const renderStackedBar = () => {
    const chartData = [...dailyData].slice(0, 10).reverse(); // show last 10 days
    if (chartData.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No transaction history available</p>;
    const maxVal = Math.max(...chartData.map((d) => d.cash + d.upi)) || 100;

    const width = 600;
    const height = 180;
    const padding = 35;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={padding + plotH * f}
            x2={padding + plotW}
            y2={padding + plotH * f}
            stroke="var(--dark-border)"
            strokeWidth="0.5"
            strokeDasharray="4"
          />
        ))}
        {chartData.map((d, i) => {
          const x = padding + (i / chartData.length) * plotW + (plotW / chartData.length) * 0.15;
          const barW = (plotW / chartData.length) * 0.7;

          const cashH = (d.cash / maxVal) * plotH;
          const upiH = (d.upi / maxVal) * plotH;

          return (
            <g key={i}>
              {/* Cash Bar (Bottom segment) */}
              {d.cash > 0 && (
                <rect
                  x={x}
                  y={padding + plotH - cashH}
                  width={barW}
                  height={cashH}
                  fill="#f59e0b"
                >
                  <title>Cash: ₹{d.cash.toLocaleString()}</title>
                </rect>
              )}
              {/* UPI Bar (Top segment stacked on Cash) */}
              {d.upi > 0 && (
                <rect
                  x={x}
                  y={padding + plotH - cashH - upiH}
                  width={barW}
                  height={upiH}
                  fill="var(--gold)"
                >
                  <title>UPI: ₹{d.upi.toLocaleString()}</title>
                </rect>
              )}
              {/* X axis labels */}
              <text
                x={x + barW / 2}
                y={padding + plotH + 15}
                fill="var(--text-muted)"
                fontSize="8"
                textAnchor="middle"
              >
                {d.date.split('-')[2]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // 4. Bar Graph for Revenue by Weekday (Phase 7)
  const renderWeekdayBar = () => {
    const maxVal = Math.max(...weeklyData.map((w) => w.revenue)) || 100;
    const width = 600;
    const height = 180;
    const padding = 35;
    const plotW = width - padding * 2;
    const plotH = height - padding * 2;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, idx) => (
          <line
            key={idx}
            x1={padding}
            y1={padding + plotH * f}
            x2={padding + plotW}
            y2={padding + plotH * f}
            stroke="var(--dark-border)"
            strokeWidth="0.5"
            strokeDasharray="4"
          />
        ))}
        {weeklyData.map((w, i) => {
          const x = padding + (i / 7) * plotW + (plotW / 7) * 0.15;
          const barW = (plotW / 7) * 0.7;
          const barH = (w.revenue / maxVal) * plotH;

          return (
            <g key={i}>
              <rect
                x={x}
                y={padding + plotH - barH}
                width={barW}
                height={barH}
                fill="var(--gold)"
                rx="2"
              >
                <title>{w.name}: ₹{w.revenue.toLocaleString()}</title>
              </rect>
              <text
                x={x + barW / 2}
                y={padding + plotH + 15}
                fill="var(--text-muted)"
                fontSize="9"
                textAnchor="middle"
              >
                {w.name.substring(0, 3)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // 5. Horizontal Bar Chart for Top Products (Phase 10)
  const renderProductHorizontalBar = () => {
    const top5 = productRankings.top10.slice(0, 5);
    if (top5.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No product sales records available</p>;
    const maxVal = Math.max(...top5.map((p) => p.qty)) || 1;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {top5.map((p, i) => {
          const pct = Math.round((p.qty / maxVal) * 100);
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--cream)', fontWeight: 600 }}>{p.name}</span>
                <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{p.qty} units (₹{p.revenue.toLocaleString()})</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--dark-surface)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--gold-dark), var(--gold))', borderRadius: '4px' }} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Security Access Block
  if (!hydrated || loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '60vh', gap: '12px' }}>
        <div className="animate-spin" style={{ width: '28px', height: '28px', border: '2px solid var(--gold)', borderTopColor: 'transparent', borderRadius: '50%' }} />
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)', fontSize: '0.9rem' }}>Loading analytics logs...</p>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', padding: '20px', textAlign: 'center' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', marginBottom: '20px' }}>
          <ShieldAlert size={32} />
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', color: 'var(--cream)', marginBottom: '8px' }}>Access Denied</h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>
          This directory is secure and restricted. The Analytics & Audit logs can only be accessed by the Super Admin / Owner.
        </p>
      </div>
    );
  }

  return (
    <div style={{ color: 'var(--cream)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* ── TOP HEADER SECTION ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', borderBottom: '1px solid var(--dark-border)', paddingBottom: '20px' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--cream)', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Activity color="var(--gold)" size={28} /> Audit &amp; Performance Analytics
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>
            Super Admin real-time operations overview, metrics computation, and financial accounting reports.
          </p>
        </div>

        {/* Date Filters Selectors */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px' }}>
          <div style={{ display: 'flex', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', borderRadius: '4px', padding: '3px' }}>
            {[
              { label: 'All', val: 'all' },
              { label: 'Today', val: 'today' },
              { label: 'L7 Days', val: 'last7' },
              { label: 'L30 Days', val: 'last30' },
              { label: 'This Month', val: 'month' },
              { label: 'Custom', val: 'custom' }
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setTimeRange(t.val as any)}
                style={{
                  background: timeRange === t.val ? 'var(--gold)' : 'transparent',
                  color: timeRange === t.val ? 'var(--black)' : 'var(--text-muted)',
                  border: 'none', padding: '6px 12px', fontSize: '0.68rem', fontWeight: 700,
                  textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.2s ease', borderRadius: '3px'
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrintPDF}
            style={{
              padding: '8px 14px', background: 'transparent', border: '1px solid var(--dark-border-2)',
              color: 'var(--cream)', cursor: 'pointer', fontSize: '0.68rem', display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'var(--font-sans)', fontWeight: 600
            }}
          >
            <Printer size={12} /> Print Report
          </button>
        </div>
      </div>

      {/* Custom Date Picker Fields */}
      {timeRange === 'custom' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', padding: '16px', borderRadius: '4px', marginTop: '-12px', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>From Date</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              style={{ background: 'var(--void)', border: '1px solid var(--dark-border)', color: 'var(--cream)', padding: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '0.6rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>To Date</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              style={{ background: 'var(--void)', border: '1px solid var(--dark-border)', color: 'var(--cream)', padding: '8px', fontSize: '0.75rem', fontFamily: 'var(--font-sans)', outline: 'none' }}
            />
          </div>
          <button
            onClick={() => {
              if (!customFrom || !customTo) {
                toast.error('Please select both From and To dates.');
                return;
              }
              setTimeRange('custom');
              toast.success('Custom date filter applied.');
            }}
            style={{
              padding: '10px 18px', background: 'var(--gold)', border: 'none', color: 'var(--black)',
              cursor: 'pointer', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', alignSelf: 'flex-end'
            }}
          >
            Apply Range
          </button>
        </div>
      )}

      {/* ── TABS BAR ── */}
      <div style={{ display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--dark-border)', paddingBottom: '1px', gap: '8px' }}>
        {[
          { id: 'overview', label: 'Overview', icon: BarChart2 },
          { id: 'sales', label: 'Sales Trends', icon: TrendingUp },
          { id: 'payments', label: 'Payments', icon: CreditCard },
          { id: 'products', label: 'Product Audit', icon: Utensils },
          { id: 'customers', label: 'Customers', icon: User },
          { id: 'employees', label: 'Employee Logs', icon: Users },
          { id: 'forecast', label: 'AI Forecasts', icon: Brain },
          { id: 'reports', label: 'Export Panel', icon: Download }
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px',
                background: active ? 'rgba(197,168,92,0.06)' : 'transparent',
                border: 'none', borderBottom: active ? '2px solid var(--gold)' : '2px solid transparent',
                color: active ? 'var(--gold)' : 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap'
              }}
            >
              <Icon size={14} color={active ? 'var(--gold)' : 'var(--text-muted)'} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT: OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* KPI Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
            {[
              { label: 'Gross Sales', val: `₹${kpis.totalRevenue.toLocaleString()}`, color: 'var(--gold)', icon: DollarSign },
              { label: 'Total Orders', val: kpis.totalOrders, color: 'var(--cream)', icon: ShoppingBag },
              { label: 'Avg Ticket (AOV)', val: `₹${kpis.avgOrderValue}`, color: 'var(--cream)', icon: TrendingUp },
              { label: 'Items Placed', val: kpis.totalItemsSold, color: 'var(--cream)', icon: ShoppingCart },
              { label: 'Net Profit', val: `₹${kpis.netProfit.toLocaleString()}`, color: '#10b981', icon: Percent },
              { label: 'Taxes Collected', val: `₹${kpis.taxCollected.toLocaleString()}`, color: '#a1a1aa', icon: FileText }
            ].map((card, i) => {
              const Icon = card.icon;
              return (
                <div key={i} style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'var(--text-muted)' }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{card.label}</span>
                    <Icon size={14} color="var(--text-muted)" />
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: card.color }}>{card.val}</div>
                </div>
              );
            })}
          </div>

          {/* Secondary KPI Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Payment Channel Breakdown
              </h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>UPI:</span>
                    <span style={{ fontWeight: 700, color: 'var(--gold)' }}>₹{kpis.upiCollection.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Cash:</span>
                    <span style={{ fontWeight: 700, color: '#f59e0b' }}>₹{kpis.cashCollection.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Card:</span>
                    <span style={{ fontWeight: 700, color: '#3b82f6' }}>₹{kpis.cardCollection.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ flexShrink: 0 }}>{renderPaymentDonut()}</div>
              </div>
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                Daily Performance Trend
              </h3>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {renderTrendChart()}
              </div>
            </div>
          </div>

          {/* Quick Stats & Peaks */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>
                Peak Sales Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Highest Day:</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{peakSales.highestDay} (₹{peakSales.highestDayRev.toLocaleString()})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Busiest Hour:</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{peakSales.highestHour} (₹{peakSales.highestHourRev.toLocaleString()})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Busiest Weekday:</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{peakSales.highestWeekday} (₹{peakSales.highestWeekdayRev.toLocaleString()})</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Highest Single Order:</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{peakSales.highestSingleOrderVal.toLocaleString()} ({peakSales.highestSingleOrderCustomer})</span>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <h3 style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', margin: 0 }}>
                Period-over-Period Performance
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Revenue Diff:</span>
                  <span style={{ color: trendAnalysis.revenueDiff >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    {trendAnalysis.revenueDiff >= 0 ? '+' : ''}₹{trendAnalysis.revenueDiff.toLocaleString()} ({trendAnalysis.revenueGrowth}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Orders Diff:</span>
                  <span style={{ color: trendAnalysis.orderDiff >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
                    {trendAnalysis.orderDiff >= 0 ? '+' : ''}{trendAnalysis.orderDiff} ({trendAnalysis.orderGrowth}%)
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Prior Period Revenue:</span>
                  <span style={{ color: 'var(--cream)' }}>₹{trendAnalysis.priorRevenue.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Current Period Revenue:</span>
                  <span style={{ color: 'var(--cream)' }}>₹{trendAnalysis.currentRevenue.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: SALES ── */}
      {activeTab === 'sales' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Daily Table */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: '0 0 16px 0' }}>Daily Sales Log</h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border-2)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Orders</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Revenue</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Items Sold</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Cash</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>UPI</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Avg Ticket</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Top Product</th>
                  </tr>
                </thead>
                <tbody>
                  {dailyData.map((d, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{d.date}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{d.orders}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>₹{d.revenue.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{d.items}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#f59e0b' }}>₹{d.cash.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--gold)' }}>₹{d.upi.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>₹{d.aov}</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{d.topItem}</td>
                    </tr>
                  ))}
                  {dailyData.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found for this range</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: PAYMENTS ── */}
      {activeTab === 'payments' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stacked comparison graph */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: 0 }}>
                Cash vs UPI Daily Collection
              </h3>
              <div style={{ display: 'flex', gap: '12px', fontSize: '0.65rem' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--gold)' }}>
                  <div style={{ width: '8px', height: '8px', background: 'var(--gold)' }} /> UPI
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b' }}>
                  <div style={{ width: '8px', height: '8px', background: '#f59e0b' }} /> Cash
                </span>
              </div>
            </div>
            {renderStackedBar()}
          </div>

          {/* Weekday analysis */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
                Revenue by Weekday
              </h3>
              {renderWeekdayBar()}
            </div>
            
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: 0 }}>
                Weekday Performance Rankings
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--dark-border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Most Profitable Day:</span>
                  <span style={{ color: '#10b981', fontWeight: 700 }}>{weekdayRankings.mostProfitable}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--dark-border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Least Profitable Day:</span>
                  <span style={{ color: '#ef4444', fontWeight: 700 }}>{weekdayRankings.leastProfitable}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--dark-border)', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Busiest (Most Orders):</span>
                  <span style={{ color: 'var(--gold)', fontWeight: 700 }}>{weekdayRankings.busiest}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '6px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Slowest (Least Orders):</span>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{weekdayRankings.slowest}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: PRODUCTS ── */}
      {activeTab === 'products' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top Products Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
                Top Selling Items
              </h3>
              {renderProductHorizontalBar()}
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
                Category Share
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {categoryData.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', borderBottom: '1px solid var(--dark-border)', paddingBottom: '6px' }}>
                    <span style={{ color: 'var(--cream)', fontWeight: 600 }}>{c.category}</span>
                    <span style={{ color: 'var(--gold)', fontWeight: 700 }}>₹{c.revenue.toLocaleString()} ({c.items} sold)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Data Table */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: 0 }}>
                Product Sales Audit
              </h3>
              {/* Search */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--void)', border: '1px solid var(--dark-border)', padding: '4px 8px', borderRadius: '4px' }}>
                <Search size={14} color="var(--text-muted)" style={{ marginRight: '6px' }} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: '0.75rem', outline: 'none', fontFamily: 'var(--font-sans)', width: '150px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border-2)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setProductSortField('name'); setProductSortAsc(!productSortAsc); }}>
                      Product Name <ArrowUpDown size={10} style={{ display: 'inline' }} />
                    </th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                    <th style={{ padding: '10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setProductSortField('qty'); setProductSortAsc(!productSortAsc); }}>
                      Units Sold <ArrowUpDown size={10} style={{ display: 'inline' }} />
                    </th>
                    <th style={{ padding: '10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setProductSortField('revenue'); setProductSortAsc(!productSortAsc); }}>
                      Revenue <ArrowUpDown size={10} style={{ display: 'inline' }} />
                    </th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Daily Avg</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Weekly Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{p.category}</td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700 }}>{p.qty}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>₹{p.revenue.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-secondary)' }}>{p.dailyAvg}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--text-secondary)' }}>{p.weeklyAvg}</td>
                    </tr>
                  ))}
                  {paginatedProducts.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No products matched your search</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {sortedProducts.length > productsPerPage && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '16px', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Page {productPage} of {Math.ceil(sortedProducts.length / productsPerPage)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    disabled={productPage === 1}
                    onClick={() => setProductPage(p => Math.max(1, p - 1))}
                    style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    disabled={productPage * productsPerPage >= sortedProducts.length}
                    onClick={() => setProductPage(p => p + 1)}
                    style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: CUSTOMERS ── */}
      {activeTab === 'customers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Stats Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Total Customers</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--cream)' }}>{customerData.totalCustomers}</span>
            </div>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Returning Customers</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981' }}>{customerData.returningCustomers}</span>
            </div>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>New Customers</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--gold)' }}>{customerData.newCustomers}</span>
            </div>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Avg Spender</span>
              <span style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--cream)' }}>₹{customerData.avgSpending}</span>
            </div>
          </div>

          {/* Customer Table */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: 0 }}>
                Customer Database
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--void)', border: '1px solid var(--dark-border)', padding: '4px 8px', borderRadius: '4px' }}>
                <Search size={14} color="var(--text-muted)" style={{ marginRight: '6px' }} />
                <input
                  type="text"
                  placeholder="Search customer name/phone..."
                  value={customerSearch}
                  onChange={(e) => { setCustomerSearch(e.target.value); setCustomerPage(1); }}
                  style={{ background: 'transparent', border: 'none', color: 'var(--cream)', fontSize: '0.75rem', outline: 'none', fontFamily: 'var(--font-sans)', width: '180px' }}
                />
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border-2)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px', textAlign: 'left', cursor: 'pointer' }} onClick={() => { setCustomerSortField('name'); setCustomerSortAsc(!customerSortAsc); }}>
                      Customer Name <ArrowUpDown size={10} style={{ display: 'inline' }} />
                    </th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setCustomerSortField('orders'); setCustomerSortAsc(!customerSortAsc); }}>
                      Total Bills <ArrowUpDown size={10} style={{ display: 'inline' }} />
                    </th>
                    <th style={{ padding: '10px', textAlign: 'right', cursor: 'pointer' }} onClick={() => { setCustomerSortField('spent'); setCustomerSortAsc(!customerSortAsc); }}>
                      Total Spent <ArrowUpDown size={10} style={{ display: 'inline' }} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedCustomers.map((c, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{c.name}</td>
                      <td style={{ padding: '10px', color: 'var(--text-secondary)' }}>{c.phone}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{c.orders}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>₹{Math.round(c.spent).toLocaleString()}</td>
                    </tr>
                  ))}
                  {paginatedCustomers.length === 0 && (
                    <tr>
                      <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No customers found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Customer pagination */}
            {sortedCustomers.length > customersPerPage && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px', marginTop: '16px', fontSize: '0.72rem' }}>
                <span style={{ color: 'var(--text-secondary)' }}>
                  Page {customerPage} of {Math.ceil(sortedCustomers.length / customersPerPage)}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    disabled={customerPage === 1}
                    onClick={() => setCustomerPage(p => Math.max(1, p - 1))}
                    style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    <ChevronLeft size={12} />
                  </button>
                  <button
                    disabled={customerPage * customersPerPage >= sortedCustomers.length}
                    onClick={() => setCustomerPage(p => p + 1)}
                    style={{ background: 'var(--dark-surface)', border: '1px solid var(--dark-border)', color: 'var(--cream)', padding: '4px 8px', cursor: 'pointer' }}
                  >
                    <ChevronRight size={12} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: EMPLOYEES ── */}
      {activeTab === 'employees' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
              Cashier &amp; Order Taker Log
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--dark-border-2)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Cashier ID / Email</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Bills Logged</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Total Revenue</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Average Ticket</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Highest Ticket</th>
                    <th style={{ padding: '10px', textAlign: 'right' }}>Lowest Ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeData.map((e, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                      <td style={{ padding: '10px', fontWeight: 600 }}>{e.name}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>{e.orders}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: 'var(--gold)', fontWeight: 700 }}>₹{e.revenue.toLocaleString()}</td>
                      <td style={{ padding: '10px', textAlign: 'right' }}>₹{e.avgBill}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#10b981' }}>₹{e.highestBill}</td>
                      <td style={{ padding: '10px', textAlign: 'right', color: '#ef4444' }}>₹{e.lowestBill}</td>
                    </tr>
                  ))}
                  {employeeData.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No employee order logs in this range</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: FORECAST ── */}
      {activeTab === 'forecast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Forecast Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid var(--gold)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold)' }}>
                <Brain size={16} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tomorrow&apos;s Projected Sales</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{predictions.tomorrowRev.toLocaleString()}</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                Weighted historical moving average for {now.toLocaleDateString(undefined, { weekday: 'long' })}.
              </p>
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
                <Sparkles size={16} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Week Estimate</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{predictions.nextWeekRev.toLocaleString()}</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                Expected sales volume over the next 7 business days.
              </p>
            </div>

            <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', borderLeft: '3px solid #3b82f6' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
                <TrendingUp size={16} />
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Next Month Forecast</span>
              </div>
              <div style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{predictions.nextMonthRev.toLocaleString()}</div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: 0 }}>
                30-day projection based on active sales trajectories.
              </p>
            </div>
          </div>

          {/* Inventory predictions */}
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: '0 0 16px 0' }}>
              AI Inventory &amp; Raw Material Estimates
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Ingredients consumption estimates for the next 7 days based on category transaction velocity:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Fresh Milk Needed', val: `${predictions.milkWeeklyLitres} Litres`, desc: 'For Shakes, Coffees, and Chai' },
                { label: 'Coffee Beans Needed', val: `${predictions.coffeeBeansWeeklyKg} Kg`, desc: 'Espressos, Cappuccinos & Lattes' },
                { label: 'Tea Powder Needed', val: `${predictions.teaPowderWeeklyKg} Kg`, desc: 'Traditional Chai & Special Teas' },
                { label: 'Bread/Burger Buns', val: `${predictions.breadWeeklyUnits} Units`, desc: 'Burgers, Waffles, and Sandwiches' }
              ].map((inv, idx) => (
                <div key={idx} style={{ background: 'var(--void)', border: '1px solid var(--dark-border)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '0.62rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>{inv.label}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)' }}>{inv.val}</span>
                  <span style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{inv.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: REPORTS EXPORTS ── */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ background: 'var(--dark-card)', border: '1px solid var(--dark-border)', padding: '20px', borderRadius: '4px' }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--cream)', textTransform: 'uppercase', margin: '0 0 8px 0' }}>
              Export Reporting Engine
            </h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Download filtered audit logs, customer datasets, or product performance reports directly:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {[
                { title: 'Daily Sales Ledger', desc: 'CSV containing daily revenue, orders count, payment types, and top sold items.', type: 'sales' },
                { title: 'Product Audit Log', desc: 'CSV breakdown of product quantities sold, total sales revenue, and velocity.', type: 'products' },
                { title: 'Customer Database', desc: 'CSV customer ledger including total bills, spending sum, and phone contacts.', type: 'customers' }
              ].map((rep, idx) => (
                <div key={idx} style={{ background: 'var(--void)', border: '1px solid var(--dark-border)', padding: '20px', display: 'flex', flexDirection: 'column', justifyItems: 'space-between', gap: '16px' }}>
                  <div>
                    <h4 style={{ fontSize: '0.8.0rem', fontWeight: 700, color: 'var(--cream)', margin: '0 0 6px 0' }}>{rep.title}</h4>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.4 }}>{rep.desc}</p>
                  </div>
                  <button
                    onClick={() => exportCSV(rep.type as any)}
                    style={{
                      width: '100%', padding: '10px 0', background: 'var(--gold)', border: 'none', color: 'var(--black)',
                      fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    <Download size={12} /> Download CSV
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
