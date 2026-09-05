from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.db import transaction
from django.middleware.csrf import get_token
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import ensure_csrf_cookie

from rest_framework import generics, serializers, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

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

from .permissions import (
    MenuPermission,
    WaiterPermission,
    OrderPermission,
    OrderDetailPermission,
    OrderItemPermission,
    OrderItemDetailPermission,
    ComplaintPermission,
    PaymentPermission,
    NotificationPermission,
)

from .serializers import (
    RestaurantSerializer,
    CustomerSerializer,
    WaiterSerializer,
    ChefSerializer,
    BartenderSerializer,
    MenuItemSerializer,
    OrderSerializer,
    OrderItemSerializer,
    ComplaintSerializer,
    PaymentSerializer,
    NotificationSerializer,
)


def create_notification(
    recipient,
    order,
    message,
    notification_type="order",
):
    if recipient is None:
        return

    Notification.objects.create(
        recipient=recipient,
        order=order,
        message=message,
        notification_type=notification_type,
    )


def notify_waiter(
    order,
    message,
    notification_type="order",
):
    if order.waiter and order.waiter.user:
        create_notification(
            recipient=order.waiter.user,
            order=order,
            message=message,
            notification_type=notification_type,
        )


def notify_restaurant_waiters(
    order,
    message,
    notification_type="order",
):
    waiter_users = User.objects.filter(
        groups__name="Waiter",
        waiter__restaurant=order.restaurant,
    ).distinct()

    for user in waiter_users:
        create_notification(
            recipient=user,
            order=order,
            message=message,
            notification_type=notification_type,
        )


def get_order_has_food(order):
    return order.order_items.filter(
        menu_item__item_type="food"
    ).exists()


def get_order_has_drinks(order):
    return order.order_items.filter(
        menu_item__item_type="drinks"
    ).exists()


def calculate_order_totals(order):
    items = order.order_items.select_related(
        "menu_item"
    ).all()

    total_amount = 0
    food_time = 0
    drink_time = 0

    for item in items:
        total_amount += (
            item.menu_item.price * item.quantity
        )

        if item.menu_item.item_type == "food":
            food_time = max(
                food_time,
                item.menu_item.preparation_time,
            )

        if item.menu_item.item_type == "drinks":
            drink_time = max(
                drink_time,
                item.menu_item.preparation_time,
            )

    waiting_time = max(
        food_time,
        drink_time,
    )

    return total_amount, waiting_time


def get_authenticated_waiter(request):
    if not request.user.is_authenticated:
        return None

    if not request.user.groups.filter(
        name="Waiter"
    ).exists():
        return None

    try:
        return request.user.waiter
    except Waiter.DoesNotExist:
        return None


def get_waiter_order(request, order_id):
    waiter = get_authenticated_waiter(request)

    if waiter is None:
        return None, None

    order = get_object_or_404(
        Order.objects.select_related(
            "customer__user",
            "restaurant",
            "waiter__user",
            "chef",
            "bartender",
        ).prefetch_related(
            "order_items__menu_item",
            "complaints",
        ),
        pk=order_id,
        restaurant=waiter.restaurant,
    )

    return waiter, order


class RestaurantListCreateView(
    generics.ListCreateAPIView
):
    queryset = Restaurant.objects.all()
    serializer_class = RestaurantSerializer


class CustomerListView(generics.ListAPIView):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    permission_classes = [WaiterPermission]


class WaiterListView(generics.ListAPIView):
    serializer_class = WaiterSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
                return Waiter.objects.filter(
                    restaurant=waiter.restaurant
                )
            except Waiter.DoesNotExist:
                pass

        return Waiter.objects.all()


class ChefListView(generics.ListAPIView):
    serializer_class = ChefSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
                return Chef.objects.filter(
                    restaurant=waiter.restaurant
                )
            except Waiter.DoesNotExist:
                pass

        return Chef.objects.all()


class BartenderListView(generics.ListAPIView):
    serializer_class = BartenderSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user

        if user.is_authenticated and user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
                return Bartender.objects.filter(
                    restaurant=waiter.restaurant
                )
            except Waiter.DoesNotExist:
                pass

        return Bartender.objects.all()


class MenuItemListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = MenuItemSerializer
    permission_classes = [MenuPermission]

    def get_queryset(self):
        return MenuItem.objects.select_related(
            "restaurant"
        ).all().order_by(
            "-popular",
            "name",
        )


class MenuItemDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    queryset = MenuItem.objects.all()
    serializer_class = MenuItemSerializer
    permission_classes = [MenuPermission]


class OrderListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = OrderSerializer
    permission_classes = [OrderPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = Order.objects.select_related(
            "customer__user",
            "restaurant",
            "waiter__user",
            "chef",
            "bartender",
        ).prefetch_related(
            "order_items__menu_item",
            "complaints",
        )

        if user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
            except Waiter.DoesNotExist:
                return Order.objects.none()

            return queryset.filter(
                restaurant=waiter.restaurant
            ).order_by("-order_date")

        if user.groups.filter(
            name="Customer"
        ).exists():
            return queryset.filter(
                customer__user=user
            ).order_by("-order_date")

        return Order.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        order = serializer.save()

        _, waiting_time = calculate_order_totals(order)

        if not order.order_items.exists():
            raise serializers.ValidationError(
                "An order must contain at least one item."
            )

        order.order_waiting_time = waiting_time

        order.save(
            update_fields=[
                "order_waiting_time",
            ]
        )

        create_notification(
            recipient=order.customer.user,
            order=order,
            message=(
                f"Order #{order.order_id} has been placed "
                "successfully and is waiting for a waiter."
            ),
            notification_type="order",
        )

        notify_restaurant_waiters(
            order,
            (
                f"New order #{order.order_id} has been "
                "placed and is waiting for a waiter."
            ),
            "order",
        )


class OrderDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = OrderSerializer
    permission_classes = [OrderDetailPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = Order.objects.select_related(
            "customer__user",
            "restaurant",
            "waiter__user",
            "chef",
            "bartender",
        ).prefetch_related(
            "order_items__menu_item",
            "complaints",
        )

        if user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
            except Waiter.DoesNotExist:
                return Order.objects.none()

            return queryset.filter(
                restaurant=waiter.restaurant
            )

        if user.groups.filter(
            name="Customer"
        ).exists():
            return queryset.filter(
                customer__user=user
            )

        return Order.objects.none()

    def perform_update(self, serializer):
        raise serializers.ValidationError(
            (
                "Order status and staff assignments must be "
                "changed using the dedicated order action "
                "endpoints."
            )
        )


class OrderItemListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = OrderItemSerializer
    permission_classes = [OrderItemPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = OrderItem.objects.select_related(
            "order",
            "menu_item",
            "order__restaurant",
            "order__customer__user",
        )

        if user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
            except Waiter.DoesNotExist:
                return OrderItem.objects.none()

            return queryset.filter(
                order__restaurant=waiter.restaurant
            )

        if user.groups.filter(
            name="Customer"
        ).exists():
            return queryset.filter(
                order__customer__user=user
            )

        return OrderItem.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        item = serializer.save()
        order = item.order

        _, waiting_time = calculate_order_totals(order)

        order.order_waiting_time = waiting_time

        order.save(
            update_fields=[
                "order_waiting_time",
            ]
        )


class OrderItemDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = OrderItemSerializer
    permission_classes = [OrderItemDetailPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = OrderItem.objects.select_related(
            "order",
            "menu_item",
            "order__restaurant",
            "order__customer__user",
        )

        if user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
            except Waiter.DoesNotExist:
                return OrderItem.objects.none()

            return queryset.filter(
                order__restaurant=waiter.restaurant
            )

        if user.groups.filter(
            name="Customer"
        ).exists():
            return queryset.filter(
                order__customer__user=user
            )

        return OrderItem.objects.none()


class ComplaintListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = ComplaintSerializer
    permission_classes = [ComplaintPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = Complaint.objects.select_related(
            "order",
            "order__customer__user",
            "order__restaurant",
        )

        if user.groups.filter(
            name="Customer"
        ).exists():
            return queryset.filter(
                order__customer__user=user
            ).order_by("-complaint_date")

        if user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
            except Waiter.DoesNotExist:
                return Complaint.objects.none()

            return queryset.filter(
                order__restaurant=waiter.restaurant,
                order__order_status__in=[
                    "pending",
                    "accepted",
                    "preparing",
                    "ready",
                ],
            ).order_by("-complaint_date")

        return Complaint.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        complaint = serializer.save()
        order = complaint.order

        notify_restaurant_waiters(
            order,
            (
                f"Customer complaint received for "
                f"Order #{order.order_id}. "
                f"Rating: {complaint.rating}/5."
            ),
            "complaint",
        )


class ComplaintDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = ComplaintSerializer
    permission_classes = [ComplaintPermission]

    def get_queryset(self):
        user = self.request.user

        queryset = Complaint.objects.select_related(
            "order",
            "order__customer__user",
            "order__restaurant",
        )

        if user.groups.filter(
            name="Customer"
        ).exists():
            return queryset.filter(
                order__customer__user=user
            )

        if user.groups.filter(
            name="Waiter"
        ).exists():
            try:
                waiter = user.waiter
            except Waiter.DoesNotExist:
                return Complaint.objects.none()

            return queryset.filter(
                order__restaurant=waiter.restaurant
            )

        return Complaint.objects.none()


class PaymentListCreateView(
    generics.ListCreateAPIView
):
    serializer_class = PaymentSerializer
    permission_classes = [PaymentPermission]

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(
            name="Customer"
        ).exists():
            return Payment.objects.select_related(
                "order"
            ).filter(
                order__customer__user=user
            ).order_by("-payment_date")

        return Payment.objects.none()

    @transaction.atomic
    def perform_create(self, serializer):
        payment = serializer.save()
        order = payment.order

        if payment.payment_method == "pretend":
            customer_message = (
                f"Pretend payment for Order "
                f"#{order.order_id} was recorded successfully. "
                "A waiter will confirm the payment and "
                "complete the order."
            )
        elif payment.payment_method == "cash":
            customer_message = (
                f"Cash payment for Order "
                f"#{order.order_id} has been recorded. "
                "Please give the cash to your waiter. "
                "The waiter will confirm receipt."
            )
        elif payment.payment_method == "bank_transfer":
            customer_message = (
                f"Bank transfer payment for Order "
                f"#{order.order_id} has been submitted. "
                "The waiter will verify the transfer "
                "and confirm the payment."
            )
        else:
            customer_message = (
                f"Payment for Order #{order.order_id} "
                "has been recorded and is awaiting "
                "waiter confirmation."
            )

        create_notification(
            recipient=order.customer.user,
            order=order,
            message=customer_message,
            notification_type="payment",
        )

        if payment.payment_method == "pretend":
            waiter_message = (
                f"Pretend payment for Order "
                f"#{order.order_id} has been recorded "
                "and is awaiting your confirmation."
            )
        elif payment.payment_method == "cash":
            waiter_message = (
                f"Cash payment for Order "
                f"#{order.order_id} has been submitted. "
                "Confirm once the cash has been received."
            )
        elif payment.payment_method == "bank_transfer":
            waiter_message = (
                f"Bank transfer for Order "
                f"#{order.order_id} has been submitted. "
                "Verify the transfer before confirming payment."
            )
        else:
            waiter_message = (
                f"Payment for Order #{order.order_id} "
                "has been submitted and is awaiting "
                "your confirmation."
            )

        notify_waiter(
            order,
            waiter_message,
            "payment",
        )


class PaymentDetailView(
    generics.RetrieveAPIView
):
    serializer_class = PaymentSerializer
    permission_classes = [PaymentPermission]

    def get_queryset(self):
        user = self.request.user

        if user.groups.filter(
            name="Customer"
        ).exists():
            return Payment.objects.select_related(
                "order"
            ).filter(
                order__customer__user=user
            )

        return Payment.objects.none()


class NotificationListView(
    generics.ListAPIView
):
    serializer_class = NotificationSerializer
    permission_classes = [NotificationPermission]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).select_related(
            "order"
        ).order_by(
            "-created_at"
        )


@api_view(["POST"])
@permission_classes([WaiterPermission])
@transaction.atomic
def accept_order_view(request, pk):
    waiter, order = get_waiter_order(
        request,
        pk,
    )

    if waiter is None or order is None:
        return Response(
            {
                "detail": (
                    "You are not authorized to accept "
                    "this order."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.order_status != "pending":
        return Response(
            {
                "detail": (
                    "Only pending orders can be accepted."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order.waiter_id is not None:
        return Response(
            {
                "detail": (
                    "This order has already been assigned "
                    "to a waiter."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.waiter = waiter
    order.order_status = "accepted"
    order.accepted_at = timezone.now()

    order.save(
        update_fields=[
            "waiter",
            "order_status",
            "accepted_at",
        ]
    )

    create_notification(
        recipient=order.customer.user,
        order=order,
        message=(
            f"Order #{order.order_id} has been accepted "
            "by a waiter."
        ),
        notification_type="order",
    )

    create_notification(
        recipient=waiter.user,
        order=order,
        message=(
            f"You accepted Order #{order.order_id}. "
            "Assign the required kitchen or bar staff "
            "to begin preparation."
        ),
        notification_type="order",
    )

    return Response(
        OrderSerializer(
            order,
            context={"request": request},
        ).data,
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([WaiterPermission])
@transaction.atomic
def assign_order_staff_view(request, pk):
    waiter, order = get_waiter_order(
        request,
        pk,
    )

    if waiter is None or order is None:
        return Response(
            {
                "detail": (
                    "You are not authorized to assign "
                    "staff to this order."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.order_status != "accepted":
        return Response(
            {
                "detail": (
                    "Staff can only be assigned after "
                    "the order has been accepted."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order.waiter_id != waiter.waiter_id:
        return Response(
            {
                "detail": (
                    "Only the waiter who accepted the "
                    "order can assign its staff."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    chef_id = request.data.get("chef")
    bartender_id = request.data.get("bartender")

    has_food = get_order_has_food(order)
    has_drinks = get_order_has_drinks(order)

    chef = None
    bartender = None

    if has_food:
        if not chef_id:
            return Response(
                {
                    "chef": (
                        "A chef is required for an order "
                        "containing food."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            chef = Chef.objects.get(
                pk=chef_id,
                restaurant=waiter.restaurant,
            )
        except Chef.DoesNotExist:
            return Response(
                {
                    "chef": (
                        "The selected chef does not belong "
                        "to this restaurant."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    if has_drinks:
        if not bartender_id:
            return Response(
                {
                    "bartender": (
                        "A bartender is required for an "
                        "order containing drinks."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            bartender = Bartender.objects.get(
                pk=bartender_id,
                restaurant=waiter.restaurant,
            )
        except Bartender.DoesNotExist:
            return Response(
                {
                    "bartender": (
                        "The selected bartender does not "
                        "belong to this restaurant."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

    order.chef = chef
    order.bartender = bartender
    order.order_status = "preparing"
    order.preparing_started_at = timezone.now()

    order.save(
        update_fields=[
            "chef",
            "bartender",
            "order_status",
            "preparing_started_at",
        ]
    )

    if chef:
        create_notification(
            recipient=order.customer.user,
            order=order,
            message=(
                f"Chef {chef.name} has been assigned "
                f"to Order #{order.order_id}."
            ),
            notification_type="order",
        )

    if bartender:
        create_notification(
            recipient=order.customer.user,
            order=order,
            message=(
                f"Bartender {bartender.name} has been "
                f"assigned to Order #{order.order_id}."
            ),
            notification_type="order",
        )

    create_notification(
        recipient=order.customer.user,
        order=order,
        message=(
            f"Order #{order.order_id} is now being prepared."
        ),
        notification_type="order",
    )

    create_notification(
        recipient=waiter.user,
        order=order,
        message=(
            f"Preparation has started for "
            f"Order #{order.order_id}."
        ),
        notification_type="order",
    )

    return Response(
        OrderSerializer(
            order,
            context={"request": request},
        ).data,
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([WaiterPermission])
@transaction.atomic
def mark_order_ready_view(request, pk):
    waiter, order = get_waiter_order(
        request,
        pk,
    )

    if waiter is None or order is None:
        return Response(
            {
                "detail": (
                    "You are not authorized to update "
                    "this order."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.waiter_id != waiter.waiter_id:
        return Response(
            {
                "detail": (
                    "Only the waiter assigned to the "
                    "order can mark it ready."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.order_status != "preparing":
        return Response(
            {
                "detail": (
                    "Only orders currently being prepared "
                    "can be marked ready."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if get_order_has_food(order) and order.chef_id is None:
        return Response(
            {
                "detail": (
                    "A chef must be assigned before the "
                    "order can be marked ready."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if (
        get_order_has_drinks(order)
        and order.bartender_id is None
    ):
        return Response(
            {
                "detail": (
                    "A bartender must be assigned before "
                    "the order can be marked ready."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.order_status = "ready"

    order.save(
        update_fields=["order_status"]
    )

    create_notification(
        recipient=order.customer.user,
        order=order,
        message=(
            f"Order #{order.order_id} is ready and "
            "waiting to be served."
        ),
        notification_type="order",
    )

    create_notification(
        recipient=waiter.user,
        order=order,
        message=(
            f"Order #{order.order_id} is ready. "
            "Confirm when it has been served."
        ),
        notification_type="order",
    )

    return Response(
        OrderSerializer(
            order,
            context={"request": request},
        ).data,
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([WaiterPermission])
@transaction.atomic
def serve_order_view(request, pk):
    waiter, order = get_waiter_order(
        request,
        pk,
    )

    if waiter is None or order is None:
        return Response(
            {
                "detail": (
                    "You are not authorized to serve "
                    "this order."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.waiter_id != waiter.waiter_id:
        return Response(
            {
                "detail": (
                    "Only the waiter assigned to the "
                    "order can serve it."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.order_status != "ready":
        return Response(
            {
                "detail": (
                    "An order must be ready before it "
                    "can be served."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.order_status = "served"
    order.served_at = timezone.now()

    order.save(
        update_fields=[
            "order_status",
            "served_at",
        ]
    )

    create_notification(
        recipient=order.customer.user,
        order=order,
        message=(
            f"Order #{order.order_id} has been served. "
            "You can now proceed with payment."
        ),
        notification_type="order",
    )

    create_notification(
        recipient=waiter.user,
        order=order,
        message=(
            f"Order #{order.order_id} has been served "
            "and is waiting for customer payment."
        ),
        notification_type="order",
    )

    return Response(
        OrderSerializer(
            order,
            context={"request": request},
        ).data,
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([WaiterPermission])
@transaction.atomic
def confirm_payment_view(request, pk):
    waiter, order = get_waiter_order(
        request,
        pk,
    )

    if waiter is None or order is None:
        return Response(
            {
                "detail": (
                    "You are not authorized to confirm "
                    "this payment."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.waiter_id != waiter.waiter_id:
        return Response(
            {
                "detail": (
                    "Only the waiter assigned to the "
                    "order can confirm payment."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    if order.order_status != "served":
        return Response(
            {
                "detail": (
                    "Payment can only be confirmed after "
                    "the order has been served."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        payment = order.payment
    except Payment.DoesNotExist:
        return Response(
            {
                "detail": (
                    "No payment has been submitted "
                    "for this order."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if order.is_paid and order.order_status == "completed":
        return Response(
            {
                "detail": (
                    "This order has already been "
                    "completed."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    if not payment.is_paid:
        payment.is_paid = True

        payment.save(
            update_fields=["is_paid"]
        )

    order.is_paid = True
    order.order_status = "completed"
    order.completed_at = timezone.now()

    order.save(
        update_fields=[
            "is_paid",
            "order_status",
            "completed_at",
        ]
    )

    if payment.payment_method == "cash":
        customer_message = (
            f"Cash payment for Order #{order.order_id} "
            "has been confirmed by your waiter. "
            "Your order is now completed."
        )
    elif payment.payment_method == "bank_transfer":
        customer_message = (
            f"Bank transfer for Order #{order.order_id} "
            "has been verified by your waiter. "
            "Your order is now completed."
        )
    elif payment.payment_method == "pretend":
        customer_message = (
            f"Pretend payment for Order #{order.order_id} "
            "has been confirmed. Your order is now completed."
        )
    else:
        customer_message = (
            f"Payment for Order #{order.order_id} "
            "has been confirmed. Your order is now completed."
        )

    create_notification(
        recipient=order.customer.user,
        order=order,
        message=customer_message,
        notification_type="payment",
    )

    create_notification(
        recipient=waiter.user,
        order=order,
        message=(
            f"Payment for Order #{order.order_id} has "
            "been confirmed and the order is complete."
        ),
        notification_type="payment",
    )

    return Response(
        OrderSerializer(
            order,
            context={"request": request},
        ).data,
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def customer_login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {
                "detail": (
                    "Username and password are required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {
                "detail": "Invalid username or password."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.groups.filter(
        name="Customer"
    ).exists():
        return Response(
            {
                "detail": (
                    "This account is not a "
                    "customer account."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        customer = user.customer
    except Customer.DoesNotExist:
        return Response(
            {
                "detail": (
                    "This customer account is not "
                    "linked to a customer profile."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    login(request, user)

    return Response(
        {
            "detail": "Customer login successful.",
            "username": user.username,
            "role": "customer",
            "customer_id": customer.customer_id,
            "name": customer.name,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([AllowAny])
def waiter_login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")

    if not username or not password:
        return Response(
            {
                "detail": (
                    "Username and password are required."
                )
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    user = authenticate(
        request,
        username=username,
        password=password,
    )

    if user is None:
        return Response(
            {
                "detail": "Invalid username or password."
            },
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.groups.filter(
        name="Waiter"
    ).exists():
        return Response(
            {
                "detail": (
                    "This account is not a "
                    "waiter account."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        waiter = user.waiter
    except Waiter.DoesNotExist:
        return Response(
            {
                "detail": (
                    "This waiter account is not "
                    "linked to a waiter profile."
                )
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    login(request, user)

    return Response(
        {
            "detail": "Waiter login successful.",
            "username": user.username,
            "role": "waiter",
            "waiter_id": waiter.waiter_id,
            "name": waiter.name,
            "restaurant_id": waiter.restaurant_id,
        },
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
def logout_view(request):
    logout(request)

    return Response(
        {
            "detail": "Logout successful."
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def session_view(request):
    if not request.user.is_authenticated:
        return Response(
            {
                "authenticated": False
            },
            status=status.HTTP_200_OK,
        )

    user = request.user

    if user.groups.filter(
        name="Customer"
    ).exists():
        try:
            customer = user.customer
        except Customer.DoesNotExist:
            return Response(
                {
                    "authenticated": False
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "authenticated": True,
                "role": "customer",
                "username": user.username,
                "customer_id": customer.customer_id,
                "name": customer.name,
            }
        )

    if user.groups.filter(
        name="Waiter"
    ).exists():
        try:
            waiter = user.waiter
        except Waiter.DoesNotExist:
            return Response(
                {
                    "authenticated": False
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            {
                "authenticated": True,
                "role": "waiter",
                "username": user.username,
                "waiter_id": waiter.waiter_id,
                "name": waiter.name,
                "restaurant_id": waiter.restaurant_id,
            }
        )

    return Response(
        {
            "authenticated": False
        },
        status=status.HTTP_200_OK,
    )


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_view(request):
    get_token(request)

    return Response(
        {
            "detail": "CSRF cookie set."
        }
    )
