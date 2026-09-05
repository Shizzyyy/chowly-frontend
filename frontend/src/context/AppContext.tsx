import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import type {
  MenuItem,
  Order,
  OrderItem,
  Complaint,
  Staff,
  MenuType,
  OrderStatus,
  PaymentMethod,
} from '@/types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:8000/api';

export type Role = 'customer' | 'waiter';

interface CartLine {
  item: MenuItem;
  quantity: number;
}

interface AppUser {
  username: string;
  role: Role;
  customerId?: string;
  waiterId?: string;
  name: string;
  restaurantId?: string;
}

export interface AppNotification {
  id: string;
  orderId: string;
  message: string;
  notificationType: 'order' | 'payment' | 'complaint';
  isRead: boolean;
  createdAt: number;
}

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  tableNumber: number;
  setTableNumber: (n: number) => void;

  user: AppUser | null;
  loading: boolean;

  login: (
    username: string,
    password: string,
    selectedRole: Role,
  ) => Promise<void>;

  logout: () => Promise<void>;

  menuItems: MenuItem[];

  chefs: Staff[];
  bartenders: Staff[];
  waiters: Staff[];

  cart: CartLine[];
  addToCart: (item: MenuItem, qty?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQty: (itemId: string, qty: number) => void;
  clearCart: () => void;

  cartCount: number;
  cartTotal: number;
  cartPrepTime: number;

  orders: Order[];

  notifications: AppNotification[];
  markNotificationRead: (notificationId: string) => void;
  clearNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  refreshNotifications: () => Promise<void>;

  placeOrder: () => Promise<Order>;

  acceptOrder: (orderId: string) => Promise<void>;

  assignStaff: (
    orderId: string,
    chefId?: string,
    bartenderId?: string,
  ) => Promise<void>;

  markReady: (orderId: string) => Promise<void>;

  markServed: (orderId: string) => Promise<void>;

  submitPayment: (
    orderId: string,
    paymentMethod: PaymentMethod,
  ) => Promise<void>;

  confirmPayment: (orderId: string) => Promise<void>;

  submitComplaint: (
    orderId: string,
    complaint: Complaint,
  ) => Promise<void>;

  refreshOrders: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

interface ApiMenuItem {
  menu_item_id: number;
  name: string;
  item_type: 'food' | 'drinks';
  description: string;
  price: string | number;
  preparation_time: number;
  image: string;
  category: string;
  popular: boolean;
  restaurant: number;
}

interface ApiOrderItem {
  order_item_id: number;
  subtotal: string | number;
  quantity: number;
  order: number;
  menu_item: number;
  menu_item_detail?: ApiMenuItem;
}

interface ApiOrder {
  order_id: number;
  order_date: string;
  table_number: number;
  order_waiting_time: number;

  order_status:
    | 'pending'
    | 'accepted'
    | 'preparing'
    | 'ready'
    | 'served'
    | 'completed'
    | 'cancelled';

  accepted_at?: string | null;
  preparing_started_at: string | null;
  served_at: string | null;
  completed_at: string | null;
  is_paid: boolean;
  payment_submitted: boolean;

  customer: number;
  restaurant: number;
  waiter: number | null;
  chef: number | null;
  bartender: number | null;

  order_items: ApiOrderItem[];
  total_amount: number;
}

interface ApiChef {
  chef_id: number;
  name: string;
  phone_number?: string;
  restaurant: number;
}

interface ApiBartender {
  bartender_id: number;
  name: string;
  phone_number?: string;
  restaurant: number;
}

interface ApiWaiter {
  waiter_id: number;
  name: string;
  phone_number?: string;
  restaurant: number;
}

interface ApiComplaint {
  complaint_id: number;
  complaint_details: string;
  rating: number | null;
  complaint_date: string;
  order: number;
}

interface ApiNotification {
  notification_id: number;
  order: number;
  message: string;
  notification_type:
    | 'order'
    | 'payment'
    | 'complaint';
  is_read: boolean;
  created_at: string;
}

interface ApiCustomerLogin {
  username: string;
  role: 'customer';
  customer_id: number;
  name: string;
}

interface ApiWaiterLogin {
  username: string;
  role: 'waiter';
  waiter_id: number;
  name: string;
  restaurant_id: number;
}

interface ApiSession {
  authenticated: boolean;
  username?: string;
  role?: Role;
  customer_id?: number;
  waiter_id?: number;
  name?: string;
  restaurant_id?: number;
}

function getErrorMessage(data: unknown): string {
  if (typeof data === 'string') {
    return data;
  }

  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>;

    if (typeof obj.detail === 'string') {
      return obj.detail;
    }

    for (const value of Object.values(obj)) {
      if (Array.isArray(value) && value.length > 0) {
        return String(value[0]);
      }

      if (typeof value === 'string') {
        return value;
      }
    }
  }

  return 'Something went wrong. Please try again.';
}

