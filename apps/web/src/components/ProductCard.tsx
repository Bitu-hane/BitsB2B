'use client';
import React from 'react';
import { Product } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { ShieldCheck, MessageSquare, ShoppingCart, MapPin, Clock, Lock, AlertCircle } from 'lucide-react';
import { CanvasProductImage } from './CanvasProductImage';

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const {
    currentUser,
    setSelectedProduct,
    setSelectedSeller,
    setInquiryTargetProduct,
    setInquiryModalOpen,
    setOrderTargetProduct,
    setOrderModalOpen,
    setAuthModalOpen,
    allUsers,
  } = useMarketplace();

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(product);
    } else {
      setSelectedProduct(product);
    }
  };

  const handleInquire = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setInquiryTargetProduct(product);
    setInquiryModalOpen(true);
  };

  const handleOrder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setOrderTargetProduct(product);
    setOrderModalOpen(true);
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group bg-white border border-[#E2E4EA] rounded-[11px] overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col cursor-pointer relative"
    >
      {/* Top Image / Media Area with Auto-Canvas Processing */}
      <div className="relative h-[150px] bg-[#F1F2F5] flex items-center justify-center border-b border-dashed border-[#E2E4EA] overflow-hidden">
        <CanvasProductImage
          src={product.images && product.images[0]}
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
          containerClassName="w-full h-full flex items-center justify-center bg-[#FAF7F2] relative overflow-hidden"
        />

        {/* Verified Badge */}
        {product.sellerVerified && (
          <div className="absolute top-2.5 left-2.5 bg-[#33553A] text-white text-[10.5px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3 h-3 text-emerald-300" />
            <span>Verified</span>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-[14.5px] font-semibold text-[#1E2128] leading-tight mb-1.5 group-hover:text-[#C08829] transition-colors line-clamp-2">
            {product.name}
          </h4>

          <div className="text-xs text-[#6B7078] mb-3">
            {product.sellerBusinessName}, MOQ {product.moq} {product.unit}
          </div>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-3">
            {currentUser ? (
              <>
                <b className="font-mono text-lg font-bold text-[#9C6B1A]">
                  {product.price.toLocaleString()}
                </b>
                <span className="text-xs text-[#6B7078]">
                  {product.currency} / {product.unit}
                </span>
              </>
            ) : (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#F2DFAE] text-[#9C6B1A] text-xs font-semibold hover:bg-[#C08829] hover:text-white transition-colors"
              >
                <Lock className="w-3 h-3" />
                <span>Register to view price</span>
              </button>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button
              id={`btn-inquire-${product.id}`}
              onClick={handleInquire}
              className="flex-1 bg-none border border-[#1B2340] text-[#1B2340] py-2 text-xs font-semibold rounded-[7px] hover:bg-[#1B2340] hover:text-white transition-colors cursor-pointer text-center"
            >
              Inquire / RFQ
            </button>

            <button
              id={`btn-order-${product.id}`}
              onClick={handleOrder}
              disabled={product.stockStatus === 'out_of_stock'}
              className={`flex-1 bg-[#C08829] border border-[#C08829] text-[#1B2340] py-2 text-xs font-bold rounded-[7px] hover:bg-[#9C6B1A] hover:text-white transition-colors cursor-pointer text-center ${
                product.stockStatus === 'out_of_stock' ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Add to cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
