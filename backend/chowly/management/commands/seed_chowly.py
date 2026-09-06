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
            (
                "Smoky Party Jollof Rice",
                "food",
                4500,
                25,
                "Mains",
                True,
                "Long-grain rice simmered in rich tomato-pepper base with smoked spices. Served with grilled chicken and plantain.",
                "https://images.pexels.com/photos/13915043/pexels-photo-13915043.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Jollof Rice & Chicken Bowl",
                "food",
                5200,
                25,
                "Mains",
                True,
                "Fluffy jollof rice topped with grilled chicken, boiled egg, and coleslaw. A complete meal in one bowl.",
                "https://images.pexels.com/photos/18805640/pexels-photo-18805640.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Nigerian Fried Rice",
                "food",
                4800,
                30,
                "Mains",
                False,
                "Fragrant stir-fried rice with diced vegetables, liver, and prawns. Seasoned with curry and thyme.",
                "https://images.pexels.com/photos/8864543/pexels-photo-8864543.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Egusi Soup & Pounded Yam",
                "food",
                5500,
                30,
                "Soups",
                True,
                "Rich melon-seed soup with assorted meat and stockfish. Served with smooth pounded yam.",
                "https://upload.wikimedia.org/wikipedia/commons/3/3a/Egusi_soup_with_pounded_yam_and_assorted_meats.jpg",
            ),
            (
                "Efo Riro with Assorted Meat",
                "food",
                5000,
                30,
                "Soups",
                False,
                "Spinach stew loaded with palm oil, locust beans, assorted meat, and dried fish.",
                "https://images.pexels.com/photos/34822475/pexels-photo-34822475.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Catfish Pepper Soup",
                "food",
                6000,
                20,
                "Soups",
                False,
                "Light aromatic pepper soup with fresh catfish, utazi leaves, and traditional spices.",
                "https://allnigerianfoods.com/wp-content/uploads/catfish-pepper-soup-recipe.jpg",
            ),
            (
                "Beef Suya Skewers",
                "food",
                3500,
                15,
                "Grills",
                True,
                "Charcoal-grilled beef coated in fiery yaji spice. Served with fresh onions and tomatoes.",
                "https://images.pexels.com/photos/11989697/pexels-photo-11989697.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Yaji Grilled Chicken",
                "food",
                6500,
                25,
                "Grills",
                False,
                "Half chicken marinated in suya spice and grilled over open flame. Juicy and crispy.",
                "https://images.pexels.com/photos/8707683/pexels-photo-8707683.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Peppered Goat Asun",
                "food",
                7000,
                20,
                "Grills",
                False,
                "Smoky diced goat meat tossed in scotch bonnet peppers and onions. Fiery and tender.",
                "https://images.pexels.com/photos/18719656/pexels-photo-18719656.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Fried Plantain (Dodo)",
                "food",
                1500,
                10,
                "Sides",
                True,
                "Sweet caramelized plantain fried golden. Crisp edges, soft center.",
                "https://images.pexels.com/photos/12362298/pexels-photo-12362298.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Akara & Pap",
                "food",
                2000,
                15,
                "Sides",
                False,
                "Golden bean cakes served with smooth warm akamu (pap). Classic breakfast.",
                "https://images.pexels.com/photos/34943603/pexels-photo-34943603.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Puff Puff (6 pieces)",
                "food",
                1800,
                10,
                "Desserts",
                True,
                "Soft pillowy fried dough balls with a hint of nutmeg. Golden and fluffy.",
                "https://images.pexels.com/photos/5949005/pexels-photo-5949005.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Chin Chin (Family Pack)",
                "food",
                2200,
                5,
                "Desserts",
                False,
                "Crunchy fried pastry bites with nutmeg and vanilla. Dangerously moreish.",
                "https://images.pexels.com/photos/36038590/pexels-photo-36038590.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Chilled Zobo Drink",
                "drinks",
                1000,
                5,
                "Non-Alcoholic",
                True,
                "Refreshing hibiscus tea infused with ginger, pineapple, and cucumber. Served ice-cold.",
                "https://images.pexels.com/photos/34567239/pexels-photo-34567239.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Chapman Cocktail",
                "drinks",
                1500,
                5,
                "Non-Alcoholic",
                False,
                "Nigeria's favourite party cocktail — fruit juices, grenadine, cucumber, and citrus. Non-alcoholic.",
                "https://images.pexels.com/photos/33284162/pexels-photo-33284162.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Fresh Palm Wine",
                "drinks",
                2000,
                3,
                "Traditional",
                True,
                "Tapped fresh from the palm tree. Sweet, slightly tart, and naturally effervescent.",
                "https://upload.wikimedia.org/wikipedia/commons/8/88/Traditional_Palm_Wine.jpg",
            ),
            (
                "Fresh Coconut Water",
                "drinks",
                1200,
                3,
                "Non-Alcoholic",
                False,
                "Chilled coconut water served straight from the shell. Pure hydration.",
                "https://images.pexels.com/photos/11398730/pexels-photo-11398730.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Iced Caramel Macchiato",
                "drinks",
                1800,
                7,
                "Coffee & Tea",
                True,
                "Espresso over ice with milk and caramel drizzle. Smooth and refreshing.",
                "https://images.pexels.com/photos/2813281/pexels-photo-2813281.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
            (
                "Chilled Bottle Beer",
                "drinks",
                1500,
                2,
                "Alcoholic",
                False,
                "Your favourite lager, served ice-cold. Perfect with suya.",
                "https://images.pexels.com/photos/12089506/pexels-photo-12089506.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
            ),
        ]

        for (
            name,
            item_type,
            price,
            preparation_time,
            category,
            popular,
            description,
            image,
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
                    "description": description,
                    "image": image,
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
