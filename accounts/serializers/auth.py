from rest_framework import serializers
from ..models import CustomUser

class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ('id', 'email', 'password', 'first_name', 'last_name', 'phone_number', 'role')

        def create(self, validated_data):
            password = validated_data.pop('password')
            user = CustomUser(**validated_data)
            user.set_password(password)
            user.save()
            return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser    
        fields = ('id', 'email', 'first_name', 'last_name', 'phone_number', 'role', 'is_active', 'date_joined')
        read_only_fields = fields
