const express = require('express');
const app = express();
const PORT = process.env.PORT || 8005;

app.use(express.json());

// In-memory storage for invoices
const invoices = [
  { id: 1, patientId: "P123", amount: 150.00, status: "PAID", date: "2026-05-10" },
  { id: 2, patientId: "P123", amount: 75.00, status: "PENDING", date: "2026-05-15" }
];

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP', service: 'billing-service' });
});

// Get all invoices
app.get('/invoices', (req, res) => {
  res.status(200).json(invoices);
});

// Create an invoice
app.post('/invoices', (req, res) => {
  const { patientId, amount } = req.body;
  if (!patientId || !amount) {
    return res.status(400).json({ message: "PatientID and Amount are required" });
  }
  
  const newInvoice = {
    id: invoices.length + 1,
    patientId,
    amount,
    status: "PENDING",
    date: new Date().toISOString().split('T')[0]
  };
  
  invoices.push(newInvoice);
  res.status(201).json(newInvoice);
});

// Process payment (Simulated)
app.post('/payments', (req, res) => {
  const { invoiceId } = req.body;
  if (!invoiceId) {
    return res.status(400).json({ message: "InvoiceID is required" });
  }
  
  const invoice = invoices.find(inv => inv.id === invoiceId);
  if (!invoice) {
    return res.status(404).json({ message: "Invoice not found" });
  }
  
  if (invoice.status === "PAID") {
    return res.status(400).json({ message: "Invoice is already paid" });
  }
  
  // Simulate payment processing
  invoice.status = "PAID";
  
  res.status(200).json({ message: "Payment successful", invoice });
});

app.listen(PORT, () => {
  console.log(`Billing Service running on port ${PORT}`);
});
