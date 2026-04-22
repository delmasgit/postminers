from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    # The fields to be used in displaying the User model.
    # We remove username and use email instead.
    list_display = ('email', 'first_name', 'last_name', 'is_email_verified', 'is_staff', 'is_active', 'created_at')
    list_filter = ('is_email_verified', 'is_staff', 'is_superuser', 'is_active', 'groups')
    search_fields = ('email', 'first_name', 'last_name')
    ordering = ('-created_at',)

    # Remove username from fieldsets
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name')}),
        ('Business logic', {'fields': ('is_email_verified',)}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined', 'created_at', 'updated_at')}),
    )

    # Add custom add_fieldsets for user creation form in admin
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'first_name', 'last_name', 'password'),
        }),
    )
    readonly_fields = ('created_at', 'updated_at', 'last_login', 'date_joined')
