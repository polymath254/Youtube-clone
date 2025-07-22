from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import generics, permissions
from .models import Video
from .serializers import VideoSerializer
from django.http import FileResponse, Http404, StreamingHttpResponse
from django.conf import settings
import os
import mimetypes
from .models import Comment
from .serializers import CommentSerializer
from rest_framework import generics



@api_view(['GET'])
def api_root(request):
    return Response({"message": "API is working!"})

class VideoListCreateView(generics.ListCreateAPIView):
    queryset = Video.objects.all().order_by('-uploaded_at')
    serializer_class = VideoSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)

#streaming video files
def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def stream_video(request, pk):
    from .models import Video
    try:
        video = Video.objects.get(pk=pk)
    except Video.DoesNotExist:
        raise Http404

    file_path = video.video_file.path
    file_size = os.path.getsize(file_path)
    content_type, encoding = mimetypes.guess_type(file_path)
    content_type = content_type or 'application/octet-stream'

    range_header = request.headers.get('Range')
    if range_header:
        # Parse range header: "bytes=start-end"
        range_match = range_header.strip().split("=")[-1].split("-")
        start = int(range_match[0])
        end = int(range_match[1]) if range_match[1] else file_size - 1
        length = end - start + 1

        def file_iterator(file_path, offset, length):
            with open(file_path, 'rb') as f:
                f.seek(offset)
                bytes_read = 0
                chunk_size = 8192
                while bytes_read < length:
                    chunk = f.read(min(chunk_size, length - bytes_read))
                    if not chunk:
                        break
                    yield chunk
                    bytes_read += len(chunk)

        response = StreamingHttpResponse(file_iterator(file_path, start, length), status=206, content_type=content_type)
        response['Content-Length'] = str(length)
        response['Content-Range'] = f'bytes {start}-{end}/{file_size}'
        response['Accept-Ranges'] = 'bytes'
    else:
        response = FileResponse(open(file_path, 'rb'), content_type=content_type)
        response['Content-Length'] = str(file_size)
        response['Accept-Ranges'] = 'bytes'

    return response



class CommentListCreateView(generics.ListCreateAPIView):
    queryset = Comment.objects.all()
    serializer_class = CommentSerializer
