'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, StockStatus, ProductCategory } from '../types';
import { X, Plus, Trash2, CheckCircle2, Layers, Tag, DollarSign, Clock, Truck, AlertCircle, FileText } from 'lucide-react';
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
  const [status, setStatus] = useState<string>('published');
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

  // Helper to recursively find any category by ID across nested trees
  const findCategoryById = (id: string, list: ProductCategory[]): ProductCategory | undefined => {
    for (const c of list) {
      if (c.id === id) return c;
      if (c.subcategories && c.subcategories.length > 0) {
        const found = findCategoryById(id, c.subcategories);
        if (found) return found;
      }
    }
    return undefined;
  };

  // Group and list categories from backend DB (Level 3 / leaf subcategories)
  const categoryGroups = useMemo(() => {
    const groups: { parentName: string; items: { id: string; name: string; level?: number }[] }[] = [];

    categories.forEach(cat => {
      // Check if top-level has subcategories (Level 2 & Level 3)
      if (cat.subcategories && cat.subcategories.length > 0) {
        const leafItems: { id: string; name: string; level?: number }[] = [];

        cat.subcategories.forEach(sub => {
          if (sub.subcategories && sub.subcategories.length > 0) {
            // Level 3 subcategories
            sub.subcategories.forEach(l3 => {
              leafItems.push({ id: l3.id, name: `${sub.name} › ${l3.name}`, level: l3.level || 3 });
            });
          } else {
            // Level 2 / Subcategory leaf
            leafItems.push({ id: sub.id, name: sub.name, level: sub.level || 2 });
          }
        });

        if (leafItems.length > 0) {
          groups.push({ parentName: cat.name, items: leafItems });
        } else {
          groups.push({ parentName: cat.name, items: [{ id: cat.id, name: cat.name, level: cat.level || 1 }] });
        }
      } else {
        // Flat or direct vertical
        groups.push({ parentName: 'General Verticals', items: [{ id: cat.id, name: cat.name, level: cat.level || 1 }] });
      }
    });

    return groups;
  }, [categories]);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name);
      setCategoryId(editingProduct.categoryId);
      setPrice(editingProduct.price);
      setMoq(editingProduct.moq);
      setUnit(editingProduct.unit);
      setStatus(editingProduct.status || 'published');
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
      setStatus('published');
      setStockStatus('in_stock');
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
      return [selectedImage, ...current.filter((_, imageIndex) => imageIndex !== index)];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId || !unit || !stockStatus || images.length === 0) {
      setErrorMessage('Complete all required fields and upload a supplier product picture before publishing.');
      return;
    }

    setErrorMessage(null);
    setSubmitting(true);

    const catObj = findCategoryById(categoryId, categories) || categories.find(c => c.id === categoryId);
    if (!catObj) {
      setErrorMessage('Selected category not found in backend database. Please re-select a category.');
      setSubmitting(false);
      return;
    }

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
        status,
        stockStatus: stockStatus as StockStatus,
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
        status,
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
        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
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
          className="bg-slate-50 text-slate-900 rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col"
        >
          {/* Header - Sleek Executive Slate Navy */}
          <div className="bg-[#1E293B] text-white px-6 py-5 border-b border-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">
                  {editingProduct ? 'Edit Catalog Listing' : 'Publish Wholesale Product'}
                </h2>
                <p className="text-xs text-slate-300 mt-0.5">
                  Configure B2B price tiers, MOQ, manual stock levels, and Level 3 category selection
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setProductEditModalOpen(false);
                setEditingProduct(null);
              }}
              className="text-slate-400 hover:text-white hover:bg-slate-700 p-2 rounded-xl transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-slate-50 p-6 overflow-y-auto flex flex-col space-y-6 flex-1 text-xs">
            {/* Validation Error Banner */}
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3 text-slate-900 shadow-xs"
              >
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold text-xs block">Action Required</span>
                  <span className="text-xs text-slate-600 block leading-relaxed">{errorMessage}</span>
                </div>
              </motion.div>
            )}

            {/* SECTION 1: Product Photos & Visual Media */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-teal-600" />
                    Product Photos & Visual Media <span className="text-rose-500">*</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Upload up to 6 photos. The first image will be set as the primary catalog photo.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-full">
                    {images.length}/6 Photos Uploaded
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-end">
                <label className="block rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-5 py-4 cursor-pointer hover:border-teal-600 hover:bg-slate-100 transition-all group">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    <Plus className="w-4 h-4 text-teal-600" /> Choose photos from device
                  </span>
                  <span className="mt-1 block text-[11px] text-slate-500">
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

                <div className="flex items-center gap-2">
                  <input
                    type="url"
                    value={imageUrlInput}
                    onChange={e => setImageUrlInput(e.target.value)}
                    placeholder="Paste image URL..."
                    className="px-3 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-teal-600 w-52 sm:w-64"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (imageUrlInput.trim()) addImages([imageUrlInput.trim()]);
                    }}
                    className="px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl text-xs transition-colors cursor-pointer shrink-0"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Image Previews */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-2">
                  {images.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group bg-slate-100 rounded-xl border border-slate-200 overflow-hidden h-24 flex items-center justify-center"
                    >
                      <img src={img} alt={`Product preview ${idx + 1}`} className="h-full object-contain" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-teal-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs">
                          PRIMARY
                        </span>
                      )}
                      <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => makePrimaryImage(idx)}
                            className="bg-white text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-xs hover:bg-slate-100 cursor-pointer"
                          >
                            Set Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setImages(current => current.filter((_, i) => i !== idx))}
                          className="p-1 bg-rose-600 text-white rounded hover:bg-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* SECTION 2: General Info & Level 3 Category (Loaded from DB) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                <FileText className="w-4 h-4 text-teal-600" />
                Product Identification & Category Hierarchy
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Product Title / Industrial Model <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Three-Phase Industrial Centrifugal Slurry Pump 15kW"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-600 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Category (Loaded from Database) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-teal-600 focus:bg-white transition-all cursor-pointer shadow-xs"
                  >
                    <option value="" className="bg-white text-slate-400 font-normal">
                      ✓ Select Level 3 Category...
                    </option>
                    {categoryGroups.map((group, gIdx) => (
                      <optgroup key={gIdx} label={`── ${group.parentName} ──`} className="bg-slate-100 text-slate-900 font-bold">
                        {group.items.map(item => (
                          <option key={item.id} value={item.id} className="bg-white text-slate-900 font-medium py-1">
                            {item.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>

              {/* Publication Status & Stock Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Marketplace Publication Status
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-teal-600 focus:bg-white cursor-pointer"
                  >
                    <option value="published" className="bg-white text-emerald-700 font-bold">🟢 Published (Live in Marketplace)</option>
                    <option value="draft" className="bg-white text-slate-700 font-bold">📝 Save as Draft (Unpublished)</option>
                    <option value="archived" className="bg-white text-rose-700 font-bold">📦 Archived (Hidden from Catalog)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Stock Level Indicator <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={stockStatus}
                    onChange={e => setStockStatus(e.target.value as StockStatus)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-600 focus:bg-white cursor-pointer"
                  >
                    <option value="in_stock" className="bg-white text-emerald-800">In Stock (Live from DB)</option>
                    <option value="low_stock" className="bg-white text-amber-800">Low Stock (Limited Batch)</option>
                    <option value="out_of_stock" className="bg-white text-slate-600">Out of Stock (Pre-order Only)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* SECTION 3: B2B Wholesale Pricing & Quantity */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                <DollarSign className="w-4 h-4 text-teal-600" />
                Wholesale Pricing, Unit & Inventory Quantity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Unit Price (ETB) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 2500"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Minimum Order Qty (MOQ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={moq}
                    onChange={e => setMoq(e.target.value ? Number(e.target.value) : '')}
                    placeholder="e.g. 5"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-bold focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Unit Measurement <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    placeholder="e.g. sets, pieces, rolls, kg"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Current Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={e => setStockQuantity(e.target.value ? Number(e.target.value) : '')}
                    placeholder="Available quantity..."
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: Freight, Lead Time & Descriptions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-200">
                <Truck className="w-4 h-4 text-teal-600" />
                Dispatch Availability & Description
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Dispatch Lead Time
                  </label>
                  <input
                    type="text"
                    value={leadTime}
                    onChange={e => setLeadTime(e.target.value)}
                    placeholder="e.g. 2-4 business days"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                    Delivery Regions (comma separated)
                  </label>
                  <input
                    type="text"
                    value={deliveryZones}
                    onChange={e => setDeliveryZones(e.target.value)}
                    placeholder="e.g. Addis Ababa, Oromia, Amhara, Sidama"
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-semibold focus:outline-none focus:border-teal-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1 uppercase tracking-wider">
                  Product Overview & Technical Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe material grading, performance capacity, assembly requirements..."
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 text-xs font-medium focus:outline-none focus:border-teal-600 focus:bg-white"
                />
              </div>

              {/* Specs Sheet */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs">Technical Specifications Sheet</span>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer transition-colors"
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
                        className="w-1/3 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-teal-600"
                      />
                      <input
                        type="text"
                        value={s.value}
                        onChange={e => handleSpecChange(idx, 'value', e.target.value)}
                        placeholder="e.g. 380V 50Hz / 120 m3/h"
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-teal-600"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setProductEditModalOpen(false);
                  setEditingProduct(null);
                }}
                className="px-5 py-2.5 border border-slate-300 hover:bg-slate-200 font-semibold text-slate-700 rounded-xl transition-all cursor-pointer text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                id="btn-save-product-listing"
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md flex items-center gap-2 active:scale-95"
              >
                {submitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-white" />
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
