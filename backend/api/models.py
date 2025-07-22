
from django.db import models
from django.contrib.auth.models import User
import os
from django.core.exceptions import ValidationError
from django.conf import settings

class AuditLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    action = models.CharField(max_length=200)
    path = models.CharField(max_length=255)
    ip = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.TextField(blank=True)

    def __str__(self):
        return f"{self.timestamp} {self.user} {self.action} {self.path}"

def validate_video_file(value):
    ext = os.path.splitext(value.name)[1]  # e.g. ".mp4"
    valid_extensions = ['.mp4', '.mov', '.avi', '.mkv']
    if not ext.lower() in valid_extensions:
        raise ValidationError('Unsupported file extension.')


class Video(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    video_file = models.FileField(upload_to='videos/')
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
     return self.title
     
class Comment(models.Model):
    video = models.ForeignKey('Video', on_delete=models.CASCADE, related_name='comments')
    user = models.CharField(max_length=64)  # Store username or use ForeignKey if using Django users
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