async function getCsrfToken(): Promise<string> {
  const response = await fetch(
    `${API_BASE}/csrf/`,
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error(
      'Unable to initialize secure session.',
    );
  }

  const cookies = document.cookie
    .split(';')
    .map((cookie) => cookie.trim());

  const csrfCookie = cookies.find((cookie) =>
    cookie.startsWith('csrftoken='),
  );

  if (!csrfCookie) {
    throw new Error(
      'CSRF token was not provided by the server.',
    );
  }

  return decodeURIComponent(
    csrfCookie.split('=')[1],
  );
}

async function apiFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const method = (
    options.method ?? 'GET'
  ).toUpperCase();

  const headers = new Headers(
    options.headers,
  );

  if (
    options.body &&
    !headers.has('Content-Type')
  ) {
    headers.set(
      'Content-Type',
      'application/json',
    );
  }

  if (
    !['GET', 'HEAD', 'OPTIONS'].includes(
      method,
    )
  ) {
    const csrfToken =
      await getCsrfToken();

    headers.set(
      'X-CSRFToken',
      csrfToken,
    );
  }

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
}

async function apiJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await apiFetch(
    path,
    options,
  );

  const text = await response.text();

  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(data),
    );
  }

  return data as T;
}

function mapMenuItem(
  item: ApiMenuItem,
): MenuItem {
  return {
    id: String(item.menu_item_id),
    name: item.name,
    description: item.description ?? '',
    price: Number(item.price),
    prepTime: item.preparation_time,
    image: item.image ?? '',
    type: item.item_type as MenuType,
    category: item.category ?? '',
    popular: Boolean(item.popular),
  };
}

function mapOrderStatus(
  status: ApiOrder['order_status'],
): OrderStatus {
  if (status === 'cancelled') {
    return 'pending';
  }

  return status;
}

function mapOrderItem(
  item: ApiOrderItem,
  menuLookup: Map<number, MenuItem>,
): OrderItem {
  const menuItem =
    menuLookup.get(item.menu_item);

  return {
    itemId: String(item.menu_item),

    name:
      menuItem?.name ??
      `Menu item #${item.menu_item}`,

    price:
      menuItem?.price ??
      Number(item.subtotal) /
        Math.max(item.quantity, 1),

    quantity: item.quantity,

    type:
      menuItem?.type ?? 'food',
  };
}

function mapOrder(
  order: ApiOrder,
  menuLookup: Map<number, MenuItem>,
  complaint?: ApiComplaint,
): Order {
  return {
    id: String(order.order_id),

    tableNumber:
      order.table_number,

    items:
      order.order_items.map(
        (item) =>
          mapOrderItem(
            item,
            menuLookup,
          ),
      ),

    status:
      mapOrderStatus(
        order.order_status,
      ),

    totalPrepTime:
      order.order_waiting_time,

    totalAmount:
      Number(order.total_amount),

    createdAt:
      new Date(
        order.order_date,
      ).getTime(),

    acceptedAt:
      order.accepted_at
        ? new Date(
            order.accepted_at,
          ).getTime()
        : undefined,

    preparingStartedAt:
      order.preparing_started_at
        ? new Date(
            order.preparing_started_at,
          ).getTime()
        : undefined,

    servedAt:
      order.served_at
        ? new Date(
            order.served_at,
          ).getTime()
        : undefined,

    completedAt:
      order.completed_at
        ? new Date(
            order.completed_at,
          ).getTime()
        : undefined,

    paidAt:
      order.completed_at
        ? new Date(
            order.completed_at,
          ).getTime()
        : undefined,

    isPaid:
      Boolean(order.is_paid),

    paymentSubmitted:
      Boolean(order.payment_submitted),

    chefId:
      order.chef
        ? String(order.chef)
        : undefined,

    bartenderId:
      order.bartender
        ? String(order.bartender)
        : undefined,

    waiterId:
      order.waiter
        ? String(order.waiter)
        : undefined,

    complaint:
      complaint
        ? {
            message:
              complaint.complaint_details,

            rating:
              complaint.rating ?? 0,

            createdAt:
              new Date(
                complaint.complaint_date,
              ).getTime(),
          }
        : undefined,
  };
}

