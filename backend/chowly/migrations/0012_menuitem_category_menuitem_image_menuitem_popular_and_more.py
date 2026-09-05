from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chowly", "0011_order_preparing_started_at_notification"),
    ]

    operations = [
        migrations.AddField(
            model_name="menuitem",
            name="category",
            field=models.CharField(
                blank=True,
                default="",
                max_length=100,
            ),
        ),
        migrations.AddField(
            model_name="menuitem",
            name="image",
            field=models.URLField(
                blank=True,
                default="",
            ),
        ),
        migrations.AddField(
            model_name="menuitem",
            name="popular",
            field=models.BooleanField(
                default=False,
            ),
        ),
        migrations.AlterField(
            model_name="menuitem",
            name="item_type",
            field=models.CharField(
                choices=[
                    ("food", "Food"),
                    ("drinks", "Drinks"),
                ],
                max_length=20,
            ),
        ),
    ]
