import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  MessageSquare,
  Building2,
  ShieldCheck,
  Package,
  Send,
  Clock,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { StructuredInquiry } from '../types';

export const InquiriesInboxView: React.FC = () => {
  const {
    inquiries,
    currentUser,
    replyToInquiry,
    setSelectedProduct,
    products,
    setViewingView,
  } = useMarketplace();

  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(
    inquiries[0]?.id || null
  );
  const [replyText, setReplyText] = useState('');

  // Inquiries for this user (as buyer or seller)
  const userInquiries = inquiries.filter(inq => {
    if (currentUser?.isSeller) {
      return (
        inq.sellerId === currentUser.business.id ||
        inq.sellerBusinessName === currentUser.business.name
      );
    }
    return inq.buyerId === currentUser?.id || !currentUser;
  });

  const activeInquiry = userInquiries.find(i => i.id === selectedInquiryId) || userInquiries[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeInquiry) return;

    replyToInquiry(activeInquiry.id, replyText);
    setReplyText('');
  };

  return (
    <div id="inquiries-inbox-view" className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-[#112225] text-[#F7F4EE] rounded-2xl p-6 border border-[#274B52] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-[#C85A32] text-white">
              <MessageSquare className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold tracking-tight">
              Structured Product Inquiries &amp; RFQ Threads
            </h1>
          </div>
          <p className="text-xs text-[#A8A196] mt-1 max-w-xl">
            Direct product-anchored communication channel. Ask questions tied to specific catalog items,
            receive verified seller answers, quotations, and technical spec sheets.
          </p>
        </div>

        <button
          onClick={() => setViewingView('catalog')}
          className="px-4 py-2 bg-[#1D383D] hover:bg-[#23454B] text-xs font-semibold text-[#F7F4EE] rounded-xl border border-[#34626B] transition-colors cursor-pointer self-start md:self-auto"
        >
          Browse Wholesale Catalog &rarr;
        </button>
      </div>

      {userInquiries.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#E5DFD5] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F2] flex items-center justify-center text-[#888] mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-[#112225]">No Inquiries Yet</h3>
          <p className="text-xs text-[#6E685F] max-w-sm mx-auto">
            Browse our B2B catalog and tap <strong>"Inquire / RFQ"</strong> on any product to ask technical or bulk quotation questions directly to the manufacturer.
          </p>
          <button
            onClick={() => setViewingView('catalog')}
            className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Explore Wholesale Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Threads List Sidebar */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-[#E5DFD5] shadow-xs overflow-hidden divide-y divide-[#EFEAE0]">
            <div className="p-3.5 bg-[#FAF7F2] border-b border-[#E5DFD5] text-xs font-bold text-[#112225] flex justify-between items-center">
              <span>All Inquiry Threads</span>
              <span className="text-[11px] text-[#6E685F] bg-[#EBE5DA] px-2 py-0.5 rounded-full font-normal">
                {userInquiries.length} Active
              </span>
            </div>

            <div className="max-h-[600px] overflow-y-auto divide-y divide-[#EFEAE0]">
              {userInquiries.map(inq => {
                const isSelected = activeInquiry?.id === inq.id;
                const lastMsg = inq.messages[inq.messages.length - 1];

                return (
                  <button
                    key={inq.id}
                    id={`inquiry-item-${inq.id}`}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`w-full p-4 text-left transition-colors cursor-pointer flex gap-3 ${
                      isSelected ? 'bg-[#FAF7F2] border-l-4 border-[#C85A32]' : 'hover:bg-[#FDFBF7]'
                    }`}
                  >
                    <img
                      src={inq.productImage}
                      alt={inq.productName}
                      className="w-12 h-12 rounded-lg object-cover border border-[#D8CFBF] bg-[#F7F4EE] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-[#112225] truncate">
                          {inq.productName}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                            inq.status === 'answered'
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[#E5DFD5] text-[#6E685F]'
                          }`}
                        >
                          {inq.status === 'answered' ? 'Replied' : 'Pending'}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#6E685F] mt-0.5 truncate">
                        {currentUser?.isSeller ? `Buyer: ${inq.buyerBusinessName}` : `Seller: ${inq.sellerBusinessName}`}
                      </div>

                      <p className="text-[11px] text-[#888] line-clamp-1 mt-1">
                        {lastMsg ? lastMsg.text : 'New structured inquiry'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Thread Conversation Pane */}
          {activeInquiry && (
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E5DFD5] shadow-xs overflow-hidden flex flex-col min-h-[500px]">
              {/* Thread Header */}
              <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DFD5] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={activeInquiry.productImage}
                    alt={activeInquiry.productName}
                    className="w-12 h-12 rounded-lg object-cover border border-[#D8CFBF]"
                  />
                  <div>
                    <h2 className="text-sm font-bold text-[#112225]">
                      {activeInquiry.productName}
                    </h2>
                    <div className="text-xs text-[#6E685F] flex items-center gap-2 mt-0.5">
                      <span>Supplier: <strong>{activeInquiry.sellerBusinessName}</strong></span>
                      <span>&bull;</span>
                      <span>Topic: <strong className="capitalize">{activeInquiry.topic.replace('_', ' ')}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const prod = products.find(p => p.id === activeInquiry.productId);
                      if (prod) setSelectedProduct(prod);
                    }}
                    className="px-3 py-1.5 bg-white border border-[#D8CFBF] hover:bg-[#F3EFE6] text-xs font-semibold text-[#112225] rounded-lg transition-colors cursor-pointer"
                  >
                    View Product Details
                  </button>
                </div>
              </div>

              {/* Messages Timeline */}
              <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
                {activeInquiry.messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl text-xs space-y-1.5 max-w-[85%] ${
                      msg.isSeller
                        ? 'bg-[#FAF7F2] border border-[#C85A32]/30 ml-auto'
                        : 'bg-white border border-[#E5DFD5] mr-auto'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4 text-[11px]">
                      <span className="font-bold text-[#112225] flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-[#C85A32]" />
                        {msg.senderBusiness} ({msg.isSeller ? 'Seller' : 'Buyer'})
                      </span>
                      <span className="text-[#888]">{msg.timestamp}</span>
                    </div>
                    <p className="text-[#162C30] leading-relaxed whitespace-pre-wrap">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              {/* Reply Input Bar */}
              <form onSubmit={handleSendReply} className="p-4 bg-[#FAF7F2] border-t border-[#E5DFD5] flex gap-2">
                <input
                  type="text"
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={
                    currentUser?.isSeller
                      ? 'Type official seller response or price quote...'
                      : 'Type follow-up question or specification requirement...'
                  }
                  className="flex-1 px-4 py-2.5 bg-white border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                />
                <button
                  type="submit"
                  id="btn-send-inbox-inquiry-reply"
                  className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
