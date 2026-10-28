from django.db import models

class Invoice(models.Model):
    invoice_number = models.CharField(max_length=50, unique=True)
    issue_date = models.DateField()
    due_date = models.DateField()
    status = models.CharField(max_length=20, default='Unpaid')
    
    # Sender details
    sender_name = models.CharField(max_length=100)
    sender_email = models.EmailField()
    sender_address = models.TextField()
    
    # Client details
    client_name = models.CharField(max_length=100)
    client_email = models.EmailField()
    client_address = models.TextField()
    
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=10.00)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.invoice_number} - {self.client_name}"

class LineItem(models.Model):
    invoice = models.ForeignKey(Invoice, related_name='items', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    rate = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.description