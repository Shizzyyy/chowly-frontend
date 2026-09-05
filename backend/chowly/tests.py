from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APIClient

from .models import Customer, Restaurant, Order, MenuItem, OrderItem


class OrderAPITest(TestCase):

    def setUp(self):
        self.client = APIClient()

        self.user = User.objects.create_user(
            username="customer_test",
            password="testpass123"
        )

        self.user.groups.create(name="Customer")

        self.customer = Customer.objects.create(
            user=self.user,
            name="Test Customer",
            phone_number="08000000000",
            email="test@example.com"
        )

        self.restaurant = Restaurant.objects.create(
            name="Test Restaurant",
            address="Test Address",
            phone_number="08000000001",
            email="restaurant@test.com"
        )

        self.menu_item = MenuItem.objects.create(
            name="Test Jollof Rice",
            item_type="Main course",
            description="Test menu item",
            price=4000.00,
            preparation_time=30,
            restaurant=self.restaurant
        )

        self.order = Order.objects.create(
            customer=self.customer,
            restaurant=self.restaurant,
            order_waiting_time=20,
            order_status="pending"
        )

    def test_unauthenticated_user_cannot_view_orders(self):
        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, 403)

    def test_customer_can_view_own_orders(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["order_id"], self.order.order_id)
    def test_waiter_can_view_orders(self):
        waiter = User.objects.create_user(
            username="waiter_test",
            password="testpass123"
        )

        waiter.groups.create(name="Waiter")

        self.client.force_authenticate(user=waiter)

        response = self.client.get("/api/orders/")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
    def test_waiter_cannot_create_order(self):
        waiter = User.objects.create_user(
            username="waiter_create_test",
            password="testpass123"
        )

        waiter.groups.create(name="Waiter")

        self.client.force_authenticate(user=waiter)

        response = self.client.post(
            "/api/orders/",
            {
                "customer": self.customer.customer_id,
                "restaurant": self.restaurant.restaurant_id,
                "order_waiting_time": 30,
                "order_status": "pending",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 403)
    def test_waiter_can_update_order(self):
        waiter = User.objects.create_user(
            username="waiter_update_test",
            password="testpass123"
        )

        waiter.groups.create(name="Waiter")

        self.client.force_authenticate(user=waiter)

        response = self.client.patch(
            f"/api/orders/{self.order.order_id}/",
            {
                "order_status": "served",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["order_status"], "served")
    def test_customer_cannot_update_order(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.patch(
            f"/api/orders/{self.order.order_id}/",
            {
                "order_status": "served",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 403)
    def test_customer_cannot_view_another_customers_order(self):
        other_user = User.objects.create_user(
            username="other_customer",
            password="testpass123"
        )

        other_user.groups.add(
            self.user.groups.get(name="Customer")
        )

        other_customer = Customer.objects.create(
            user=other_user,
            name="Other Customer",
            phone_number="08099999999",
            email="other@example.com"
        )

        other_order = Order.objects.create(
            customer=other_customer,
            restaurant=self.restaurant,
            order_waiting_time=30,
            order_status="pending"
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"/api/orders/{other_order.order_id}/"
        )

        self.assertEqual(response.status_code, 404)
    def test_customer_can_create_order(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/orders/",
            {
                "customer": self.customer.customer_id,
                "restaurant": self.restaurant.restaurant_id,
                "order_waiting_time": 30,
                "order_status": "pending",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["customer"], self.customer.customer_id)
        self.assertEqual(response.data["restaurant"], self.restaurant.restaurant_id)
        self.assertEqual(response.data["order_status"], "pending")
    def test_customer_can_create_order_item(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/order-items/",
            {
                "order": self.order.order_id,
                "menu_item": self.menu_item.menu_item_id,
                "quantity": 2,
                "subtotal": "8000.00",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["order"], self.order.order_id)
        self.assertEqual(response.data["quantity"], 2)
        self.assertEqual(response.data["subtotal"], "8000.00")
    def test_waiter_cannot_create_order_item(self):
        waiter = User.objects.create_user(
            username="waiter_item_test",
            password="testpass123"
        )

        waiter.groups.create(name="Waiter")

        self.client.force_authenticate(user=waiter)

        response = self.client.post(
            "/api/order-items/",
            {
                "order": self.order.order_id,
                "menu_item": self.menu_item.menu_item_id,
                "quantity": 1,
                "subtotal": "4000.00",
            },
            format="json"
        )

        self.assertEqual(response.status_code, 403)
    def test_customer_cannot_view_another_customers_order_item(self):
        other_user = User.objects.create_user(
            username="other_customer_item",
            password="testpass123"
        )

        other_user.groups.add(
            self.user.groups.get(name="Customer")
        )

        other_customer = Customer.objects.create(
            user=other_user,
            name="Other Customer",
            phone_number="08088888888",
            email="other_item@example.com"
        )

        other_order = Order.objects.create(
            customer=other_customer,
            restaurant=self.restaurant,
            order_waiting_time=30,
            order_status="pending"
        )

        other_order_item = OrderItem.objects.create(
            order=other_order,
            menu_item=self.menu_item,
            quantity=1,
            subtotal="4000.00"
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.get(
            f"/api/order-items/{other_order_item.order_item_id}/"
        )

        self.assertEqual(response.status_code, 403)
    def test_customer_can_create_complaint(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/complaints/",
            {
                "complaint_details": "My order took too long",
                "rating": 2,
                "order": self.order.order_id,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["order"], self.order.order_id)
        self.assertEqual(response.data["rating"], 2)
    def test_customer_cannot_create_complaint_for_another_customers_order(self):
        other_user = User.objects.create_user(
            username="other_complaint_customer",
            password="testpass123"
        )

        other_user.groups.add(
            self.user.groups.get(name="Customer")
        )

        other_customer = Customer.objects.create(
            user=other_user,
            name="Other Complaint Customer",
            phone_number="08077777777",
            email="other_complaint@example.com"
        )

        other_order = Order.objects.create(
            customer=other_customer,
            restaurant=self.restaurant,
            order_waiting_time=30,
            order_status="pending"
        )

        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/complaints/",
            {
                "complaint_details": "This is not my order",
                "rating": 1,
                "order": other_order.order_id,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 400)
    def test_customer_can_create_payment_and_mark_order_paid(self):
        self.client.force_authenticate(user=self.user)

        response = self.client.post(
            "/api/payments/",
            {
                "payment_amount": "4000.00",
                "payment_method": "pretend",
                "is_paid": True,
                "order": self.order.order_id,
            },
            format="json"
        )

        self.assertEqual(response.status_code, 201)

        self.order.refresh_from_db()

        self.assertTrue(self.order.is_paid)
    def test_waiter_cannot_access_complaints_or_payments(self):
        waiter_user = User.objects.create_user(
            username="waiter_test",
            password="testpass123"
        )

        waiter_user.groups.create(name="Waiter")

        self.client.force_authenticate(user=waiter_user)

        complaints_response = self.client.get(
            "/api/complaints/"
        )

        payments_response = self.client.get(
            "/api/payments/"
        )

        self.assertEqual(complaints_response.status_code, 403)
        self.assertEqual(payments_response.status_code, 403)
