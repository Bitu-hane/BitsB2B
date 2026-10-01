'use client';
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
import { CanvasProductImage } from './CanvasProductImage';

export const InquiriesInboxView: React.FC = () => {
  const {
    inquiries,
    currentUser,
    replyToInquiry,
    setViewingView,
  } = useMarketplace();

  const [selectedInquiryId, setSelectedInquiryId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // Inquiries for this user
  const userInquiries = inquiries.filter(inq => {
    if (currentUser?.isSeller) {
      return (
        inq.sellerId === currentUser.business.id ||
        inq.sellerBusinessName === currentUser.business.name
      );
    }
    return inq.buyerId === currentUser?.id || !currentUser;
  });

  const activeInquiry = userInquiries.find(i => i.id === selectedInquiryId);

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeInquiry) return;

    replyToInquiry(activeInquiry.id, replyText);
    setReplyText('');
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div id="inquiries-inbox-view" className="max-w-[1240px] mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* 1. Header Section */}
      <div>
        <h2 className="font-serif text-[27px] font-semibold text-[#1E2128] mb-1.5">
          Structured inquiries &amp; RFQ threads
        </h2>
        <p className="text-[#6B7078] text-[14px]">
          Ask technical or bulk-quotation questions tied directly to a catalog item.
        </p>
      </div>

      {userInquiries.length === 0 ? (
        <div className="bg-white border border-dashed border-[#E2E4EA] rounded-[18px] p-12 text-center">
          <div className="w-[54px] h-[54px] rounded-full bg-[#F2DFAE] text-[#9C6B1A] flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h4 className="font-serif text-[18px] font-semibold text-[#1E2128] mb-2">No inquiries yet</h4>
          <p className="text-[#6B7078] text-[13.5px] max-w-[44ch] mx-auto mb-6 leading-relaxed">
            Browse our catalog and click "Inquire / RFQ" on any item to start a quotation thread with verified suppliers.
          </p>
          <button
            onClick={() => setViewingView('catalog')}
            className="bg-[#1B2340] text-[#F4EFE3] hover:bg-[#223B28] px-6 py-3 rounded-[8px] text-[13.5px] font-semibold transition-colors cursor-pointer"
          >
            Explore Catalog
          </button>
        </div>
      ) : (
        /* 2. Main Inbox Container (Screenshot 1 Layout) */
        <div className="bg-white border border-[#E2E4EA] rounded-[18px] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[480px]">
          {/* Left Column: Inquiries List */}
          <div className="md:col-span-4 border-r border-[#E2E4EA] flex flex-col">
            <div className="p-4 border-b border-[#E2E4EA] font-serif font-semibold text-[16px] text-[#1E2128]">
              Inquiries ({userInquiries.length})
            </div>

            <div className="flex-1 divide-y divide-[#ECEDF1] overflow-y-auto">
              {userInquiries.map(inq => {
                const isSelected = selectedInquiryId === inq.id;
                const displayName = currentUser?.isSeller ? inq.buyerBusinessName : inq.sellerBusinessName;
                const initials = getInitials(displayName);
                const lastMsg = inq.messages[inq.messages.length - 1];

                return (
                  <button
                    key={inq.id}
                    id={`inquiry-item-${inq.id}`}
                    onClick={() => setSelectedInquiryId(inq.id)}
                    className={`w-full p-4 text-left transition-colors cursor-pointer flex gap-3 items-center ${
                      isSelected ? 'bg-[#F2DFAE]/30 border-l-4 border-[#C08829]' : 'hover:bg-[#F1F2F5]'
                    }`}
                  >
                    <CanvasProductImage
                      src={inq.productImage}
                      alt={inq.productName}
                      className="w-full h-full object-contain"
                      containerClassName="w-10 h-10 rounded-lg bg-[#FAF7F2] border border-[#E2E4EA] overflow-hidden shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-[13.5px] text-[#1E2128] truncate mb-0.5">
                        {displayName}
                      </div>
                      <div className="text-[12px] text-[#6B7078] line-clamp-2">
                        RE: {inq.productName} {lastMsg ? `— ${lastMsg.text}` : ''}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Thread Detail or Empty State */}
          <div className="md:col-span-8 bg-[#F1F2F5] p-6 flex flex-col justify-center items-center">
            {activeInquiry ? (
              <div className="w-full bg-white border border-[#E2E4EA] rounded-[11px] p-6 shadow-xs flex flex-col h-full">
                {/* Thread Header */}
                <div className="pb-4 border-b border-[#E2E4EA] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <CanvasProductImage
                      src={activeInquiry.productImage}
                      alt={activeInquiry.productName}
                      className="w-full h-full object-contain"
                      containerClassName="w-12 h-12 rounded-lg bg-[#FAF7F2] border border-[#E2E4EA] overflow-hidden shrink-0"
                    />
                    <div>
                      <h3 className="font-serif font-semibold text-[17px] text-[#1E2128]">
                        RE: {activeInquiry.productName}
                      </h3>
                      <div className="text-xs text-[#6B7078] mt-0.5">
                        With: <strong className="text-[#1E2128]">{currentUser?.isSeller ? activeInquiry.buyerBusinessName : activeInquiry.sellerBusinessName}</strong>
                      </div>
                    </div>
                  </div>
                  <span className="bg-[#DCE7DC] text-[#223B28] text-xs font-bold px-3 py-1 rounded-full shrink-0">
                    {activeInquiry.status.toUpperCase()}
                  </span>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 py-4 space-y-3 overflow-y-auto max-h-[300px]">
                  {activeInquiry.messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser?.id || (msg.isSeller && currentUser?.isSeller);

                    return (
                      <div
                        key={idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-[11px] text-xs leading-relaxed ${
                            isMe
                              ? 'bg-[#1B2340] text-white rounded-br-none'
                              : 'bg-[#F1F2F5] text-[#1E2128] border border-[#E2E4EA] rounded-bl-none'
                          }`}
                        >
                          <div className="font-semibold text-[10.5px] opacity-75 mb-1">
                            {msg.senderName} ({msg.timestamp})
                          </div>
                          <div>{msg.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-3 border-t border-[#E2E4EA] flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your quotation or technical question reply..."
                    className="flex-1 bg-[#F1F2F5] border border-[#E2E4EA] rounded-[7px] px-3.5 py-2 text-xs text-[#1E2128] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-[#C08829] hover:bg-[#9C6B1A] text-[#1B2340] hover:text-white px-4 py-2 rounded-[7px] text-xs font-bold transition-colors cursor-pointer"
                  >
                    Send Reply
                  </button>
                </form>
              </div>
            ) : (
              /* Empty State (Exact Screenshot 1) */
              <div className="text-center p-8 max-w-sm">
                <div className="w-[54px] h-[54px] rounded-full bg-[#F2DFAE] text-[#9C6B1A] flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-serif text-[18px] font-semibold text-[#1E2128] mb-2">Select a thread</h4>
                <p className="text-[#6B7078] text-[13.5px] leading-relaxed">
                  Choose an inquiry on the left to see the full quotation and spec exchange.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
