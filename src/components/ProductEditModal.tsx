import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, StockStatus } from '../types';
import { X, Plus, Trash2, CheckCircle2, Layers, Tag, DollarSign, Clock, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ProductEditModal: React.FC = () => {
  const {
    productEditModalOpen,
    setProductEditModalOpen,
    editingProduct,
    setEditingProduct,
    addProduct,
    updateProduct,
    currentUser,
    categories,
  } = useMarketplace();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-industrial');
  const [price, setPrice] = useState<number>(1000);
  const [moq, setMoq] = useState<number>(10);
  const [unit, setUnit] = useState('pieces');
  const [stockStatus, setStockStatus] = useState<StockStatus>('in_stock');
  const [stockQuantity, setStockQuantity] = useState<number>(500);
  const [leadTime, setLeadTime] = useState('3-5 business days');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [deliveryZones, setDeliveryZones] = useState('Addis Ababa Metro, Oromia, Hawassa IP, Dire Dawa');
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Material', value: 'Commercial Grade' },
    { key: 'Warranty', value: '12 Months' },
  ]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategoryId(editingProduct.categoryId);
      setPrice(editingProduct.price);
      setMoq(editingProduct.moq);
      setUnit(editingProduct.unit);
      setStockStatus(editingProduct.stockStatus);
      setStockQuantity(editingProduct.stockQuantity);
      setLeadTime(editingProduct.leadTime);
      setImageUrl(editingProduct.images[0] || '');
      setDescription(editingProduct.description);
      setDeliveryZones(editingProduct.deliveryZones.join(', '));
      setSpecs(
        Object.entries(editingProduct.specifications || {}).map(([key, value]) => ({ key, value }))
      );
    } else {
      setName('');
      setCategoryId(categories[0]?.id || 'cat-industrial');
      setPrice(2500);
      setMoq(5);
      setUnit('pieces');
      setStockStatus('in_stock');
      setStockQuantity(250);
      setLeadTime('2-4 business days');
      setImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80');
      setDescription('');
      setDeliveryZones('Addis Ababa Metro, Oromia, Hawassa, Nationwide Freight');
      setSpecs([
        { key: 'Material', value: 'Industrial Grade' },
        { key: 'Standard', value: 'ISO-9001 / Ethiopian Standard' },
      ]);
    }
  }, [editingProduct, categories]);

  if (!productEditModalOpen) return null;

  const handleAddSpecRow = () => {
    setSpecs(prev => [...prev, { key: '', value: '' }]);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs(prev => prev.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    setSpecs(prev =>
      prev.map((item, i) => (i === index ? { ...item, [field]: val } : item))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const catObj = categories.find(c => c.id === categoryId) || categories[0];
    const parsedSpecs: Record<string, string> = {};
    specs.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        parsedSpecs[s.key.trim()] = s.value.trim();
      }
    });

    const parsedZones = deliveryZones.split(',').map(z => z.trim()).filter(Boolean);

    const priceTiers = [
      { minQty: moq, maxQty: moq * 4, pricePerUnit: price },
      { minQty: moq * 4 + 1, pricePerUnit: Math.round(price * 0.9) },
    ];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        categoryId: catObj.id,
        categoryName: catObj.name,
        price,
        moq,
        unit,
        stockStatus,
        stockQuantity,
        leadTime,
        images: [imageUrl || editingProduct.images[0]],
        description,
        deliveryZones: parsedZones.length > 0 ? parsedZones : editingProduct.deliveryZones,
        specifications: parsedSpecs,
        priceTiers,
      });
    } else {
      addProduct({
        name,
        categoryId: catObj.id,
        categoryName: catObj.name,
        sellerId: currentUser?.business.id || 'biz-ethio-mach',
        sellerBusinessName: currentUser?.business.name || 'Ethio-Machinery & Engineering PLC',
        sellerVerified: currentUser?.business.verificationStatus === 'verified',
        sellerRegion: currentUser?.business.region || 'Addis Ababa',
        price,
        currency: 'ETB',
        priceTiers,
        moq,
        unit,
        stockStatus,
        stockQuantity,
        stockLastUpdated: 'Just now',
        leadTime,
        deliveryZones: parsedZones.length > 0 ? parsedZones : ['Addis Ababa', 'Nationwide'],
        images: [imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'],
        description,
        specifications: parsedSpecs,
        featured: false,
      });
    }

    setProductEditModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <AnimatePresence>
      <div
        id="product-edit-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => {
          setProductEditModalOpen(false);
          setEditingProduct(null);
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
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F7F4EE]">
                  {editingProduct ? 'Edit Catalog Listing' : 'Publish New Wholesale Product'}
                </h2>
                <p className="text-xs text-[#A8A196]">
                  Configure B2B price tiers, MOQ, manual stock levels, and freight zones
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setProductEditModalOpen(false);
                setEditingProduct(null);
              }}
              className="text-[#888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {/* Title & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#112225] mb-1">
                  Product Name / Industrial Model *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Three-Phase Industrial Water Pump 15kW"
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price, Unit, MOQ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Unit Price (ETB) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={price}
                  onChange={e => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Minimum Order Qty (MOQ) *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={moq}
                  onChange={e => setMoq(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Unit Measure *
                </label>
                <select
                  value={unit}
                  onChange={e => setUnit(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="pieces">Pieces (pcs)</option>
                  <option value="sets">Sets / Units</option>
                  <option value="rolls">Rolls</option>
                  <option value="cartons">Cartons / Boxes</option>
                  <option value="metric tons">Metric Tons (MT)</option>
                </select>
              </div>
            </div>

            {/* Stock Management & Lead Time (UC15 Manual Stock) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#E5DFD5]">
              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Stock Status *
                </label>
                <select
                  value={stockStatus}
                  onChange={e => setStockStatus(e.target.value as StockStatus)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                >
                  <option value="in_stock">In Stock</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Current Available Stock Qty
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={e => setStockQuantity(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Dispatch Lead Time
                </label>
                <input
                  type="text"
                  value={leadTime}
                  onChange={e => setLeadTime(e.target.value)}
                  placeholder="e.g. 2-4 business days"
                  className="w-full px-3 py-2 bg-white border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            {/* Image URL & Delivery Zones */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Primary Image URL
                </label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#112225] mb-1">
                  Eligible Freight Zones (Comma Separated)
                </label>
                <input
                  type="text"
                  value={deliveryZones}
                  onChange={e => setDeliveryZones(e.target.value)}
                  placeholder="Addis Ababa, Oromia, Hawassa IP, Dire Dawa"
                  className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-semibold text-[#112225] mb-1">
                Detailed Product Description &amp; Industrial Application
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe material grading, performance capacity, assembly requirements..."
                className="w-full p-3 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-[#112225] focus:outline-none focus:border-[#C85A32]"
              />
            </div>

            {/* Dynamic Specifications Rows */}
            <div className="p-3 bg-[#FBF9F5] rounded-xl border border-[#E5DFD5] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#112225]">Technical Specifications Sheet</span>
                <button
                  type="button"
                  onClick={handleAddSpecRow}
                  className="text-[11px] font-semibold text-[#C85A32] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" /> Add Spec
                </button>
              </div>

              <div className="space-y-2">
                {specs.map((s, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={s.key}
                      onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                      placeholder="e.g. Voltage / Flow / Material"
                      className="w-1/3 px-3 py-1.5 bg-white border border-[#D8CFBF] rounded-lg text-[#112225]"
                    />
                    <input
                      type="text"
                      value={s.value}
                      onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                      placeholder="e.g. 380V 50Hz / 120 m3/h"
                      className="flex-1 px-3 py-1.5 bg-white border border-[#D8CFBF] rounded-lg text-[#112225]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecRow(idx)}
                      className="text-[#888] hover:text-[#C85A32] p-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t border-[#EFEAE0]">
              <button
                type="button"
                onClick={() => {
                  setProductEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="px-4 py-2 border border-[#D8CFBF] hover:bg-[#F3EFE6] font-semibold text-[#162C30] rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-save-product-listing"
                className="px-5 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
              >
                {editingProduct ? 'Save Listing Changes' : 'Publish Product to Marketplace'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
