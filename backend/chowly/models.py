from django.contrib.auth.models import User
from django.db import models


class Restaurant(models.Model):
    restaurant_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    address = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name


class Customer(models.Model):
    customer_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="customer",
    )
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    email = models.EmailField(unique=True)

    def __str__(self):
        return self.name


class Waiter(models.Model):
    waiter_id = models.AutoField(primary_key=True)
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="waiter",
    )
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="waiters",
    )

    def __str__(self):
        return self.name


class Chef(models.Model):
    chef_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="chefs",
    )

    def __str__(self):
        return self.name


class Bartender(models.Model):
    bartender_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    phone_number = models.CharField(max_length=20)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="bartenders",
    )

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    MENU_TYPE_CHOICES = [
        ("food", "Food"),
        ("drinks", "Drinks"),
    ]

    menu_item_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    item_type = models.CharField(
        max_length=20,
        choices=MENU_TYPE_CHOICES,
    )
    description = models.TextField(blank=True)
    price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )
    preparation_time = models.PositiveIntegerField(
        help_text="Preparation time in minutes",
    )
    image = models.URLField(
        blank=True,
        default="",
    )
    category = models.CharField(
        max_length=100,
        blank=True,
        default="",
    )
    popular = models.BooleanField(default=False)
    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="menu_items",
    )

    def __str__(self):
        return self.name


class Order(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("preparing", "Preparing"),
        ("ready", "Ready"),
        ("served", "Served"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    order_id = models.AutoField(primary_key=True)
    order_date = models.DateTimeField(auto_now_add=True)

    table_number = models.PositiveIntegerField(default=1)

    order_waiting_time = models.PositiveIntegerField(
        default=0,
        help_text="Estimated waiting time in minutes",
    )

    order_status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    accepted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    preparing_started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    served_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    completed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    is_paid = models.BooleanField(default=False)

    customer = models.ForeignKey(
        Customer,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="orders",
    )

    waiter = models.ForeignKey(
        Waiter,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    chef = models.ForeignKey(
        Chef,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    bartender = models.ForeignKey(
        Bartender,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="orders",
    )

    def __str__(self):
        return f"Order #{self.order_id}"


class OrderItem(models.Model):
    order_item_id = models.AutoField(primary_key=True)

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="order_items",
    )

    menu_item = models.ForeignKey(
        MenuItem,
        on_delete=models.CASCADE,
        related_name="order_items",
    )

    quantity = models.PositiveIntegerField(default=1)

    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    def __str__(self):
        return f"{self.quantity} x {self.menu_item.name}"


class Complaint(models.Model):
    complaint_id = models.AutoField(primary_key=True)

    complaint_details = models.TextField()

    rating = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Rating from 1 to 5",
    )

    complaint_date = models.DateTimeField(
        auto_now_add=True,
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="complaints",
    )

    def __str__(self):
        return f"Complaint #{self.complaint_id}"


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ("cash", "Cash"),
        ("bank_transfer", "Bank Transfer"),
        ("pretend", "Pretend Payment"),
    ]

    payment_id = models.AutoField(primary_key=True)

    payment_amount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    payment_method = models.CharField(
        max_length=20,
        choices=PAYMENT_METHOD_CHOICES,
        default="pretend",
    )

    payment_date = models.DateTimeField(
        auto_now_add=True,
    )

    order = models.OneToOneField(
        Order,
        on_delete=models.CASCADE,
        related_name="payment",
    )

    is_paid = models.BooleanField(default=False)

    def __str__(self):
        return f"Payment #{self.payment_id}"


class Notification(models.Model):
    NOTIFICATION_TYPES = [
        ("order", "Order"),
        ("payment", "Payment"),
        ("complaint", "Complaint"),
    ]

    notification_id = models.AutoField(primary_key=True)

    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    message = models.CharField(max_length=500)

    notification_type = models.CharField(
        max_length=20,
        choices=NOTIFICATION_TYPES,
        default="order",
    )

    is_read = models.BooleanField(default=False)

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    def __str__(self):
        return f"Notification #{self.notification_id}"
