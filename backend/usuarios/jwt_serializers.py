from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Usuario


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = Usuario.EMAIL_FIELD

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("E-mail e senha são obrigatórios.")

        attrs["username"] = email
        data = super().validate(attrs)

        if not self.user.ativo:
            raise serializers.ValidationError("Este usuário está inativo.")

        data["user"] = {
            "id": self.user.id,
            "nome": self.user.nome,
            "email": self.user.email,
            "tipo": self.user.tipo,
            "ativo": self.user.ativo,
        }
        return data