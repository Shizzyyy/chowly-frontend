from decimal import Decimal

from django.contrib.auth.models import Group, User
from django.core.management.base import BaseCommand

from chowly.models import (
    Bartender,
    Chef,
    Customer,
    MenuItem,
    Restaurant,
    Waiter,
)


class Command(BaseCommand):
    help = "Seed Chowly with restaurant, menu, staff, and demo accounts."

    def handle(self, *args, **options):
        customer_group, _ = Group.objects.get_or_create(
            name="Customer"
        )
        waiter_group, _ = Group.objects.get_or_create(
            name="Waiter"
        )

        restaurant, _ = Restaurant.objects.update_or_create(
            email="chowly@example.com",
            defaults={
                "name": "Chowly Restaurant",
                "address": "Lagos, Nigeria",
                "phone_number": "08000000000",
            },
        )

        menu_items = [
            ("Smoky Party Jollof Rice", "food", 4500, 25, "Mains", True),
            ("Jollof Rice & Chicken Bowl", "food", 5200, 25, "Mains", True),
            ("Nigerian Fried Rice", "food", 4800, 30, "Mains", False),
            ("Egusi Soup & Pounded Yam", "food", 5500, 30, "Soups", True),
            ("Efo Riro with Assorted Meat", "food", 5000, 30, "Soups", False),
            ("Catfish Pepper Soup", "food", 6000, 20, "Soups", False),
            ("Beef Suya Skewers", "food", 3500, 15, "Grills", True),
            ("Yaji Grilled Chicken", "food", 6500, 25, "Grills", False),
            ("Peppered Goat Asun", "food", 7000, 20, "Grills", False),
            ("Fried Plantain (Dodo)", "food", 1500, 10, "Sides", True),
            ("Akara & Pap", "food", 2000, 15, "Sides", False),
            ("Puff Puff (6 pieces)", "food", 1800, 10, "Desserts", True),
            ("Chin Chin (Family Pack)", "food", 2200, 5, "Desserts", False),
            ("Chilled Zobo Drink", "drinks", 1000, 5, "Non-Alcoholic", True),
            ("Chapman Cocktail", "drinks", 1500, 5, "Non-Alcoholic", False),
            ("Fresh Palm Wine", "drinks", 2000, 3, "Traditional", True),
            ("Fresh Coconut Water", "drinks", 1200, 3, "Non-Alcoholic", False),
            ("Iced Caramel Macchiato", "drinks", 1800, 7, "Coffee & Tea", True),
            ("Chilled Bottle Beer", "drinks", 1500, 2, "Alcoholic", False),
        ]

        for (
            name,
            item_type,
            price,
            preparation_time,
            category,
            popular,
        ) in menu_items:
            MenuItem.objects.update_or_create(
                name=name,
                restaurant=restaurant,
                defaults={
                    "item_type": item_type,
                    "price": Decimal(price),
                    "preparation_time": preparation_time,
                    "category": category,
                    "popular": popular,
                    "description": "",
                    "image": "",
                },
            )

        chefs = [
            ("Chef Tunde", "08000000001"),
            ("Chef Amaka", "08000000002"),
            ("Chef Bola", "08000000003"),
        ]

        for name, phone in chefs:
            Chef.objects.update_or_create(
                name=name,
                restaurant=restaurant,
                defaults={
                    "phone_number": phone,
                },
            )

        bartenders = [
            ("Bartender Emeka", "08000000004"),
            ("Bartender Ngozi", "08000000005"),
        ]

        for name, phone in bartenders:
            Bartender.objects.update_or_create(
                name=name,
                restaurant=restaurant,
                defaults={
                    "phone_number": phone,
                },
            )

        waiters = [
            (
                "Waiter Chidi",
                "waiter_chidi",
                "08000000006",
                "waiter123",
            ),
            (
                "Waiter Funmi",
                "waiter_funmi",
                "08000000007",
                "waiter123",
            ),
        ]

        for name, username, phone, password in waiters:
            user, created = User.objects.get_or_create(
                username=username
            )

            user.set_password(password)
            user.save()

            user.groups.add(waiter_group)

            Waiter.objects.update_or_create(
                user=user,
                defaults={
                    "name": name,
                    "phone_number": phone,
                    "restaurant": restaurant,
                },
            )

        customer_user, _ = User.objects.get_or_create(
            username="customer_demo"
        )

        customer_user.set_password("customer123")
        customer_user.save()
        customer_user.groups.add(customer_group)

        Customer.objects.update_or_create(
            user=customer_user,
            defaults={
                "name": "Demo Customer",
                "phone_number": "08000000008",
                "email": "customer@chowly.example.com",
            },
        )

        self.stdout.write(
            self.style.SUCCESS(
                "Chowly seed data created successfully."
            )
        )

        self.stdout.write("")
        self.stdout.write("Demo customer:")
        self.stdout.write("  Username: customer_demo")
        self.stdout.write("  Password: customer123")
        self.stdout.write("")
        self.stdout.write("Demo waiters:")
        self.stdout.write("  Username: waiter_chidi")
        self.stdout.write("  Password: waiter123")
        self.stdout.write("  Username: waiter_funmi")
        self.stdout.write("  Password: waiter123")
