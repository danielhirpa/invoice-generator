from rest_framework import serializers
from .models import Invoice, InvoiceItem

class InvoiceItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InvoiceItem
        fields = ['description', 'quantity', 'price']

class InvoiceSerializer(serializers.ModelSerializer):
    items = InvoiceItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = ['id', 'client_name', 'invoice_number', 'due_date', 'total_amount', 'created_at', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            InvoiceItem.objects.create(invoice=invoice, **item_data)
        return invoice