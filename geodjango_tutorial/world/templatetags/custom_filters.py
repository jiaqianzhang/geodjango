# world/templatetags/custom_filters.py

from django import template
from django.forms.boundfield import BoundField

register = template.Library()

@register.filter(name='addclass')
def addclass(field, css_class):
    if not isinstance(field, BoundField):
        return field
    return field.as_widget(attrs={
        "class": f"{field.field.widget.attrs.get('class', '')} {css_class}".strip()
    })

@register.filter(name='attr')
def attr(field, attr_string):
    if not isinstance(field, BoundField):
        return field
    
    try:
        attribute, value = attr_string.split(':')
        attrs = field.field.widget.attrs.copy()
        attrs[attribute] = value
        return field.as_widget(attrs=attrs)
    except ValueError:
        return field
