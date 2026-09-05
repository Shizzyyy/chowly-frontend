from django.contrib import admin

from .models import (
    Restaurant,
    Customer,
    Waiter,
    Chef,
    Bartender,
    MenuItem,
    Order,
    OrderItem,
    Complaint,
    Payment,
    Notification,
)


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = (
        "restaurant_id",
        "name",
        "phone_number",
        "email",
    )
    search_fields = (
        "name",
        "email",
        "phone_number",
    )


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = (
        "customer_id",
        "name",
        "email",
        "phone_number",
        "user",
    )
    search_fields = (
        "name",
        "email",
        "phone_number",
        "user__username",
    )


@admin.register(Waiter)
class WaiterAdmin(admin.ModelAdmin):
    list_display = (
        "waiter_id",
        "name",
        "user",
        "restaurant",
    )
    list_filter = ("restaurant",)
    search_fields = (
        "name",
        "phone_number",
        "user__username",
    )


@admin.register(Chef)
class ChefAdmin(admin.ModelAdmin):
    list_display = (
        "chef_id",
        "name",
        "phone_number",
        "restaurant",
    )
    list_filter = ("restaurant",)
    search_fields = (
        "name",
        "phone_number",
    )


@admin.register(Bartender)
class BartenderAdmin(admin.ModelAdmin):
    list_display = (
        "bartender_id",
        "name",
        "phone_number",
        "restaurant",
    )
    list_filter = ("restaurant",)
    search_fields = (
        "name",
        "phone_number",
    )


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = (
        "menu_item_id",
        "name",
        "item_type",
        "price",
        "preparation_time",
        "popular",
        "restaurant",
    )
    list_filter = (
        "item_type",
        "popular",
        "restaurant",
    )
    search_fields = (
        "name",
        "description",
        "category",
    )


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        "order_id",
        "customer",
        "restaurant",
        "table_number",
        "order_status",
        "order_waiting_time",
        "is_paid",
        "order_date",
    )
    list_filter = (
        "order_status",
        "is_paid",
        "restaurant",
    )
    search_fields = (
        "customer__name",
        "customer__user__username",
    )
    readonly_fields = (
        "order_date",
        "preparing_started_at",
        "served_at",
        "completed_at",
    )


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = (
        "order_item_id",
        "order",
        "menu_item",
        "quantity",
        "subtotal",
    )
    search_fields = (
        "order__customer__name",
        "menu_item__name",
    )


@admin.register(Complaint)
class ComplaintAdmin(admin.ModelAdmin):
    list_display = (
        "complaint_id",
        "order",
        "rating",
        "complaint_date",
    )
    list_filter = ("rating",)
    search_fields = (
        "complaint_details",
        "order__customer__name",
    )
    readonly_fields = ("complaint_date",)


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "payment_id",
        "order",
        "payment_amount",
        "payment_method",
        "is_paid",
        "payment_date",
    )
    list_filter = (
        "payment_method",
        "is_paid",
    )
    readonly_fields = ("payment_date",)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "notification_id",
        "recipient",
        "order",
        "notification_type",
        "is_read",
        "created_at",
    )
    list_filter = (
        "notification_type",
        "is_read",
    )
    search_fields = (
        "recipient__username",
        "message",
    )
    readonly_fields = ("created_at",)
