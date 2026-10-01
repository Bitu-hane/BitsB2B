'use client';
import React, { useState, useEffect } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, StockStatus } from '../types';
import { X, Plus, Trash2, CheckCircle2, Layers, Tag, DollarSign, Clock, Truck, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { processProductImage } from '../utils/imageUtils';

export const ProductEditModal: React.FC = () => {
  const {
    productEditModalOpen,
    setProductEditModalOpen,
    editingProduct,
    setEditingProduct,
    addProduct,
    openSubscriptionPlans,
    updateProduct,
    currentUser,
    categories,
  } = useMarketplace();

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [moq, setMoq] = useState<number | ''>('');
  const [unit, setUnit] = useState('');
  const [stockStatus, setStockStatus] = useState<StockStatus | ''>('');
  const [stockQuantity, setStockQuantity] = useState<number | ''>('');
  const [leadTime, setLeadTime] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [description, setDescription] = useState('');
  const [deliveryZones, setDeliveryZones] = useState('');
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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
      setImages(editingProduct.images || []);
      setImageUrlInput('');
      setDescription(editingProduct.description);
      setDeliveryZones(editingProduct.deliveryZones.join(', '));
      setSpecs(
        Object.entries(editingProduct.specifications || {}).map(([key, value]) => ({ key, value }))
      );
    } else {
      setName('');
      setCategoryId('');
      setPrice('');
      setMoq('');
      setUnit('');
      setStockStatus('');
      setStockQuantity('');
      setLeadTime('');
      setImages([]);
      setImageUrlInput('');
      setDescription('');
      setDeliveryZones('');
      setSpecs([]);
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

  const addImages = async (sources: (File | string)[]) => {
    const availableSlots = Math.max(0, 6 - images.length);
    if (!availableSlots) {
      setErrorMessage('You can add up to six product photos. Remove one before adding another.');
      return;
    }

    setIsProcessingImages(true);
    try {
      const processed = await Promise.all(
        sources.slice(0, availableSlots).map(source => processProductImage(source, { targetSize: 800, addBrandTag: true })),
      );
      setImages(current => [...current, ...processed.filter(Boolean)]);
      setImageUrlInput('');
    } catch {
      setErrorMessage('We could not process one or more images. Please try another image file.');
    } finally {
      setIsProcessingImages(false);
    }
  };

  const makePrimaryImage = (index: number) => {
    setImages(current => {
      const selectedImage = current[index];
      if (!selectedImage || index === 0) return current;
      // The primary product image is always index 0. Moving the selected image
      // there automatically makes the former primary image a secondary image.
      return [selectedImage, ...current.filter((_, imageIndex) => imageIndex !== index)];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !unit || !stockStatus || images.length === 0) {
      setErrorMessage('Complete the required fields and upload a supplier product picture before publishing.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    const catObj = categories.find(c => c.id === categoryId);
    if (!catObj) return;
    const numericPrice = Number(price);
    const numericMoq = Number(moq);
    const numericStockQuantity = Number(stockQuantity) || 0;
    const parsedSpecs: Record<string, string> = {};
    specs.forEach(s => {
      if (s.key.trim() && s.value.trim()) {
        parsedSpecs[s.key.trim()] = s.value.trim();
      }
    });

    const parsedZones = deliveryZones.split(',').map(z => z.trim()).filter(Boolean);

    const priceTiers = [
      { minQty: numericMoq, maxQty: numericMoq * 4, pricePerUnit: numericPrice },
      { minQty: numericMoq * 4 + 1, pricePerUnit: Math.round(numericPrice * 0.9) },
    ];

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name,
        categoryId: catObj.id,
        categoryName: catObj.name,
        price: numericPrice,
        moq: numericMoq,
        unit,
        stockStatus,
        stockQuantity: numericStockQuantity,
        leadTime,
        images,
        description,
        deliveryZones: parsedZones.length > 0 ? parsedZones : editingProduct.deliveryZones,
        specifications: parsedSpecs,
        priceTiers,
      });
      setProductEditModalOpen(false);
      setEditingProduct(null);
    } else {
      const res = await addProduct({
        name,
        categoryId: catObj.id,
        categoryName: catObj.name,
        sellerId: currentUser?.business.id || 'biz-ethio-mach',
        sellerBusinessName: currentUser?.business.name || 'Ethio-Machinery & Engineering PLC',
        sellerVerified: currentUser?.business.verificationStatus === 'verified',
        sellerRegion: currentUser?.business.region || 'Addis Ababa',
        price: numericPrice,
        currency: 'ETB',
        priceTiers,
        moq: numericMoq,
        unit,
        stockStatus: stockStatus as StockStatus,
        stockQuantity: numericStockQuantity,
        stockLastUpdated: 'Just now',
        leadTime,
        deliveryZones: parsedZones,
        images,
        description,
        specifications: parsedSpecs,
        featured: false,
      });

      if (!res.success) {
        if (res.limitReached) {
          setProductEditModalOpen(false);
          setEditingProduct(null);
          openSubscriptionPlans({ currentCount: res.currentCount, listingLimit: res.listingLimit, message: res.message });
          return;
        }
        setErrorMessage(res.message || 'Product listing limit reached. Upgrade subscription to publish more products.');
        setSubmitting(false);
        return;
      }

      setProductEditModalOpen(false);
      setEditingProduct(null);
    }
    setSubmitting(false);
  };

  return (
    <AnimatePresence>
      <div
        id="product-edit-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#1B2340]/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
        onClick={() => {
          setProductEditModalOpen(false);
          setEditingProduct(null);
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FBF9F5] text-[#1B2340] rounded-2xl max-w-4xl w-full shadow-2xl border border-[#E2D9C8] overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#1B2340] text-[#FBF9F5] px-6 py-5 border-b border-[#2E3A63] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C08829] flex items-center justify-center text-[#1B2340] font-bold shadow-sm">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#FBF9F5] tracking-wide">
                  {editingProduct ? 'Edit Catalog Listing' : 'Publish Wholesale Product'}
                </h2>
                <p className="text-xs text-[#94A3B8] mt-0.5">
                  Configure B2B price tiers, MOQ, manual stock levels, and freight zones
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setProductEditModalOpen(false);
                setEditingProduct(null);
              }}
              className="text-[#94A3B8] hover:text-white hover:bg-white/10 p-2 rounded-xl transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-[#FBF9F5] p-6 overflow-y-auto flex flex-col space-y-6 flex-1 text-xs">
            {/* Subscription Limit / Validation Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-500/10 border border-[#C08829]/40 rounded-2xl p-4 flex items-start gap-3.5 text-[#1B2340]"
              >
                <ShieldAlert className="w-5 h-5 text-[#C08829] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-[#1B2340] block">Action Required</span>
                  <span className="text-xs text-[#524B40] block leading-relaxed">{errorMessage}</span>
                </div>
              </motion.div>
            )}

            {/* SECTION 1: Product Photos & Visual Identity */}
            <div className="bg-white rounded-2xl border border-[#E2D9C8] p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F0EBE1]">
                <div>
                  <h3 className="font-serif text-sm font-bold text-[#1B2340] flex items-center gap-2">
                    <Tag className="w-4 h-4 text-[#C08829]" />
                    Product Photos & Visual Media <span className="text-[#C08829]">*</span>
                  </h3>
                  <p className="text-[11px] text-[#78716C] mt-0.5">
                    Upload up to 6 photos. The first image will be set as the primary catalog photo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#1B2340] bg-[#C08829]/15 border border-[#C08829]/30 px-2.5 py-1 rounded-full">
                    {images.length}/6 Photos Uploaded
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <label className="block rounded-xl border-2 border-dashed border-[#D6CBB8] bg-[#FDFBF7] px-5 py-4 cursor-pointer hover:border-[#C08829] hover:bg-[#FAF7F2] transition-all group">
                  <span className="flex items-center gap-2 text-xs font-bold text-[#1B2340] group-hover:text-[#C08829] transition-colors">
                    <Plus className="w-4 h-4 text-[#C08829]" /> Choose photos from device
                  </span>
                  <span className="mt-1 block text-[11px] text-[#78716C]">
                    High quality JPG, PNG, or WEBP · 1:1 Aspect ratio canvas
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="sr-only"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      if (files.length) addImages(files);
                      e.currentTarget.value = '';
                    }}
                  />
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    placeholder="Paste image URL..."
                    className="min-w-0 flex-1 px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-xs text-[#1B2340] focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  />
                  <button
                    type="button"
                    disabled={!imageUrlInput || isProcessingImages}
                    onClick={() => addImages([imageUrlInput])}
                    className="px-4 py-2.5 bg-[#1B2340] disabled:opacity-40 text-white font-semibold text-xs rounded-xl hover:bg-[#2A3558] transition-all cursor-pointer shadow-sm"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {isProcessingImages && (
                <p className="text-[11px] font-medium text-[#C08829] animate-pulse">
                  Processing image canvas and optimization...
                </p>
              )}

              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-2">
                  {images.map((image, index) => (
                    <div
                      key={`${image.slice(0, 24)}-${index}`}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-[#E2D9C8] bg-[#FAF8F5] shadow-xs"
                    >
                      <img
                        src={image}
                        alt={`Product photo ${index + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                      {index === 0 ? (
                        <span className="absolute left-1.5 top-1.5 rounded-md bg-[#1B2340] px-2 py-0.5 text-[9px] font-bold text-[#FBF9F5] shadow-sm">
                          Primary
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => makePrimaryImage(index)}
                          className="absolute inset-x-1.5 bottom-1.5 opacity-0 group-hover:opacity-100 focus:opacity-100 rounded-lg bg-[#1B2340]/95 px-2 py-1 text-[9px] font-bold text-white transition-opacity shadow-sm"
                        >
                          Make primary
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setImages(current => current.filter((_, imageIndex) => imageIndex !== index))}
                        className="absolute right-1.5 top-1.5 rounded-md bg-white/95 p-1 text-[#64748B] hover:text-rose-600 shadow-sm transition-colors"
                        aria-label={`Remove photo ${index + 1}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: Basic Product Information */}
            <div className="bg-white rounded-2xl border border-[#E2D9C8] p-5 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#1B2340] pb-2 border-b border-[#F0EBE1] flex items-center gap-2">
                <Tag className="w-4 h-4 text-[#C08829]" />
                Product Identification & Category
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Product Name / Industrial Model <span className="text-[#C08829]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Three-Phase Industrial Water Pump 15kW"
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Category (Loaded from Database) <span className="text-[#C08829]">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  >
                    <option value="" disabled>Select a category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price, MOQ, Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Unit Price (ETB) <span className="text-[#C08829]">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={price}
                      onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder="e.g. 45000"
                      className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Minimum Order Qty (MOQ) <span className="text-[#C08829]">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={moq}
                    onChange={e => setMoq(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="e.g. 5"
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Unit Measure <span className="text-[#C08829]">*</span>
                  </label>
                  <select
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  >
                    <option value="" disabled>Select unit</option>
                    <option value="pieces">Pieces (pcs)</option>
                    <option value="sets">Sets / Units</option>
                    <option value="rolls">Rolls</option>
                    <option value="cartons">Cartons / Boxes</option>
                    <option value="metric tons">Metric Tons (MT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: Inventory & Dispatch Lead Time */}
            <div className="bg-white rounded-2xl border border-[#E2D9C8] p-5 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#1B2340] pb-2 border-b border-[#F0EBE1] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C08829]" />
                Inventory &amp; Dispatch Availability
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Stock Status <span className="text-[#C08829]">*</span>
                  </label>
                  <select
                    required
                    value={stockStatus}
                    onChange={e => setStockStatus(e.target.value as StockStatus | '')}
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  >
                    <option value="" disabled>Select status</option>
                    <option value="in_stock">In Stock</option>
                    <option value="low_stock">Low Stock</option>
                    <option value="out_of_stock">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="Available quantity..."
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#1B2340] mb-1.5">
                    Dispatch Lead Time
                  </label>
                  <input
                    type="text"
                    value={leadTime}
                    onChange={e => setLeadTime(e.target.value)}
                    placeholder="e.g. 2-4 business days"
                    className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Freight, Specifications & Description */}
            <div className="bg-white rounded-2xl border border-[#E2D9C8] p-5 shadow-sm space-y-4">
              <h3 className="font-serif text-sm font-bold text-[#1B2340] pb-2 border-b border-[#F0EBE1] flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C08829]" />
                Freight, Logistics &amp; Specifications
              </h3>

              <div>
                <label className="block font-semibold text-[#1B2340] mb-1.5">
                  Eligible Freight &amp; Delivery Zones (Comma Separated)
                </label>
                <input
                  type="text"
                  value={deliveryZones}
                  onChange={e => setDeliveryZones(e.target.value)}
                  placeholder="e.g. Addis Ababa Metro, Oromia, Hawassa IP, Dire Dawa"
                  className="w-full px-3.5 py-2.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#1B2340] mb-1.5">
                  Detailed Product Description &amp; Industrial Application
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe material grading, performance capacity, assembly requirements..."
                  className="w-full p-3.5 bg-[#FDFBF7] border border-[#E2D9C8] rounded-xl text-[#1B2340] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1B2340]/20 focus:border-[#1B2340]"
                />
              </div>

              {/* Dynamic Specifications Rows */}
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E2D9C8] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1B2340] text-xs">Technical Specifications Sheet</span>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-xs font-bold text-[#C08829] hover:text-[#1B2340] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Spec Line
                  </button>
                </div>

                <div className="space-y-2">
                  {specs.map((s, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={s.key}
                        onChange={e => handleSpecChange(idx, 'key', e.target.value)}
                        placeholder="e.g. Voltage / Flow Rate"
                        className="w-1/3 px-3 py-2 bg-white border border-[#E2D9C8] rounded-lg text-[#1B2340] text-xs focus:outline-none focus:border-[#1B2340]"
                      />
                      <input
                        type="text"
                        value={s.value}
                        onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                        placeholder="e.g. 380V 50Hz / 120 m3/h"
                        className="flex-1 px-3 py-2 bg-white border border-[#E2D9C8] rounded-lg text-[#1B2340] text-xs focus:outline-none focus:border-[#1B2340]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="text-[#94A3B8] hover:text-rose-600 p-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-[#E2D9C8] flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setProductEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="px-5 py-2.5 border border-[#1B2340]/20 hover:bg-[#1B2340]/5 font-semibold text-[#1B2340] rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                id="btn-save-product-listing"
                className="px-6 py-2.5 bg-[#1B2340] hover:bg-[#2A3558] text-[#FBF9F5] font-semibold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-[#C08829]" />
                    {editingProduct ? 'Save Listing Changes' : 'Publish Product to Marketplace'}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
