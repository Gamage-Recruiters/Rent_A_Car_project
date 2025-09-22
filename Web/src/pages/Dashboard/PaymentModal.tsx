import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  IconButton,
  Box,
} from '@mui/material';
import { X } from 'lucide-react';

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ open, onClose }) => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: handle save here
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant="h6">Add New Payment Method</Typography>
        <IconButton onClick={onClose} size="small" aria-label="close">
          <X size={20} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box component="form" id="payment-form" onSubmit={handleSubmit}>
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              id="cardNumber"
              label="Card Number"
              placeholder="1234 5678 9012 3456"
              variant="outlined"
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                id="expiry"
                label="Expiry"
                placeholder="MM/YY"
                variant="outlined"
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <TextField
                fullWidth
                id="cvc"
                label="CVC"
                placeholder="123"
                variant="outlined"
                type="password"
              />
            </Box>
          </Box>

          <Box sx={{ mb: 1 }}>
            <TextField
              fullWidth
              id="name"
              label="Cardholder Name"
              placeholder="Full Name"
              variant="outlined"
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">Cancel</Button>
        <Button type="submit" form="payment-form" variant="contained">Save Card</Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
