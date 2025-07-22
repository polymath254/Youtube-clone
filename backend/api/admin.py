from django.contrib import admin
from .models import Comment
from .models import Video, AuditLog

admin.site.register(Video)
admin.site.register(AuditLog)
admin.site.register(Comment)

