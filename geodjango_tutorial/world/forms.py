from django.contrib.auth.forms import UserCreationForm

# custom signup form extending the default user creation form
class SignUpForm(UserCreationForm):
    def __init__(self, *args, **kwargs):
        # call the parent class initializer
        super().__init__(*args, **kwargs)
        # update attributes for the username field widget
        self.fields['username'].widget.attrs.update({
            'class': 'form-control',  # add bootstrap class for styling
            'autocomplete': 'username',  # enable username autocomplete
            'aria-describedby': 'id_username_helptext'  # link to help text for accessibility
        })
        # update attributes for the password1 field widget
        self.fields['password1'].widget.attrs.update({
            'class': 'form-control',  # add bootstrap class for styling
            'autocomplete': 'new-password'  # enable new password autocomplete
        })