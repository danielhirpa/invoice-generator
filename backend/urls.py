# backend/urls.py
from django.contrib import admin
from django.urls import path
from .views import InvoiceListCreateView  # Use .views instead of invoices.views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/invoices/', InvoiceListCreateView.as_view(), name='invoice-list-create'),
]