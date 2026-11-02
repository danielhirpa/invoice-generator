# invoices/views.py
from rest_framework import generics
from .models import Invoice
from .serializers import InvoiceSerializer

class InvoiceListCreateView(generics.ListCreateAPIView):
    queryset = Invoice.objects.all().order_by('-created_at')
    serializer_class = InvoiceSerializer