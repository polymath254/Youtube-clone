from .models import AuditLog
from django.utils.deprecation import MiddlewareMixin

class AuditLogMiddleware(MiddlewareMixin):
    def process_response(self, request, response):
        user = request.user if request.user.is_authenticated else None
        ip = request.META.get('REMOTE_ADDR')
        AuditLog.objects.create(
            user=user,
            action=f"{request.method} {response.status_code}",
            path=request.path,
            ip=ip,
            details=f"Response: {response.status_code}"
        )
        return response
