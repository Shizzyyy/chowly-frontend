from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("chowly", "0013_fix_missing_accepted_at"),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunSQL(
                    sql="""
                        ALTER TABLE chowly_order
                        ADD COLUMN IF NOT EXISTS accepted_at
                        TIMESTAMP WITH TIME ZONE NULL;
                    """,
                    reverse_sql="""
                        ALTER TABLE chowly_order
                        DROP COLUMN IF EXISTS accepted_at;
                    """,
                ),
            ],
            state_operations=[
                migrations.AddField(
                    model_name="order",
                    name="accepted_at",
                    field=models.DateTimeField(
                        blank=True,
                        null=True,
                    ),
                ),
            ],
        ),
    ]
