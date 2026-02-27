from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0040_remove_blogpost_cover_image_old'),
    ]

    operations = [
        migrations.AddField(
            model_name='blogpost',
            name='image_fit',
            field=models.CharField(
                choices=[('cover', 'Fill/Crop'), ('contain', 'Fit/Stretch'), ('fill', 'Stretch')],
                default='cover',
                max_length=20
            ),
        ),
    ]
