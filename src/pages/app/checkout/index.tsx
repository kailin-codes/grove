import type { NextPageWithLayout } from "@/pages/_app";
import Head from "next/head";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { trpc } from "@/utils/trpc";
import { useState, useEffect, useMemo } from "react";
import AddressForm, { type AddressData } from "@/components/AddressForm";
import PaymentMethodForm, { type PaymentMethodData } from "@/components/PaymentMethodForm";
import { toast } from "react-hot-toast";
import { useCartStore } from "@/stores/cart";
import { useRouter } from "next/router";
import ConfirmationModal from "@/components/ConfirmationModal";
import { formatCurrency } from "@/utils/format";

const deliveryOptions = [
  { id: 'standard', name: 'Standard Delivery', price: 0, days: '5-7 business days' },
  { id: 'express', name: 'Express Delivery', price: 9.99, days: '2-3 business days' },
  { id: 'overnight', name: 'Overnight Delivery', price: 19.99, days: '1 business day' },
] as const;

const TAX_RATE = 0.0665; // 6.65% flat tax rate

const Checkout: NextPageWithLayout = () => {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] = useState<string | null>(null);
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState<typeof deliveryOptions[number]>(deliveryOptions[0]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const { data: addresses, refetch: refetchAddresses } = trpc.users.getAddresses.useQuery();
  const { data: paymentMethods, refetch: refetchPaymentMethods } = trpc.users.getPaymentMethods.useQuery();

  const cartStore = useCartStore((state) => ({
    products: state.products,
    removeProducts: state.removeProducts,
  }));

  const itemsTotal = useMemo(() => {
    return cartStore.products.reduce((total, product) => total + product.price * product.quantity, 0);
  }, [cartStore.products]);

  const shippingCost = selectedDeliveryOption.price;
  const subtotal = itemsTotal + shippingCost;
  const tax = subtotal * TAX_RATE;
  const orderTotal = subtotal + tax;

  useEffect(() => {
    if (addresses) {
      const defaultAddress = addresses.find(address => address.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses]);

  useEffect(() => {
    if (paymentMethods) {
      const defaultPaymentMethod = paymentMethods.find(method => method.isDefault);
      if (defaultPaymentMethod) {
        setSelectedPaymentMethodId(defaultPaymentMethod.id);
      }
    }
  }, [paymentMethods]);

  const addAddressMutation = trpc.users.addAddress.useMutation({
    onSuccess: (newAddress) => {
      setShowAddressForm(false);
      refetchAddresses();
      if (newAddress.isDefault) {
        setSelectedAddressId(newAddress.id);
      }
    },
  });

  const addPaymentMethodMutation = trpc.users.addPaymentMethod.useMutation({
    onSuccess: (newPaymentMethod) => {
      setShowPaymentForm(false);
      refetchPaymentMethods();
      if (newPaymentMethod.isDefault) {
        setSelectedPaymentMethodId(newPaymentMethod.id);
      }
    },
  });

  const handleAddAddress = (addressData: AddressData) => {
    addAddressMutation.mutate(addressData);
  };

  const handleAddPaymentMethod = (paymentMethodData: PaymentMethodData) => {
    addPaymentMethodMutation.mutate(paymentMethodData);
  };

  const addOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Order placed successfully!");
      cartStore.removeProducts(cartStore.products.map(product => product.id));
      router.push("/app/orders");
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const handleCheckout = () => {
    if (!selectedAddressId || !selectedPaymentMethodId) {
      toast.error("Please select an address and payment method");
      return;
    }
    setIsConfirmModalOpen(true);
  };

  const confirmOrder = () => {
    if (selectedAddressId && selectedPaymentMethodId) {
      addOrderMutation.mutate({
        items: cartStore.products.map((product) => ({
          productId: product.id,
          productQuantity: product.quantity,
        })),
        addressId: selectedAddressId,
        paymentMethodId: selectedPaymentMethodId,
        deliveryOption: selectedDeliveryOption.id,
        shippingCost,
        tax,
        total: orderTotal,
      });
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <>
      <Head>
        <title>Checkout | Grove</title>
      </Head>
      <main className="min-h-screen bg-gray-100 pb-14 pt-48 md:pt-40 lg:pt-36">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold mb-8">Checkout</h1>
          <div className="flex flex-col lg:flex-row lg:gap-8">
            <div className="lg:w-2/3">
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="mb-4 text-xl font-bold">Select a delivery address</h2>
                {addresses && addresses.length > 0 ? (
                  <div className="space-y-4">
                    {addresses.map((address) => (
                      <label key={address.id} className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={() => setSelectedAddressId(address.id)}
                          className="mt-1"
                        />
                        <span>
                          <strong>{address.name}</strong><br />
                          {address.street}, {address.city}, {address.state} {address.zipCode}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p>No addresses found.</p>
                )}
                <button
                  onClick={() => setShowAddressForm(true)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Add a new address
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md mb-6">
                <h2 className="mb-4 text-xl font-bold">Payment method</h2>
                {paymentMethods && paymentMethods.length > 0 ? (
                  <div className="space-y-4">
                    {paymentMethods.map((method) => (
                      <label key={method.id} className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={selectedPaymentMethodId === method.id}
                          onChange={() => setSelectedPaymentMethodId(method.id)}
                          className="mt-1"
                        />
                        <span>
                          <strong>{method.type}</strong> ending in {method.cardNumber.slice(-4)}
                          <br />
                          {method.nameOnCard}
                        </span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p>No payment methods found.</p>
                )}
                <button
                  onClick={() => setShowPaymentForm(true)}
                  className="mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Add a new payment method
                </button>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="mb-4 text-xl font-bold">Delivery Options</h2>
                <div className="space-y-4">
                  {deliveryOptions.map((option) => (
                    <label key={option.id} className="flex items-start space-x-3">
                      <input
                        type="radio"
                        name="deliveryOption"
                        value={option.id}
                        checked={selectedDeliveryOption.id === option.id}
                        onChange={() => setSelectedDeliveryOption(option)}
                        className="mt-1"
                      />
                      <span>
                        <strong>{option.name}</strong> - {formatCurrency(option.price, 'USD')}
                        <br />
                        Estimated delivery: {option.days}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Items ({cartStore.products.length}):</span>
                    <span>{formatCurrency(itemsTotal, 'USD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping & handling:</span>
                    <span>{formatCurrency(shippingCost, 'USD')}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span>Total before tax:</span>
                    <span>{formatCurrency(subtotal, 'USD')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated tax (6.65%):</span>
                    <span>{formatCurrency(tax, 'USD')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Order total:</span>
                    <span className="text-red-700">{formatCurrency(orderTotal, 'USD')}</span>
                  </div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded mt-4"
                  disabled={addOrderMutation.isLoading || !selectedAddressId || !selectedPaymentMethodId}
                >
                  Place your order
                </button>
                <p className="text-xs mt-2">
                  By placing your order, you agree to Grove&apos;s{' '}
                  <a href="#" className="text-blue-600 hover:underline">privacy notice</a> and{' '}
                  <a href="#" className="text-blue-600 hover:underline">conditions of use</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      {showAddressForm && (
        <AddressForm onSubmit={handleAddAddress} onCancel={() => setShowAddressForm(false)} />
      )}
      {showPaymentForm && (
        <PaymentMethodForm onSubmit={handleAddPaymentMethod} onCancel={() => setShowPaymentForm(false)} />
      )}
      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        setIsOpen={setIsConfirmModalOpen}
        name="Confirm Order"
        description="Please review and confirm that all cart, shipping, and payment details are correct before placing your order."
        onConfirm={confirmOrder}
        isLoading={addOrderMutation.isLoading}
      />
    </>
  );
};

export default Checkout;

Checkout.getLayout = (page) => <DefaultLayout>{page}</DefaultLayout>;
