# Generated migration for blog image upload support

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0038_order_earnings_applied'),
    ]

    operations = [
        migrations.RenameField(
            model_name='blogpost',
            old_name='cover_image',
            new_name='cover_image_old',
        ),
        migrations.AddField(
            model_name='blogpost',
            name='cover_image_file',
            field=models.ImageField(blank=True, null=True, upload_to='blog_covers/'),
        ),
        migrations.AddField(
            model_name='blogpost',
            name='cover_image',
            field=models.CharField(blank=True, max_length=500),
        ),
    ]
