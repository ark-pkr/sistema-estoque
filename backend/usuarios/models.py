from django.contrib.auth.models import AbstractUser
from django.db import models


class Usuario(AbstractUser):
    TIPOS = [
        ("admin", "Administrador"),
        ("gerente", "Gerente"),
        ("estoquista", "Estoquista"),
        ("vendedor", "Vendedor"),
    ]

    nome = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    tipo = models.CharField(max_length=20, choices=TIPOS, default="vendedor")
    ativo = models.BooleanField(default=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return f"{self.nome} ({self.email})"