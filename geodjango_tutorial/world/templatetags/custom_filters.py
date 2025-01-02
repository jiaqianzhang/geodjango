# world/templatetags/custom_filters.py
# custom template filters for form field manipulation

from django import template
from django.forms.boundfield import BoundField

# register the template library for custom filters
register = template.Library()

@register.filter(name='addclass')
def addclass(field, css_class):
    # custom filter to add css classes to form fields
    # returns unmodified field if it's not a form field
    if not isinstance(field, BoundField):
        return field
    # adds new css class while preserving existing classes
    return field.as_widget(attrs={
        "class": f"{field.field.widget.attrs.get('class', '')} {css_class}".strip()
    })

@register.filter(name='attr')
def attr(field, attr_string):
    # custom filter to add any html attribute to form fields
    # returns unmodified field if it's not a form field
    if not isinstance(field, BoundField):
        return field
    
    try:
        # splits the attribute string into name and value (format: "attribute:value")
        attribute, value = attr_string.split(':')
        # create a copy of existing attributes
        attrs = field.field.widget.attrs.copy()
        # add the new attribute
        attrs[attribute] = value
        # render the field with updated attributes
        return field.as_widget(attrs=attrs)
    except ValueError:
        # return unmodified field if attribute string is invalid
        return field
