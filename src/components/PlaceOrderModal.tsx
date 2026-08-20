import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  ShoppingCart,
  ShieldCheck,
  MapPin,
  Building2,
  Phone,
  CheckCircle2,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { PaymentMethod, DeliveryAddress } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export const PlaceOrderModal: React.FC = () => {
  const {
    orderModalOpen,
    setOrderModalOpen,
    orderTargetProduct,
    prefilledOrderData,
    setPrefilledOrderData,
    currentUser,
    createOrder,
    setPendingPaymentOrder,
    setPaymentModalOpen,
  } = useMarketplace();

  const [quantity, setQuantity] = useState<number>(1);
  const [region, setRegion] = useState('Addis Ababa');
  const [city, setCity] = useState('Addis Ababa');
  const [subcity, setSubcity] = useState('Bole Subcity');
  const [kebele, setKebele] = useState('Woreda 04');
  const [landmark, setLandmark] = useState('Central Warehouse Gate 2, Cargo Terminal');
  const [contactPerson, setContactPerson] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('telebirr');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderTargetProduct) {
      // If reordering past order, prefill with past order data (UC14)
      if (prefilledOrderData) {
        setQuantity(prefilledOrderData.items[0]?.quantity || orderTargetProduct.moq);
        setRegion(prefilledOrderData.deliveryAddress.region);
        setCity(prefilledOrderData.deliveryAddress.city);
        setSubcity(prefilledOrderData.deliveryAddress.subcity);
        setKebele(prefilledOrderData.deliveryAddress.kebele);
        setLandmark(prefilledOrderData.deliveryAddress.landmark);
        setContactPerson(prefilledOrderData.deliveryAddress.contactPerson);
        setContactPhone(prefilledOrderData.deliveryAddress.contactPhone);
        setPaymentMethod(prefilledOrderData.paymentMethod);
      } else {
        setQuantity(orderTargetProduct.moq);
        if (currentUser) {
          setContactPerson(currentUser.name);
          setContactPhone(currentUser.phone);
          setRegion(currentUser.business.region || 'Addis Ababa');
          setCity(currentUser.business.city || 'Addis Ababa');
          setSubcity(currentUser.business.subcity || 'Bole Subcity');
        }
      }
    }
  }, [orderTargetProduct, prefilledOrderData, currentUser]);

  if (!orderModalOpen || !orderTargetProduct) return null;

  // Calculate unit price dynamically based on MOQ tiers
  let activeUnitPrice = orderTargetProduct.price;
  if (orderTargetProduct.priceTiers && orderTargetProduct.priceTiers.length > 0) {
    const sorted = [...orderTargetProduct.priceTiers].sort((a, b) => b.minQty - a.minQty);
    for (const tier of sorted) {
      if (quantity >= tier.minQty) {
        activeUnitPrice = tier.pricePerUnit;
        break;
      }
    }
  }

  const subtotal = activeUnitPrice * quantity;
  const escrowFee = Math.round(subtotal * 0.005); // 0.5% trade escrow protection fee

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity < orderTargetProduct.moq) {
      setError(`Minimum order quantity for this item is ${orderTargetProduct.moq} ${orderTargetProduct.unit}`);
      return;
    }

    const deliveryAddress: DeliveryAddress = {
      region,
      city,
      subcity,
      kebele,
      landmark,
      contactPerson: contactPerson || currentUser?.name || 'Authorized Logistics Officer',
      contactPhone: contactPhone || currentUser?.phone || '+251 91 123 4567',
    };

    const newOrder = createOrder(
      orderTargetProduct,
      quantity,
      deliveryAddress,
      paymentMethod,
      notes
    );

    setOrderModalOpen(false);
    setPrefilledOrderData(null);

    // Open Payment Escrow modal (UC11)
    setPendingPaymentOrder(newOrder);
    setPaymentModalOpen(true);
  };

  const ETH_REGIONS = [
    'Addis Ababa Metro',
    'Oromia Regional State',
    'Amhara Regional State',
    'Sidama Region (Hawassa)',
    'Dire Dawa City Admin',
    'Tigray Region',
    'Somali Region',
    'South Ethiopia Regional State',
    'Afar Region',
  ];

  return (
    <AnimatePresence>
      <div
        id="place-order-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => {
          setOrderModalOpen(false);
          setPrefilledOrderData(null);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FFFFFF] text-[#162C30] rounded-2xl max-w-3xl w-full shadow-2xl border border-[#E5DFD5] overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#112225] text-[#F7F4EE] p-5 border-b border-[#274B52] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-bold text-xs">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F7F4EE]">
                  {prefilledOrderData ? 'One-Tap Repeat Reorder' : 'Place Wholesale Order'}
                </h2>
                <p className="text-xs text-[#A8A196]">
                  Trade Escrow Secured &bull; Telebirr &amp; CBE Birr Integrated
                </p>
              </div>
            </div>
            <button
              id="btn-close-order-modal"
              onClick={() => {
                setOrderModalOpen(false);
                setPrefilledOrderData(null);
              }}
              className="text-[#888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleConfirmOrder} className="p-6 overflow-y-auto space-y-6 flex-1">
            {/* Product Summary Row */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] flex items-center gap-4">
              <img
                src={orderTargetProduct.images[0]}
                alt={orderTargetProduct.name}
                className="w-16 h-16 rounded-lg object-cover border border-[#D8CFBF] bg-white shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#112225] truncate">
                  {orderTargetProduct.name}
                </div>
                <div className="text-[11px] text-[#6E685F] mt-0.5 flex items-center gap-2">
                  <span>Seller: <strong className="text-[#112225]">{orderTargetProduct.sellerBusinessName}</strong></span>
                  {orderTargetProduct.sellerVerified && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-[#92400E] font-bold">
                      <ShieldCheck className="w-3 h-3 text-[#D97706]" /> Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-[#C85A32] font-semibold mt-1">
                  Unit Price: {activeUnitPrice.toLocaleString()} {orderTargetProduct.currency} / {orderTargetProduct.unit}
                </div>
              </div>
            </div>

            {/* Quantity Selector with MOQ validation */}
            <div className="p-4 bg-white rounded-xl border border-[#E5DFD5]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#112225]">
                    Order Quantity ({orderTargetProduct.unit}) *
                  </label>
                  <span className="text-[11px] text-[#6E685F]">
                    Minimum Required MOQ: <strong>{orderTargetProduct.moq.toLocaleString()} {orderTargetProduct.unit}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(orderTargetProduct.moq, quantity - 1))}
                    className="w-8 h-8 rounded-lg bg-[#F3EFE6] hover:bg-[#EBE5DA] border border-[#D8CFBF] font-bold text-sm flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <input
                    id="input-order-quantity"
                    type="number"
                    min={orderTargetProduct.moq}
                    required
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                    className="w-24 px-3 py-1.5 text-center font-bold text-sm bg-[#F7F4EE] border border-[#D8CFBF] rounded-lg text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 rounded-lg bg-[#F3EFE6] hover:bg-[#EBE5DA] border border-[#D8CFBF] font-bold text-sm flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {error && <p className="text-xs text-[#C85A32] mt-2 font-medium">{error}</p>}
            </div>

            {/* Delivery Address Form (Ethiopian standard hierarchy) */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#112225] uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C85A32]" />
                <span>Regional Warehouse Delivery Location (Ethiopia)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                    Region / Administrative State *
                  </label>
                  <select
                    value={region}
                    onChange={e => setRegion(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  >
                    {ETH_REGIONS.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                    City / Hub *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Addis Ababa, Bishoftu, Adama, Hawassa"
                    className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                    Subcity / Zone *
                  </label>
                  <input
                    type="text"
                    required
                    value={subcity}
                    onChange={e => setSubcity(e.target.value)}
                    placeholder="e.g. Bole, Akaki-Kality, Kirkos, Yeka"
                    className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                    Woreda / Kebele
                  </label>
                  <input
                    type="text"
                    value={kebele}
                    onChange={e => setKebele(e.target.value)}
                    placeholder="e.g. Woreda 04, Kebele 02"
                    className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                  Specific Landmark / Warehouse Facility &amp; Gate *
                </label>
                <input
                  type="text"
                  required
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Cargo Terminal, Warehouse #04, Gate 2"
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                    Receiving Logistics Contact Person
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPerson}
                    onChange={e => setContactPerson(e.target.value)}
                    placeholder="e.g. Abebe Tadesse (Operations)"
                    className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                    Contact Phone Number (For Dispatch SMS)
                  </label>
                  <input
                    type="text"
                    required
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="+251 91 234 5678"
                    className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector (Telebirr & CBE Birr) */}
            <div>
              <label className="block text-xs font-bold text-[#112225] mb-2 uppercase tracking-wider">
                Select B2B Escrow Payment Gateway
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'telebirr'
                      ? 'bg-[#F7F4EE] border-[#C85A32] ring-1 ring-[#C85A32]'
                      : 'bg-white border-[#E5DFD5] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'telebirr'}
                      onChange={() => setPaymentMethod('telebirr')}
                      className="accent-[#C85A32]"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#112225]">Telebirr B2B Escrow</div>
                      <div className="text-[11px] text-[#6E685F]">Ethio Telecom SuperApp &amp; USSD</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#C85A32] bg-[#C85A32]/10 px-2 py-0.5 rounded">
                    Instant Escrow
                  </span>
                </label>

                <label
                  className={`p-3.5 rounded-xl border cursor-pointer flex items-center justify-between transition-colors ${
                    paymentMethod === 'cbe_birr'
                      ? 'bg-[#F7F4EE] border-[#C85A32] ring-1 ring-[#C85A32]'
                      : 'bg-white border-[#E5DFD5] hover:bg-[#FAF7F2]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === 'cbe_birr'}
                      onChange={() => setPaymentMethod('cbe_birr')}
                      className="accent-[#C85A32]"
                    />
                    <div>
                      <div className="font-bold text-xs text-[#112225]">CBE Birr Corporate Escrow</div>
                      <div className="text-[11px] text-[#6E685F]">Commercial Bank of Ethiopia</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] px-2 py-0.5 rounded">
                    Direct Bank Escrow
                  </span>
                </label>
              </div>
            </div>

            {/* Special Instructions / Notes */}
            <div>
              <label className="block text-[11px] font-semibold text-[#112225] mb-1">
                Dispatch / Palletization Instructions (Optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Pallet wrap securely, include certified testing certificate..."
                className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            {/* Cost Summary Box */}
            <div className="p-4 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5] space-y-2 text-xs">
              <div className="flex justify-between text-[#6E685F]">
                <span>
                  Items Total ({quantity.toLocaleString()} {orderTargetProduct.unit} &times; {activeUnitPrice.toLocaleString()} {orderTargetProduct.currency}):
                </span>
                <span className="font-medium text-[#112225]">{subtotal.toLocaleString()} ETB</span>
              </div>
              <div className="flex justify-between text-[#6E685F]">
                <span>Escrow Trust Protection &amp; Quality Guarantee (0.5%):</span>
                <span className="font-medium text-[#112225]">{escrowFee.toLocaleString()} ETB</span>
              </div>
              <div className="h-px bg-[#E5DFD5] my-1" />
              <div className="flex justify-between text-sm font-bold text-[#112225]">
                <span>Total Order Amount (Protected in Escrow):</span>
                <span className="text-[#C85A32]">{subtotal.toLocaleString()} ETB</span>
              </div>
            </div>

            {/* Escrow note */}
            <div className="p-3 bg-[#FEF3C7] border border-[#FCD34D] rounded-xl text-xs text-[#92400E] flex items-start gap-2">
              <Info className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <strong>Payment Protection Notice:</strong> Your funds will not be directly paid to the seller right away.
                Instead, funds remain held in <strong>{paymentMethod === 'telebirr' ? 'Telebirr' : 'CBE Birr'} Escrow</strong> until
                goods are dispatched, delivered to your warehouse, and you tap <strong>"Confirm Receipt"</strong>.
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setOrderModalOpen(false);
                  setPrefilledOrderData(null);
                }}
                className="px-4 py-2.5 border border-[#D8CFBF] hover:bg-[#F3EFE6] text-xs font-semibold text-[#162C30] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                id="btn-confirm-place-order"
                className="px-6 py-2.5 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <span>Confirm Order &amp; Proceed to Escrow Payment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
