from django.db import models
from django.contrib.auth.models import AbstractUser
from shared.models import BaseModel
from .managers import CustomUserManager

class CustomUser(AbstractUser, BaseModel):
    # Remove the username field entirely
    username = None 
    
    # Make email the primary, unique identifier
    email = models.EmailField('email address', unique=True)
    
    # Required profile fields
    first_name = models.CharField('first name', max_length=150)
    last_name = models.CharField('last name', max_length=150)
    
    # Our custom business logic fields
    is_email_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = CustomUserManager()

    class Meta:
        db_table = 'auth_customuser'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    def __str__(self):
        return self.email
        
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()