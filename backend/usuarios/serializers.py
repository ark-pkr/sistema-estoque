from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

User = get_user_model()


class UsuarioSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ["id", "nome", "email", "tipo", "ativo", "senha"]
        extra_kwargs = {
            "nome": {"required": True},
            "email": {"required": True},
            "tipo": {"required": True},
        }

    def create(self, validated_data):
        senha = validated_data.pop("senha", None)

        user = User(**validated_data)

        if senha:
            user.set_password(senha)
        else:
            user.set_password("123456")

        user.save()
        return user

    def update(self, instance, validated_data):
        senha = validated_data.pop("senha", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if senha:
            instance.set_password(senha)

        instance.save()
        return instance


class UsuarioMeSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "nome", "email", "tipo", "ativo"]


class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        if not email:
            raise serializers.ValidationError({"email": ["Este campo é obrigatório."]})

        if not password:
            raise serializers.ValidationError({"password": ["Este campo é obrigatório."]})

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"detail": "Usuário ou senha inválidos."})

        if not user.check_password(password):
            raise serializers.ValidationError({"detail": "Usuário ou senha inválidos."})

        if not getattr(user, "ativo", True):
            raise serializers.ValidationError({"detail": "Este usuário está inativo."})

        refresh = self.get_token(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": {
                "id": user.id,
                "nome": getattr(user, "nome", "") or user.email,
                "email": user.email,
                "tipo": getattr(user, "tipo", "vendedor"),
                "ativo": getattr(user, "ativo", True),
            },
        }