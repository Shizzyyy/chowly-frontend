from django.urls import path

from .views import (
    customer_login_view,
    customer_signup_view,
    waiter_login_view,
    logout_view,
    session_view,
    csrf_view,
    accept_order_view,
    assign_order_staff_view,
    mark_order_ready_view,
    serve_order_view,
    confirm_payment_view,
    RestaurantListCreateView,
    CustomerListView,
    WaiterListView,
    ChefListView,
    BartenderListView,
    MenuItemListCreateView,
    MenuItemDetailView,
    OrderListCreateView,
    OrderDetailView,
    OrderItemListCreateView,
    OrderItemDetailView,
    ComplaintListCreateView,
    ComplaintDetailView,
    OrderRatingView,
    PaymentListCreateView,
    PaymentDetailView,
    NotificationListView,
)


urlpatterns = [
    # Authentication
    path(
        "customer-login/",
        customer_login_view,
        name="customer-login",
    ),
    path(
        "customer-signup/",
        customer_signup_view,
        name="customer-signup",
    ),
    path(
        "waiter-login/",
        waiter_login_view,
        name="waiter-login",
    ),
    path(
        "logout/",
        logout_view,
        name="logout",
    ),
    path(
        "session/",
        session_view,
        name="session",
    ),
    path(
        "csrf/",
        csrf_view,
        name="csrf",
    ),

    # Restaurant and staff
    path(
        "restaurants/",
        RestaurantListCreateView.as_view(),
        name="restaurant-list",
    ),
    path(
        "customers/",
        CustomerListView.as_view(),
        name="customer-list",
    ),
    path(
        "waiters/",
        WaiterListView.as_view(),
        name="waiter-list",
    ),
    path(
        "chefs/",
        ChefListView.as_view(),
        name="chef-list",
    ),
    path(
        "bartenders/",
        BartenderListView.as_view(),
        name="bartender-list",
    ),

    # Menu
    path(
        "menu/",
        MenuItemListCreateView.as_view(),
        name="menu-list",
    ),
    path(
        "menu/<int:pk>/",
        MenuItemDetailView.as_view(),
        name="menu-detail",
    ),

    # Orders
    path(
        "orders/",
        OrderListCreateView.as_view(),
        name="order-list",
    ),
    path(
        "orders/<int:pk>/",
        OrderDetailView.as_view(),
        name="order-detail",
    ),
    path(
        "orders/<int:pk>/accept/",
        accept_order_view,
        name="order-accept",
    ),
    path(
        "orders/<int:pk>/assign/",
        assign_order_staff_view,
        name="order-assign",
    ),
    path(
        "orders/<int:pk>/ready/",
        mark_order_ready_view,
        name="order-ready",
    ),
    path(
        "orders/<int:pk>/serve/",
        serve_order_view,
        name="order-serve",
    ),
    path(
        "orders/<int:pk>/confirm-payment/",
        confirm_payment_view,
        name="order-confirm-payment",
    ),
    path(
        "orders/<int:pk>/rating/",
        OrderRatingView.as_view(),
        name="order-rating",
    ),

    # Order items
    path(
        "order-items/",
        OrderItemListCreateView.as_view(),
        name="order-item-list",
    ),
    path(
        "order-items/<int:pk>/",
        OrderItemDetailView.as_view(),
        name="order-item-detail",
    ),

    # Complaints
    path(
        "complaints/",
        ComplaintListCreateView.as_view(),
        name="complaint-list",
    ),
    path(
        "complaints/<int:pk>/",
        ComplaintDetailView.as_view(),
        name="complaint-detail",
    ),

    # Payments
    path(
        "payments/",
        PaymentListCreateView.as_view(),
        name="payment-list",
    ),
    path(
        "payments/<int:pk>/",
        PaymentDetailView.as_view(),
        name="payment-detail",
    ),

    # Notifications
    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notification-list",
    ),
]
