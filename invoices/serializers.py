from rest_framework import serializers
from .models import Invoice, LineItem

class LineItemSerializer(serializers.ModelSerializer):
    # Allow id to be optional or passed during updates/creations
    id = serializers.IntegerField(required=False)

    class Meta:
        model = LineItem
        fields = ['id', 'description', 'quantity', 'rate']

class InvoiceSerializer(serializers.ModelSerializer):
    # Nested line items for full invoice creation & retrieval
    items = LineItemSerializer(many=True)

    class Meta:
        model = Invoice
        fields = [
            'id', 'invoice_number', 'issue_date', 'due_date', 'status',
            'sender_name', 'sender_email', 'sender_address',
            'client_name', 'client_email', 'client_address',
            'tax_rate', 'notes', 'items', 'created_at'
        ]

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        invoice = Invoice.objects.create(**validated_data)
        for item_data in items_data:
            LineItem.objects.create(invoice=invoice, **item_data)
        return invoice

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', [])
        
        # Update scalar invoice fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle nested line items sync
        existing_items = {item.id: item for item in instance.items.all()}
        updated_item_ids = []

        for item_data in items_data:
            item_id = item_data.get('id')
            if item_id and item_id in existing_items:
                # Update existing item
                item = existing_items[item_id]
                item.description = item_data.get('description', item.description)
                item.quantity = item_data.get('quantity', item.quantity)
                item.rate = item_data.get('rate', item.rate)
                item.save()
                updated_item_ids.append(item_id)
            else:
                # Create new item
                new_item = LineItem.objects.create(invoice=instance, **item_data)
                updated_item_ids.append(new_item.id)

        # Remove items that were deleted from the frontend form
        for item_id, item in existing_items.items():
            if item_id not in updated_item_ids:
                item.delete()

        return instance