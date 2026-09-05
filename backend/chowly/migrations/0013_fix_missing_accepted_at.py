from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("chowly", "0012_menuitem_category_menuitem_image_menuitem_popular_and_more"),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
                ALTER TABLE chowly_order
                ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMP WITH TIME ZONE NULL;
            """,
            reverse_sql="""
                ALTER TABLE chowly_order
                DROP COLUMN IF EXISTS accepted_at;
            """,
        ),
    ]
