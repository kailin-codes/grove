import React, { useState } from 'react';
import { z } from 'zod';

export const paymentMethodSchema = z.object({
  type: z.enum(['Credit Card', 'Debit Card']),
  cardNumber: z.string().regex(/^\d{16}$/, "Card number must be 16 digits"),
  nameOnCard: z.string().min(2, "Name on card must be at least 2 characters"),
  expirationDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Expiration date must be in MM/YY format"),
  isDefault: z.boolean(),
});

export type PaymentMethodData = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormProps {
  onSubmit: (paymentMethodData: PaymentMethodData) => void;
  onCancel: () => void;
}

const PaymentMethodForm: React.FC<PaymentMethodFormProps> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<PaymentMethodData>({
    type: 'Credit Card',
    cardNumber: '',
    nameOnCard: '',
    expirationDate: '',
    isDefault: false,
  });
  const [errors, setErrors] = useState<Partial<PaymentMethodData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validatedData = paymentMethodSchema.parse(formData);
      onSubmit(validatedData);
      setErrors({});
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(error.flatten().fieldErrors as Partial<PaymentMethodData>);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Add a new payment method</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Card type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
            </select>
            {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
          </div>
          <div>
            <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">Card number</label>
            <input
              id="cardNumber"
              name="cardNumber"
              type="text"
              value={formData.cardNumber}
              onChange={handleChange}
              placeholder="1234567890123456"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
          </div>
          <div>
            <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700">Name on card</label>
            <input
              id="nameOnCard"
              name="nameOnCard"
              type="text"
              value={formData.nameOnCard}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.nameOnCard && <p className="text-red-500 text-xs mt-1">{errors.nameOnCard}</p>}
          </div>
          <div>
            <label htmlFor="expirationDate" className="block text-sm font-medium text-gray-700">Expiration date</label>
            <input
              id="expirationDate"
              name="expirationDate"
              type="text"
              value={formData.expirationDate}
              onChange={handleChange}
              placeholder="MM/YY"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.expirationDate && <p className="text-red-500 text-xs mt-1">{errors.expirationDate}</p>}
          </div>
          <div className="flex items-center">
            <input
              id="isDefault"
              name="isDefault"
              type="checkbox"
              checked={formData.isDefault}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
              Set as default payment method
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-yellow-400 border border-yellow-500 py-2 px-4 rounded-md shadow-sm text-sm font-medium text-gray-900 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
            >
              Add payment method
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodForm;