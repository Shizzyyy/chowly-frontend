from datetime import timedelta

from django.contrib.auth import password_validation
from django.contrib.auth.models import Group, User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.utils import timezone

from rest_framework import serializers

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


class RestaurantSerializer(serializers.ModelSerializer):
    class Meta:
        model = Restaurant
        fields = "__all__"


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = "__all__"


class CustomerSignupSerializer(serializers.Serializer):
    name = serializers.CharField(
        max_length=255,
        required=True,
        allow_blank=False,
    )
    username = serializers.CharField(
        max_length=150,
        required=True,
        allow_blank=False,
    )
    password = serializers.CharField(
        write_only=True,
        required=True,
        min_length=8,
    )

    def validate_name(self, name):
        name = name.strip()

        if not name:
            raise serializers.ValidationError(
                "Full name cannot be empty."
            )

        return name

    def validate_username(self, username):
        username = username.strip()

        if not username:
            raise serializers.ValidationError(
                "Username cannot be empty."
            )

        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError(
                "This username is already taken."
            )

        return username

    def validate_password(self, password):
        try:
            password_validation.validate_password(
                password
            )
        except DjangoValidationError as exc:
            raise serializers.ValidationError(
                list(exc.messages)
            )

        return password

    def create(self, validated_data):
        name = validated_data["name"]
        username = validated_data["username"]
        password = validated_data["password"]

        with transaction.atomic():
            user = User.objects.create_user(
                username=username,
                password=password,
                first_name=name,
            )

            customer_group, _ = Group.objects.get_or_create(
                name="Customer"
            )

            user.groups.add(customer_group)

            customer = Customer.objects.create(
                user=user,
                name=name,
            )

        return customer


class WaiterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Waiter
        fields = "__all__"


class ChefSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chef
        fields = "__all__"


class BartenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bartender
        fields = "__all__"


class MenuItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = MenuItem
        fields = "__all__"


class OrderItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        read_only=True,
    )

    class Meta:
        model = OrderItem
        fields = "__all__"

    def validate_quantity(self, quantity):
        if quantity < 1:
            raise serializers.ValidationError(
                "Quantity must be at least 1."
            )

        return quantity

    def validate(self, attrs):
        request = self.context.get("request")
        order = attrs.get("order")
        menu_item = attrs.get("menu_item")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if not order or not menu_item:
            return attrs

        if order.customer.user != request.user:
            raise serializers.ValidationError(
                "You can only add items to your own order."
            )

        if order.order_status != "pending":
            raise serializers.ValidationError(
                "Items can only be added while the order is pending."
            )

        if order.restaurant_id != menu_item.restaurant_id:
            raise serializers.ValidationError(
                "The menu item does not belong to the restaurant."
            )

        return attrs

    def create(self, validated_data):
        menu_item = validated_data["menu_item"]
        quantity = validated_data["quantity"]

        validated_data["subtotal"] = (
            menu_item.price * quantity
        )

        return OrderItem.objects.create(
            **validated_data
        )


