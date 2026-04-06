from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo == "admin"


class IsGerente(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo == "gerente"


class IsFuncionario(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo == "funcionario"


class IsAdminOrGerente(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo in ["admin", "gerente"]


class IsAdminOrGerenteOrReadOnly(BasePermission):
    """
    Admin e gerente podem tudo.
    Outros só leitura (GET)
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user
            and request.user.is_authenticated
            and request.user.tipo in ["admin", "gerente"]
        )


class IsAuthenticatedAndActive(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_active