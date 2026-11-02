# backend/views.py
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from .models import Invoice
from .serializers import InvoiceSerializer
import traceback

class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            # Force Django to return JSON instead of crashing with an HTML error page
            print("--- DJANGO BACKEND ERROR TRACEBACK ---")
            traceback.print_exc()
            return Response(
                {"detail": str(e), "error_type": type(e).__name__},
                status=status.HTTP_400_BAD_REQUEST
            )