class OrderSerializer(serializers.ModelSerializer):
    customer = serializers.PrimaryKeyRelatedField(
        read_only=True
    )

    items = serializers.ListField(
        write_only=True,
        required=False,
        allow_empty=False,
    )

    order_items = OrderItemSerializer(
        many=True,
        read_only=True,
    )

    total_amount = serializers.SerializerMethodField()

    payment_submitted = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "order_id",
            "order_date",
            "table_number",
            "order_waiting_time",
            "order_status",
            "accepted_at",
            "preparing_started_at",
            "served_at",
            "completed_at",
            "is_paid",
            "rating",
            "payment_submitted",
            "customer",
            "restaurant",
            "waiter",
            "chef",
            "bartender",
            "items",
            "order_items",
            "total_amount",
        ]
        read_only_fields = [
            "order_id",
            "order_date",
            "customer",
            "order_waiting_time",
            "accepted_at",
            "preparing_started_at",
            "served_at",
            "completed_at",
            "is_paid",
            "rating",
            "payment_submitted",
            "order_items",
            "total_amount",
        ]

    def validate(self, attrs):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        restaurant = attrs.get("restaurant")

        if not restaurant:
            raise serializers.ValidationError(
                {
                    "restaurant": (
                        "A restaurant is required."
                    )
                }
            )

        items = attrs.get("items")

        if not items:
            raise serializers.ValidationError(
                {
                    "items": (
                        "An order must contain at least one item."
                    )
                }
            )

        if not isinstance(items, list):
            raise serializers.ValidationError(
                {
                    "items": (
                        "Items must be provided as a list."
                    )
                }
            )

        for index, item in enumerate(items):
            if not isinstance(item, dict):
                raise serializers.ValidationError(
                    {
                        "items": (
                            f"Item {index + 1} must be an object."
                        )
                    }
                )

            menu_item_id = item.get("menu_item")
            quantity = item.get("quantity")

            if not menu_item_id:
                raise serializers.ValidationError(
                    {
                        "items": (
                            f"Item {index + 1} is missing "
                            "'menu_item'."
                        )
                    }
                )

            if quantity is None:
                raise serializers.ValidationError(
                    {
                        "items": (
                            f"Item {index + 1} is missing "
                            "'quantity'."
                        )
                    }
                )

            try:
                quantity = int(quantity)
            except (TypeError, ValueError):
                raise serializers.ValidationError(
                    {
                        "items": (
                            f"Item {index + 1} quantity "
                            "must be a whole number."
                        )
                    }
                )

            if quantity < 1:
                raise serializers.ValidationError(
                    {
                        "items": (
                            f"Item {index + 1} quantity "
                            "must be at least 1."
                        )
                    }
                )

            try:
                menu_item = MenuItem.objects.get(
                    pk=menu_item_id
                )
            except MenuItem.DoesNotExist:
                raise serializers.ValidationError(
                    {
                        "items": (
                            f"Menu item {menu_item_id} "
                            "does not exist."
                        )
                    }
                )

            if (
                menu_item.restaurant_id
                != restaurant.restaurant_id
            ):
                raise serializers.ValidationError(
                    {
                        "items": (
                            f"Menu item {menu_item.name} "
                            "does not belong to the selected "
                            "restaurant."
                        )
                    }
                )

        table_number = attrs.get(
            "table_number",
            1,
        )

        if table_number < 1:
            raise serializers.ValidationError(
                {
                    "table_number": (
                        "Table number must be at least 1."
                    )
                }
            )

        return attrs

    def get_total_amount(self, obj):
        return sum(
            (
                item.menu_item.price * item.quantity
                for item in obj.order_items.select_related(
                    "menu_item"
                ).all()
            ),
            0,
        )

    def get_payment_submitted(self, obj):
        return hasattr(obj, "payment")

    def create(self, validated_data):
        request = self.context.get("request")

        try:
            customer = request.user.customer
        except Customer.DoesNotExist:
            raise serializers.ValidationError(
                "The authenticated user is not linked "
                "to a customer."
            )

        items_data = validated_data.pop("items")

        table_number = validated_data.pop(
            "table_number",
            1,
        )

        with transaction.atomic():
            order = Order.objects.create(
                customer=customer,
                order_status="pending",
                is_paid=False,
                order_waiting_time=0,
                table_number=table_number,
                **validated_data,
            )

            max_food_time = 0
            max_drink_time = 0

            for item_data in items_data:
                menu_item = MenuItem.objects.get(
                    pk=item_data["menu_item"]
                )

                quantity = int(
                    item_data["quantity"]
                )

                OrderItem.objects.create(
                    order=order,
                    menu_item=menu_item,
                    quantity=quantity,
                    subtotal=(
                        menu_item.price * quantity
                    ),
                )

                if menu_item.item_type == "food":
                    max_food_time = max(
                        max_food_time,
                        menu_item.preparation_time,
                    )

                elif menu_item.item_type == "drinks":
                    max_drink_time = max(
                        max_drink_time,
                        menu_item.preparation_time,
                    )

            order.order_waiting_time = max(
                max_food_time,
                max_drink_time,
            )

            order.save(
                update_fields=[
                    "order_waiting_time"
                ]
            )

        return order

    def update(self, instance, validated_data):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if not request.user.groups.filter(
            name="Waiter"
        ).exists():
            raise serializers.ValidationError(
                "Only a waiter can update an order."
            )

        validated_data.pop("items", None)
        validated_data.pop("rating", None)

        allowed_fields = {
            "waiter",
            "chef",
            "bartender",
            "order_status",
        }

        unexpected = (
            set(validated_data.keys())
            - allowed_fields
        )

        if unexpected:
            raise serializers.ValidationError(
                {
                    field: (
                        "This field cannot be changed here."
                    )
                    for field in unexpected
                }
            )

        restaurant = instance.restaurant

        for field in [
            "waiter",
            "chef",
            "bartender",
        ]:
            staff_member = validated_data.get(field)

            if staff_member is None:
                continue

            if (
                staff_member.restaurant_id
                != restaurant.restaurant_id
            ):
                raise serializers.ValidationError(
                    {
                        field: (
                            "This staff member does not belong "
                            "to the order's restaurant."
                        )
                    }
                )

        old_status = instance.order_status

        new_status = validated_data.get(
            "order_status",
            old_status,
        )

        valid_transitions = {
            "pending": {
                "pending",
                "accepted",
                "cancelled",
            },
            "accepted": {
                "accepted",
                "preparing",
                "cancelled",
            },
            "preparing": {
                "preparing",
                "ready",
            },
            "ready": {
                "ready",
                "served",
            },
            "served": {
                "served",
            },
            "completed": {
                "completed",
            },
            "cancelled": {
                "cancelled",
            },
        }

        if new_status not in valid_transitions.get(
            old_status,
            set(),
        ):
            raise serializers.ValidationError(
                {
                    "order_status": (
                        f"Invalid status transition: "
                        f"{old_status} -> {new_status}."
                    )
                }
            )

        if new_status == "accepted":
            if (
                instance.waiter is None
                and validated_data.get("waiter") is None
            ):
                raise serializers.ValidationError(
                    {
                        "waiter": (
                            "A waiter must be assigned "
                            "when accepting an order."
                        )
                    }
                )

        if new_status == "preparing":
            has_food = instance.order_items.filter(
                menu_item__item_type="food"
            ).exists()

            has_drinks = instance.order_items.filter(
                menu_item__item_type="drinks"
            ).exists()

            chef = validated_data.get(
                "chef",
                instance.chef,
            )

            bartender = validated_data.get(
                "bartender",
                instance.bartender,
            )

            if has_food and chef is None:
                raise serializers.ValidationError(
                    {
                        "chef": (
                            "A chef must be assigned "
                            "before preparing a food order."
                        )
                    }
                )

            if has_drinks and bartender is None:
                raise serializers.ValidationError(
                    {
                        "bartender": (
                            "A bartender must be assigned "
                            "before preparing a drink order."
                        )
                    }
                )

            if (
                instance.waiter is None
                and validated_data.get("waiter") is None
            ):
                raise serializers.ValidationError(
                    {
                        "waiter": (
                            "A waiter must be assigned "
                            "before preparing an order."
                        )
                    }
                )

        if new_status == "ready":
            if old_status != "preparing":
                raise serializers.ValidationError(
                    {
                        "order_status": (
                            "An order must be preparing "
                            "before it can be marked ready."
                        )
                    }
                )

        if new_status == "served":
            if old_status != "ready":
                raise serializers.ValidationError(
                    {
                        "order_status": (
                            "An order must be ready "
                            "before it can be served."
                        )
                    }
                )

            if (
                instance.waiter is None
                and validated_data.get("waiter") is None
            ):
                raise serializers.ValidationError(
                    {
                        "waiter": (
                            "A waiter must be assigned "
                            "before serving an order."
                        )
                    }
                )

        if new_status == "completed":
            if not instance.is_paid:
                raise serializers.ValidationError(
                    {
                        "order_status": (
                            "An order cannot be completed "
                            "until payment has been recorded."
                        )
                    }
                )

            if old_status != "served":
                raise serializers.ValidationError(
                    {
                        "order_status": (
                            "An order must be served "
                            "before it can be completed."
                        )
                    }
                )

        with transaction.atomic():
            if (
                old_status != "accepted"
                and new_status == "accepted"
                and not instance.accepted_at
            ):
                instance.accepted_at = timezone.now()

            if (
                old_status != "preparing"
                and new_status == "preparing"
                and not instance.preparing_started_at
            ):
                instance.preparing_started_at = (
                    timezone.now()
                )

            if (
                old_status != "served"
                and new_status == "served"
                and not instance.served_at
            ):
                instance.served_at = timezone.now()

            if (
                old_status != "completed"
                and new_status == "completed"
                and not instance.completed_at
            ):
                instance.completed_at = timezone.now()

            instance = super().update(
                instance,
                validated_data,
            )

            instance.save(
                update_fields=[
                    "accepted_at",
                    "preparing_started_at",
                    "served_at",
                    "completed_at",
                ]
            )

        return instance


class OrderRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = [
            "order_id",
            "rating",
        ]
        read_only_fields = [
            "order_id",
        ]

    def validate_rating(self, rating):
        if rating is None:
            raise serializers.ValidationError(
                "A rating is required."
            )

        if not 1 <= rating <= 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return rating

    def validate(self, attrs):
        request = self.context.get("request")
        order = self.instance

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if order.customer.user != request.user:
            raise serializers.ValidationError(
                "You can only rate your own order."
            )

        if not order.is_paid:
            raise serializers.ValidationError(
                "You can only rate an order after payment."
            )

        if order.order_status not in {
            "served",
            "completed",
        }:
            raise serializers.ValidationError(
                "You can only rate an order after it has been served."
            )

        return attrs


class ComplaintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Complaint
        fields = "__all__"
        read_only_fields = [
            "complaint_date"
        ]

    def validate_order(self, order):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if order.customer.user != request.user:
            raise serializers.ValidationError(
                "You can only submit a complaint for your own order."
            )

        if order.order_status != "preparing":
            raise serializers.ValidationError(
                "A complaint can only be submitted while "
                "the order is being prepared."
            )

        if not order.preparing_started_at:
            raise serializers.ValidationError(
                "The preparation start time has not been recorded yet."
            )

        elapsed_time = (
            timezone.now()
            - order.preparing_started_at
        )

        complaint_wait = timedelta(
            minutes=20
        )

        if elapsed_time < complaint_wait:
            remaining_seconds = int(
                (
                    complaint_wait
                    - elapsed_time
                ).total_seconds()
            )

            remaining_minutes = max(
                1,
                (remaining_seconds + 59) // 60,
            )

            raise serializers.ValidationError(
                f"You can submit a complaint after "
                f"{remaining_minutes} more minute(s) "
                "of preparation."
            )

        if order.complaints.exists():
            raise serializers.ValidationError(
                "A complaint has already been submitted "
                "for this order."
            )

        return order

    def validate_rating(self, rating):
        if rating is not None and not 1 <= rating <= 5:
            raise serializers.ValidationError(
                "Rating must be between 1 and 5."
            )

        return rating

    def validate_complaint_details(self, details):
        if not details or not details.strip():
            raise serializers.ValidationError(
                "Complaint details cannot be empty."
            )

        return details.strip()


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"
        read_only_fields = [
            "payment_date",
            "is_paid",
        ]
        extra_kwargs = {
            "payment_method": {
                "required": True,
            },
        }

    def validate_order(self, order):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError(
                "Authentication is required."
            )

        if order.customer.user != request.user:
            raise serializers.ValidationError(
                "You can only pay for your own order."
            )

        if order.order_status != "served":
            raise serializers.ValidationError(
                "Payment is only available after "
                "the order has been served."
            )

        if order.is_paid:
            raise serializers.ValidationError(
                "This order has already been paid."
            )

        if hasattr(order, "payment"):
            raise serializers.ValidationError(
                "A payment record already exists for this order."
            )

        return order

    def validate_payment_amount(self, amount):
        if amount <= 0:
            raise serializers.ValidationError(
                "Payment amount must be greater than zero."
            )

        return amount

    def validate(self, attrs):
        order = attrs.get("order")

        if not order:
            raise serializers.ValidationError(
                {
                    "order": (
                        "An order is required."
                    )
                }
            )

        expected_amount = sum(
            (
                item.menu_item.price * item.quantity
                for item in order.order_items.select_related(
                    "menu_item"
                ).all()
            ),
            0,
        )

        if (
            attrs.get("payment_amount")
            != expected_amount
        ):
            raise serializers.ValidationError(
                {
                    "payment_amount": (
                        "Payment amount must exactly match "
                        "the order total."
                    )
                }
            )

        return attrs

    def create(self, validated_data):
        order = validated_data["order"]
        payment_method = validated_data[
            "payment_method"
        ]

        payment_is_paid = (
            payment_method == "pretend"
        )

        with transaction.atomic():
            payment = Payment.objects.create(
                order=order,
                payment_amount=validated_data[
                    "payment_amount"
                ],
                payment_method=payment_method,
                is_paid=payment_is_paid,
            )

            if payment_is_paid:
                order.is_paid = True

                order.save(
                    update_fields=[
                        "is_paid"
                    ]
                )

        return payment


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = "__all__"
        read_only_fields = [
            "recipient",
            "created_at",
            "is_read",
        ]
