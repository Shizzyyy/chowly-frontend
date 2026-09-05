from rest_framework.permissions import BasePermission
from rest_framework.permissions import DjangoModelPermissions


class CustomDjangoModelPermissions(DjangoModelPermissions):
    perms_map = {
        "GET": ["%(app_label)s.view_%(model_name)s"],
        "OPTIONS": [],
        "HEAD": [],
        "POST": ["%(app_label)s.add_%(model_name)s"],
        "PUT": ["%(app_label)s.change_%(model_name)s"],
        "PATCH": ["%(app_label)s.change_%(model_name)s"],
        "DELETE": ["%(app_label)s.delete_%(model_name)s"],
    }


def is_customer(user):
    return (
        user.is_authenticated
        and user.groups.filter(
            name="Customer"
        ).exists()
    )


def is_waiter(user):
    return (
        user.is_authenticated
        and user.groups.filter(
            name="Waiter"
        ).exists()
    )


class CustomerPermission(BasePermission):
    def has_permission(self, request, view):
        return is_customer(request.user)


class WaiterPermission(BasePermission):
    def has_permission(self, request, view):
        return is_waiter(request.user)


class OrderPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return (
                is_customer(request.user)
                or is_waiter(request.user)
            )

        if request.method == "POST":
            return is_customer(request.user)

        return False


class OrderDetailPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return (
                is_customer(request.user)
                or is_waiter(request.user)
            )

        if request.method in [
            "PUT",
            "PATCH",
        ]:
            return is_waiter(request.user)

        return False

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if is_waiter(request.user):
            return (
                obj.restaurant.waiters.filter(
                    user=request.user
                ).exists()
            )

        if is_customer(request.user):
            return obj.customer.user == request.user

        return False


class OrderItemPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return (
                is_customer(request.user)
                or is_waiter(request.user)
            )

        if request.method == "POST":
            return is_customer(request.user)

        return False


class OrderItemDetailPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return (
                is_customer(request.user)
                or is_waiter(request.user)
            )

        return False

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if is_waiter(request.user):
            return (
                obj.order.restaurant.waiters.filter(
                    user=request.user
                ).exists()
            )

        if is_customer(request.user):
            return (
                obj.order.customer.user
                == request.user
            )

        return False


class ComplaintPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return (
                is_customer(request.user)
                or is_waiter(request.user)
            )

        if request.method == "POST":
            return is_customer(request.user)

        return False

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if is_customer(request.user):
            return obj.order.customer.user == request.user

        if is_waiter(request.user):
            return (
                obj.order.restaurant.waiters.filter(
                    user=request.user
                ).exists()
            )

        return False


class PaymentPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        if request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]:
            return is_customer(request.user)

        if request.method == "POST":
            return is_customer(request.user)

        return False

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        return (
            is_customer(request.user)
            and obj.order.customer.user
            == request.user
        )


class NotificationPermission(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated
            and (
                is_customer(request.user)
                or is_waiter(request.user)
            )
        )

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        return obj.recipient == request.user


class MenuPermission(BasePermission):
    def has_permission(self, request, view):
        return request.method in [
            "GET",
            "HEAD",
            "OPTIONS",
        ]
