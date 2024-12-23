# Generated by Django 5.1.4 on 2024-12-10 12:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('world', '0005_alter_electoraldistricts_osm_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='electoraldistricts',
            name='co_osm_id',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='electoraldistricts',
            name='epoch_tstm',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='electoraldistricts',
            name='osm_timest',
            field=models.CharField(blank=True, max_length=255, null=True),
        ),
    ]
