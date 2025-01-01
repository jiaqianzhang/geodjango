from django.contrib.auth.forms import UserCreationForm

class SignUpForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',
            'autocomplete': 'username',
            'aria-describedby': 'id_username_helptext'
        })
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',
            'autocomplete': 'new-password'
        })
