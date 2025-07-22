from django.urls import path
from .views import api_root, VideoListCreateView, stream_video, CommentListCreateView
urlpatterns = [
    path('', api_root),
    path('videos/', VideoListCreateView.as_view(), name='video-list-create'),
    path('videos/<int:pk>/stream/', stream_video, name='video-stream'),
    path('comments/', CommentListCreateView.as_view(), name='comment-list-create'),
]
