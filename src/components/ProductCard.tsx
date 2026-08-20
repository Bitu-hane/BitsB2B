import React from 'react';
import { Product } from '../types';
import { useMarketplace } from '../context/MarketplaceContext';
import { ShieldCheck, MessageSquare, ShoppingCart, MapPin, Clock, Lock, AlertCircle } from 'lucide-react';

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

  const handleSellerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const sellerUser = allUsers.find(u => u.business.id === product.sellerId || u.isSeller);
    if (sellerUser) {
      setSelectedSeller(sellerUser.business);
    } else {
      setSelectedSeller({
        id: product.sellerId,
        name: product.sellerBusinessName,
        role: 'producer',
        phone: '+251 91 123 4567',
        region: product.sellerRegion,
        city: 'Addis Ababa',
        verificationStatus: product.sellerVerified ? 'verified' : 'unverified',
        establishedYear: 2015,
        averageResponseTime: '< 2 hours',
        responseRate: '98%',
        rating: 4.8,
        totalOrdersCompleted: 150,
        description: 'Verified B2B wholesale producer and distributor.',
      });
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

  const getStockBadge = () => {
    switch (product.stockStatus) {
      case 'in_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#162C30]/90 text-[#F7F4EE] px-2 py-0.5 rounded backdrop-blur-sm border border-[#34626B]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97706]" />
            In Stock ({product.stockQuantity})
          </span>
        );
      case 'low_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#C85A32]/90 text-white px-2 py-0.5 rounded backdrop-blur-sm">
            <AlertCircle className="w-3 h-3" />
            Low Stock ({product.stockQuantity})
          </span>
        );
      case 'out_of_stock':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#112225]/90 text-[#A8A196] px-2 py-0.5 rounded backdrop-blur-sm border border-[#34626B]">
            Out of Stock
          </span>
        );
    }
  };

  return (
    <div
      id={`product-card-${product.id}`}
      onClick={handleCardClick}
      className="group bg-[#FFFFFF] hover:bg-[#FDFBF7] rounded-xl border border-[#E5DFD5] hover:border-[#C85A32] shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      <div className="relative w-full aspect-[4/3] bg-[#F3EFE9] overflow-hidden">
        <img
          src={product.images[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          <span className="text-[10px] uppercase font-bold tracking-wider bg-[#112225]/80 text-[#F7F4EE] px-2 py-0.5 rounded backdrop-blur-xs">
            {product.categoryName}
          </span>
        </div>

        <div className="absolute bottom-2.5 left-2.5">
          {getStockBadge()}
        </div>

        <div className="absolute bottom-2.5 right-2.5 text-[10px] text-[#EBE5DA] bg-[#112225]/85 backdrop-blur-xs px-2 py-0.5 rounded flex items-center gap-1 border border-[#34626B]">
          <Clock className="w-2.5 h-2.5 text-[#E27D56]" />
          <span>{product.leadTime}</span>
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <button
              onClick={handleSellerClick}
              className="text-left text-xs font-semibold text-[#162C30] hover:text-[#C85A32] truncate flex items-center gap-1 group/seller cursor-pointer"
              title={product.sellerBusinessName}
            >
              <span className="truncate">{product.sellerBusinessName}</span>
              {product.sellerVerified ? (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#92400E] bg-[#FEF3C7] border border-[#FCD34D] px-1.5 py-0.2 rounded shrink-0">
                  <ShieldCheck className="w-3 h-3 text-[#D97706]" />
                  Verified
                </span>
              ) : (
                <span className="text-[10px] text-[#888] bg-[#EFEAE0] px-1.5 py-0.2 rounded shrink-0">
                  Unverified
                </span>
              )}
            </button>
          </div>

          <h3 className="text-sm font-semibold text-[#112225] leading-snug line-clamp-2 mb-2 group-hover:text-[#C85A32] transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 text-[11px] text-[#6E685F] mb-3">
            <MapPin className="w-3 h-3 text-[#C85A32] shrink-0" />
            <span className="truncate">{product.sellerRegion}</span>
          </div>
        </div>

        <div>
          <div className="pt-2.5 border-t border-[#EFEAE0] flex items-end justify-between gap-2 mb-3.5">
            {currentUser ? (
              <div>
                <div className="text-[11px] text-[#6E685F]">Wholesale Price:</div>
                <div className="text-base font-bold text-[#C85A32]">
                  {product.price.toLocaleString()} <span className="text-xs font-medium text-[#112225]">{product.currency}</span>
                  <span className="text-[11px] font-normal text-[#6E685F]"> / {product.unit}</span>
                </div>
                {product.priceTiers && product.priceTiers.length > 1 && (
                  <div className="text-[10px] text-[#8B3E1E] font-medium">
                    Volume tier from {product.priceTiers[product.priceTiers.length - 1].pricePerUnit.toLocaleString()} {product.currency}
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setAuthModalOpen(true);
                }}
                className="group/lock flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#F7F4EE] hover:bg-[#EBE5DA] border border-[#D8CFBF] text-[#8B3E1E] text-xs font-semibold cursor-pointer transition-colors"
                title="Sign in to view wholesale volume pricing"
              >
                <Lock className="w-3 h-3 text-[#C85A32]" />
                <span>Register to view price</span>
              </button>
            )}

            <div className="text-right">
              <div className="text-[10px] uppercase font-semibold text-[#888] tracking-wider">MOQ</div>
              <div className="text-xs font-bold text-[#112225]">
                {product.moq.toLocaleString()} <span className="font-normal text-[#6E685F]">{product.unit}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              id={`btn-inquire-${product.id}`}
              onClick={handleInquire}
              className="w-full py-2 px-2 bg-[#F3EFE6] hover:bg-[#EBE5DA] active:bg-[#E0D8CA] text-[#162C30] text-xs font-semibold rounded-lg border border-[#D8CFBF] flex items-center justify-center gap-1 transition-colors cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#C85A32]" />
              <span>Inquire / RFQ</span>
            </button>

            <button
              id={`btn-order-${product.id}`}
              onClick={handleOrder}
              disabled={product.stockStatus === 'out_of_stock'}
              className={`w-full py-2 px-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer ${
                product.stockStatus === 'out_of_stock'
                  ? 'bg-[#E5DFD5] text-[#999] cursor-not-allowed'
                  : 'bg-[#C85A32] hover:bg-[#A34320] active:bg-[#8B3618] text-white shadow-xs'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Order</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