function mapNotification(
  notification: ApiNotification,
): AppNotification {
  return {
    id: String(
      notification.notification_id,
    ),

    orderId: String(
      notification.order,
    ),

    message:
      notification.message,

    notificationType:
      notification.notification_type,

    isRead:
      Boolean(
        notification.is_read,
      ),

    createdAt:
      new Date(
        notification.created_at,
      ).getTime(),
  };
}

function getClearedNotificationStorageKey(
  username: string,
): string {
  return `chowly-cleared-notifications-${username}`;
}

function getClearedNotificationIds(
  username: string,
): Set<string> {
  try {
    const stored =
      window.localStorage.getItem(
        getClearedNotificationStorageKey(
          username,
        ),
      );

    if (!stored) {
      return new Set();
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    return new Set(
      parsed.map(String),
    );
  } catch {
    return new Set();
  }
}

function saveClearedNotificationIds(
  username: string,
  ids: Set<string>,
): void {
  try {
    window.localStorage.setItem(
      getClearedNotificationStorageKey(
        username,
      ),
      JSON.stringify(
        Array.from(ids),
      ),
    );
  } catch {
    // Ignore localStorage failures.
  }
}

export function AppProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [role, setRole] =
    useState<Role>('customer');

  const [tableNumber, setTableNumber] =
    useState(7);

  const [user, setUser] =
    useState<AppUser | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [menuItems, setMenuItems] =
    useState<MenuItem[]>([]);

  const [chefs, setChefs] =
    useState<Staff[]>([]);

  const [bartenders, setBartenders] =
    useState<Staff[]>([]);

  const [waiters, setWaiters] =
    useState<Staff[]>([]);

  const [cart, setCart] =
    useState<CartLine[]>([]);

  const [orders, setOrders] =
    useState<Order[]>([]);

  const [notifications, setNotifications] =
    useState<AppNotification[]>([]);

  const loadMenu =
    useCallback(async () => {
      try {
        const data =
          await apiJson<ApiMenuItem[]>(
            '/menu/',
          );

        setMenuItems(
          data.map(mapMenuItem),
        );
      } catch (error) {
        console.error(
          'Failed to load menu:',
          error,
        );
      }
    }, []);

  const loadStaff =
    useCallback(async () => {
      try {
        const [
          chefData,
          bartenderData,
          waiterData,
        ] = await Promise.all([
          apiJson<ApiChef[]>(
            '/chefs/',
          ),
          apiJson<ApiBartender[]>(
            '/bartenders/',
          ),
          apiJson<ApiWaiter[]>(
            '/waiters/',
          ),
        ]);

        setChefs(
          chefData.map((chef) => ({
            id: String(
              chef.chef_id,
            ),
            name: chef.name,
            role: 'chef',
          })),
        );

        setBartenders(
          bartenderData.map(
            (bartender) => ({
              id: String(
                bartender.bartender_id,
              ),
            name: bartender.name,
              role: 'bartender',
            })),
        );

        setWaiters(
          waiterData.map((waiter) => ({
            id: String(
              waiter.waiter_id,
            ),
            name: waiter.name,
            role: 'waiter',
          })),
        );
      } catch (error) {
        console.error(
          'Failed to load staff:',
          error,
        );
      }
    }, []);

  const loadSession =
    useCallback(async () => {
      try {
        const session =
          await apiJson<ApiSession>(
            '/session/',
          );

        if (
          !session.authenticated ||
          !session.role
        ) {
          setUser(null);
          return;
        }

        const nextUser: AppUser = {
          username:
            session.username ?? '',

          role: session.role,

          customerId:
            session.customer_id
              ? String(
                  session.customer_id,
                )
              : undefined,

          waiterId:
            session.waiter_id
              ? String(
                  session.waiter_id,
                )
              : undefined,

          name:
            session.name ??
            session.username ??
            '',

          restaurantId:
            session.restaurant_id
              ? String(
                  session.restaurant_id,
                )
              : undefined,
        };

        setUser(nextUser);
        setRole(session.role);
      } catch (error) {
        console.error(
          'Failed to load session:',
          error,
        );

        setUser(null);
      }
    }, []);

  useEffect(() => {
    const initialize =
      async () => {
        await Promise.all([
          loadMenu(),
          loadStaff(),
          loadSession(),
        ]);

        setLoading(false);
      };

    void initialize();
  }, [
    loadMenu,
    loadStaff,
    loadSession,
  ]);

  const refreshOrders =
    useCallback(async () => {
      if (!user) {
        setOrders([]);
        return;
      }

      try {
        const [
          orderData,
          complaintData,
        ] = await Promise.all([
          apiJson<ApiOrder[]>(
            '/orders/',
          ),
          apiJson<ApiComplaint[]>(
            '/complaints/',
          ),
        ]);

        const menuLookup =
          new Map(
            menuItems.map((item) => [
              Number(item.id),
              item,
            ]),
          );

        const complaintsByOrder =
          new Map<number, ApiComplaint>();

        complaintData.forEach(
          (complaint) => {
            complaintsByOrder.set(
              complaint.order,
              complaint,
            );
          },
        );

        setOrders(
          orderData.map((order) =>
            mapOrder(
              order,
              menuLookup,
              complaintsByOrder.get(
                order.order_id,
              ),
            ),
          ),
        );
      } catch (error) {
        console.error(
          'Failed to load orders:',
          error,
        );
      }
    }, [
      user,
      menuItems,
    ]);

  const refreshNotifications =
    useCallback(async () => {
      if (!user) {
        setNotifications([]);
        return;
      }

      try {
        const data =
          await apiJson<ApiNotification[]>(
            '/notifications/',
          );

        const clearedIds =
          getClearedNotificationIds(
            user.username,
          );

        setNotifications(
          data
            .map(mapNotification)
            .filter(
              (notification) =>
                !clearedIds.has(
                  notification.id,
                ),
            )
            .sort(
              (a, b) =>
                b.createdAt -
                a.createdAt,
            ),
        );
      } catch (error) {
        console.error(
          'Failed to load notifications:',
          error,
        );
      }
    }, [user]);

  useEffect(() => {
    if (
      !user ||
      menuItems.length === 0
    ) {
      return;
    }

    void refreshOrders();

    const interval =
      window.setInterval(() => {
        void refreshOrders();
      }, 5000);

    return () =>
      window.clearInterval(
        interval,
      );
  }, [
    user,
    menuItems,
    refreshOrders,
  ]);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    void refreshNotifications();

    const interval =
      window.setInterval(() => {
        void refreshNotifications();
      }, 5000);

    return () =>
      window.clearInterval(
        interval,
      );
  }, [
    user,
    refreshNotifications,
  ]);

  const markNotificationRead =
    useCallback(
      (notificationId: string) => {
        setNotifications((prev) =>
          prev.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification,
          ),
        );
      },
      [],
    );

  const clearNotification =
    useCallback(
      (notificationId: string) => {
        if (!user) {
          return;
        }

        const clearedIds =
          getClearedNotificationIds(
            user.username,
          );

        clearedIds.add(
          notificationId,
        );

        saveClearedNotificationIds(
          user.username,
          clearedIds,
        );

        setNotifications((prev) =>
          prev.filter(
            (notification) =>
              notification.id !==
              notificationId,
          ),
        );
      },
      [user],
    );

  const clearAllNotifications =
    useCallback(() => {
      if (!user) {
        return;
      }

      const currentNotificationIds =
        notifications.map(
          (notification) =>
            notification.id,
        );

      if (
        currentNotificationIds.length === 0
      ) {
        return;
      }

      const clearedIds =
        getClearedNotificationIds(
          user.username,
        );

      currentNotificationIds.forEach(
        (notificationId) => {
          clearedIds.add(
            notificationId,
          );
        },
      );

      saveClearedNotificationIds(
        user.username,
        clearedIds,
      );

      setNotifications([]);
    }, [
      user,
      notifications,
    ]);

  const login =
    useCallback(
      async (
        username: string,
        password: string,
        selectedRole: Role,
      ) => {
        const endpoint =
          selectedRole === 'customer'
            ? '/customer-login/'
            : '/waiter-login/';

        const data =
          await apiJson<
            ApiCustomerLogin |
            ApiWaiterLogin
          >(endpoint, {
            method: 'POST',
            body: JSON.stringify({
              username,
              password,
            }),
          });

        const nextUser: AppUser =
          data.role === 'customer'
            ? {
                username:
                  data.username,
                role: 'customer',
                customerId:
                  String(
                    data.customer_id,
                  ),
                name: data.name,
              }
            : {
                username:
                  data.username,
                role: 'waiter',
                waiterId:
                  String(
                    data.waiter_id,
                  ),
                name: data.name,
                restaurantId:
                  String(
                    data.restaurant_id,
                  ),
              };

        setUser(nextUser);
        setRole(nextUser.role);

        if (
          nextUser.role ===
          'customer'
        ) {
          setTableNumber(7);
        }

        await Promise.all([
          loadMenu(),
          loadStaff(),
        ]);
      },
      [
        loadMenu,
        loadStaff,
      ],
    );

  const logout =
    useCallback(async () => {
      try {
        await apiJson(
          '/logout/',
          {
            method: 'POST',
          },
        );
      } finally {
        setUser(null);
        setOrders([]);
        setNotifications([]);
        setCart([]);
        setRole('customer');
      }
    }, []);

  const addToCart =
    useCallback(
      (
        item: MenuItem,
        qty = 1,
      ) => {
        setCart((prev) => {
          const existing =
            prev.find(
              (line) =>
                line.item.id ===
                item.id,
            );

          if (existing) {
            return prev.map(
              (line) =>
                line.item.id ===
                item.id
                  ? {
                      ...line,
                      quantity:
                        line.quantity +
                        qty,
                    }
                  : line,
            );
          }

          return [
            ...prev,
            {
              item,
              quantity: qty,
            },
          ];
        });
      },
      [],
    );

  const removeFromCart =
    useCallback(
      (itemId: string) => {
        setCart((prev) =>
          prev.filter(
            (line) =>
              line.item.id !==
              itemId,
          ),
        );
      },
      [],
    );

  const updateCartQty =
    useCallback(
      (
        itemId: string,
        qty: number,
      ) => {
        setCart((prev) =>
          qty <= 0
            ? prev.filter(
                (line) =>
                  line.item.id !==
                  itemId,
              )
            : prev.map(
                (line) =>
                  line.item.id ===
                  itemId
                    ? {
                        ...line,
                        quantity: qty,
                      }
                    : line,
              ),
        );
      },
      [],
    );

  const clearCart =
    useCallback(() => {
      setCart([]);
    }, []);

  const cartCount =
    useMemo(
      () =>
        cart.reduce(
          (sum, line) =>
            sum + line.quantity,
          0,
        ),
      [cart],
    );

  const cartTotal =
    useMemo(
      () =>
        cart.reduce(
          (sum, line) =>
            sum +
            line.item.price *
              line.quantity,
          0,
        ),
      [cart],
    );

  const cartPrepTime =
    useMemo(() => {
      if (cart.length === 0) {
        return 0;
      }

      const foodTime =
        Math.max(
          0,
          ...cart
            .filter(
              (line) =>
                line.item.type ===
                'food',
            )
            .map(
              (line) =>
                line.item.prepTime,
            ),
        );

      const drinkTime =
        Math.max(
          0,
          ...cart
            .filter(
              (line) =>
                line.item.type ===
                'drinks',
            )
            .map(
              (line) =>
                line.item.prepTime,
            ),
        );

      return (
        foodTime + drinkTime
      );
    }, [cart]);

  const placeOrder =
    useCallback(
      async (): Promise<Order> => {
        if (
          !user ||
          user.role !==
            'customer'
        ) {
          throw new Error(
            'Please log in as a customer before placing an order.',
          );
        }

        if (cart.length === 0) {
          throw new Error(
            'Your cart is empty.',
          );
        }

        const restaurantId =
          user.restaurantId
            ? Number(
                user.restaurantId,
              )
            : 2;

        const payload = {
          table_number:
            tableNumber,

          restaurant:
            restaurantId,

          items: cart.map(
            (line) => ({
              menu_item:
                Number(
                  line.item.id,
                ),
              quantity:
                line.quantity,
            }),
          ),
        };

        const apiOrder =
          await apiJson<ApiOrder>(
            '/orders/',
            {
              method: 'POST',
              body: JSON.stringify(
                payload,
              ),
            },
          );

        const menuLookup =
          new Map(
            menuItems.map((item) => [
              Number(item.id),
              item,
            ]),
          );

        const order =
          mapOrder(
            apiOrder,
            menuLookup,
          );

        setOrders((prev) => [
          order,
          ...prev.filter(
            (existing) =>
              existing.id !==
              order.id,
          ),
        ]);

        setCart([]);

        void refreshNotifications();

        return order;
      },
      [
        cart,
        menuItems,
        tableNumber,
        user,
        refreshNotifications,
      ],
    );

  const updateOrderFromApi =
    useCallback(
      async (
        apiOrder: ApiOrder,
      ) => {
        const menuLookup =
          new Map(
            menuItems.map((item) => [
              Number(item.id),
              item,
            ]),
          );

        const updatedOrder =
          mapOrder(
            apiOrder,
            menuLookup,
          );

        setOrders((prev) =>
          prev.map((order) =>
            order.id ===
            updatedOrder.id
              ? updatedOrder
              : order,
          ),
        );

        void refreshNotifications();

        return updatedOrder;
      },
      [
        menuItems,
        refreshNotifications,
      ],
    );

  const acceptOrder =
    useCallback(
      async (
        orderId: string,
      ) => {
        const apiOrder =
          await apiJson<ApiOrder>(
            `/orders/${orderId}/accept/`,
            {
              method: 'POST',
            },
          );

        await updateOrderFromApi(
          apiOrder,
        );
      },
      [updateOrderFromApi],
    );

  const assignStaff =
    useCallback(
      async (
        orderId: string,
        chefId?: string,
        bartenderId?: string,
      ) => {
        const body: Record<
          string,
          number
        > = {};

        if (chefId) {
          body.chef =
            Number(chefId);
        }

        if (bartenderId) {
          body.bartender =
            Number(
              bartenderId,
            );
        }

        if (
          Object.keys(body)
            .length === 0
        ) {
          throw new Error(
            'Select a chef or bartender before confirming the assignment.',
          );
        }

        const apiOrder =
          await apiJson<ApiOrder>(
            `/orders/${orderId}/assign/`,
            {
              method: 'POST',
              body: JSON.stringify(
                body,
              ),
            },
          );

        await updateOrderFromApi(
          apiOrder,
        );
      },
      [updateOrderFromApi],
    );

  const markReady =
    useCallback(
      async (
        orderId: string,
      ) => {
        const apiOrder =
          await apiJson<ApiOrder>(
            `/orders/${orderId}/ready/`,
            {
              method: 'POST',
            },
          );

        await updateOrderFromApi(
          apiOrder,
        );
      },
      [updateOrderFromApi],
    );

  const markServed =
    useCallback(
      async (
        orderId: string,
      ) => {
        const apiOrder =
          await apiJson<ApiOrder>(
            `/orders/${orderId}/serve/`,
            {
              method: 'POST',
            },
          );

        await updateOrderFromApi(
          apiOrder,
        );
      },
      [updateOrderFromApi],
    );

  const submitPayment =
    useCallback(
      async (
        orderId: string,
        paymentMethod: PaymentMethod,
      ) => {
        const order =
          orders.find(
            (item) =>
              item.id === orderId,
          );

        if (!order) {
          throw new Error(
            'Order not found.',
          );
        }

        if (
          order.status !==
          'served'
        ) {
          throw new Error(
            'Payment is only available after the order has been served.',
          );
        }

        if (order.isPaid) {
          throw new Error(
            'This order has already been paid.',
          );
        }

        await apiJson(
          '/payments/',
          {
            method: 'POST',
            body: JSON.stringify({
              order:
                Number(orderId),

              payment_amount:
                order.totalAmount.toFixed(
                  2,
                ),

              payment_method:
                paymentMethod,
            }),
          },
        );

        await refreshOrders();
        await refreshNotifications();
      },
      [
        orders,
        refreshOrders,
        refreshNotifications,
      ],
    );

  const confirmPayment =
    useCallback(
      async (
        orderId: string,
      ) => {
        const apiOrder =
          await apiJson<ApiOrder>(
            `/orders/${orderId}/confirm-payment/`,
            {
              method: 'POST',
            },
          );

        await updateOrderFromApi(
          apiOrder,
        );

        await refreshOrders();
        await refreshNotifications();
      },
      [
        updateOrderFromApi,
        refreshOrders,
        refreshNotifications,
      ],
    );

  const submitComplaint =
    useCallback(
      async (
        orderId: string,
        complaint: Complaint,
      ) => {
        const order =
          orders.find(
            (item) =>
              item.id === orderId,
          );

        if (!order) {
          throw new Error(
            'Order not found.',
          );
        }

        if (
          order.status !==
          'preparing'
        ) {
          throw new Error(
            'A complaint can only be submitted while the order is being prepared.',
          );
        }

        const preparingStartedAt =
          order.preparingStartedAt;

        if (
          !preparingStartedAt
        ) {
          throw new Error(
            'Preparation start time is not available yet.',
          );
        }

        const elapsedMinutes =
          Math.floor(
            (Date.now() -
              preparingStartedAt) /
              60000,
          );

        if (
          elapsedMinutes < 30
        ) {
          throw new Error(
            'A complaint can only be submitted after 30 minutes of preparation.',
          );
        }

        await apiJson<ApiComplaint>(
          '/complaints/',
          {
            method: 'POST',
            body: JSON.stringify({
              order:
                Number(orderId),

              complaint_details:
                complaint.message,

              rating:
                complaint.rating,
            }),
          },
        );

        await refreshOrders();
        await refreshNotifications();
      },
      [
        orders,
        refreshOrders,
        refreshNotifications,
      ],
    );

  const value: AppState = {
    role,
    setRole,

    tableNumber,
    setTableNumber,

    user,
    loading,
    login,
    logout,

    menuItems,

    chefs,
    bartenders,
    waiters,

    cart,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,

    cartCount,
    cartTotal,
    cartPrepTime,

    orders,

    notifications,
    markNotificationRead,
    clearNotification,
    clearAllNotifications,
    refreshNotifications,

    placeOrder,
    acceptOrder,
    assignStaff,
    markReady,
    markServed,
    submitPayment,
    confirmPayment,
    submitComplaint,

    refreshOrders,
  };

  return (
    <AppContext.Provider
      value={value}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx =
    useContext(AppContext);

  if (!ctx) {
    throw new Error(
      'useApp must be used within AppProvider',
    );
  }

  return ctx;
}

export function getStaffName(
  staffId?: string,
  staffList: Staff[] = [],
): string {
  if (!staffId) {
    return 'Unassigned';
  }

  return (
    staffList.find(
      (staff) =>
        staff.id === staffId,
    )?.name ??
    'Unassigned'
  );
}
