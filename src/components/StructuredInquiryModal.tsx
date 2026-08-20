import React, { useState } from 'react';
import { useMarketplace } from '../context/MarketplaceContext';
import {
  X,
  MessageSquare,
  Send,
  Building2,
  ShieldCheck,
  Package,
  HelpCircle,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const StructuredInquiryModal: React.FC = () => {
  const {
    inquiryModalOpen,
    setInquiryModalOpen,
    inquiryTargetProduct,
    setInquiryTargetProduct,
    currentUser,
    createInquiry,
    inquiries,
    replyToInquiry,
  } = useMarketplace();

  const [topic, setTopic] = useState<'quotation' | 'sample_request' | 'specifications' | 'delivery_time' | 'custom_bulk'>('quotation');
  const [targetQty, setTargetQty] = useState<string>('');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [messageText, setMessageText] = useState('');
  const [replyText, setReplyText] = useState('');

  if (!inquiryModalOpen || !inquiryTargetProduct) return null;

  // Find if there is an existing inquiry thread for this product by the current user
  const existingInquiry = inquiries.find(
    inq => inq.productId === inquiryTargetProduct.id && inq.buyerId === currentUser?.id
  );

  const handleSubmitNewInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    createInquiry(
      inquiryTargetProduct,
      topic,
      messageText,
      targetQty ? parseInt(targetQty) : undefined,
      targetPrice ? parseFloat(targetPrice) : undefined
    );

    setMessageText('');
    setInquiryModalOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !existingInquiry) return;

    replyToInquiry(existingInquiry.id, replyText);
    setReplyText('');
  };

  const TOPICS: { key: typeof topic; label: string; placeholder: string }[] = [
    {
      key: 'quotation',
      label: 'Volume Quotation',
      placeholder: 'Hello, please send quotation for bulk orders with terms of delivery to our warehouse in...',
    },
    {
      key: 'sample_request',
      label: 'Sample Unit Request',
      placeholder: 'We would like to request 1 sample unit for testing and lab inspection prior to 10,000 unit order...',
    },
    {
      key: 'specifications',
      label: 'Technical Customization',
      placeholder: 'Can you customize the material composition / dimensions / electrical voltage to 380V 50Hz?',
    },
    {
      key: 'delivery_time',
      label: 'Lead Time & Regional Freight',
      placeholder: 'What is the fastest dispatch timeframe to Mojo Dry Port / Hawassa Industrial Zone?',
    },
    {
      key: 'custom_bulk',
      label: 'Custom Packaging & Branding',
      placeholder: 'Can you imprint our company logo on packaging in 2 colors with export grade standard?',
    },
  ];

  return (
    <AnimatePresence>
      <div
        id="structured-inquiry-modal-backdrop"
        className="fixed inset-0 z-50 bg-[#0B1718]/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        onClick={() => setInquiryModalOpen(false)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          onClick={e => e.stopPropagation()}
          className="bg-[#FFFFFF] text-[#162C30] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E5DFD5] overflow-hidden max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#112225] text-[#F7F4EE] p-5 border-b border-[#274B52] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#C85A32] flex items-center justify-center text-white font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#F7F4EE]">
                  Structured Product Inquiry (RFQ)
                </h2>
                <p className="text-xs text-[#A8A196]">
                  Direct product-anchored thread with seller &bull; Recorded Q&amp;A history
                </p>
              </div>
            </div>
            <button
              id="btn-close-inquiry-modal"
              onClick={() => setInquiryModalOpen(false)}
              className="text-[#888] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Product Summary Header Card */}
          <div className="p-4 bg-[#FAF7F2] border-b border-[#E5DFD5] flex items-center gap-3.5 shrink-0">
            <img
              src={inquiryTargetProduct.images[0]}
              alt={inquiryTargetProduct.name}
              className="w-14 h-14 rounded-lg object-cover border border-[#D8CFBF] bg-white shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-[#112225] truncate">
                {inquiryTargetProduct.name}
              </div>
              <div className="text-[11px] text-[#6E685F] mt-0.5 flex items-center gap-2">
                <span>Supplier: <strong className="text-[#112225]">{inquiryTargetProduct.sellerBusinessName}</strong></span>
                {inquiryTargetProduct.sellerVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] text-[#92400E] font-bold">
                    <ShieldCheck className="w-3 h-3 text-[#D97706]" /> Verified
                  </span>
                )}
              </div>
              <div className="text-[11px] text-[#888] mt-0.5">
                MOQ: <strong>{inquiryTargetProduct.moq} {inquiryTargetProduct.unit}</strong> &bull; Lead Time: {inquiryTargetProduct.leadTime}
              </div>
            </div>
          </div>

          {/* Body Section */}
          <div className="p-6 overflow-y-auto flex-1 space-y-4">
            {/* If an active thread already exists, show the structured conversation */}
            {existingInquiry ? (
              <div className="space-y-4">
                <div className="p-3 bg-[#F3EFE6] rounded-xl border border-[#D8CFBF] text-xs flex items-center justify-between">
                  <div>
                    <span className="text-[#888]">Inquiry Topic:</span>{' '}
                    <strong className="text-[#112225] uppercase">{existingInquiry.topic.replace('_', ' ')}</strong>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      existingInquiry.status === 'answered'
                        ? 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]'
                        : 'bg-[#E5DFD5] text-[#6E685F]'
                    }`}
                  >
                    {existingInquiry.status === 'answered' ? 'Seller Replied' : 'Pending Seller Reply'}
                  </span>
                </div>

                {/* Message Log */}
                <div className="space-y-3">
                  {existingInquiry.messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                        msg.isSeller
                          ? 'bg-[#FAF7F2] border border-[#C85A32]/30 ml-4'
                          : 'bg-white border border-[#E5DFD5] mr-4'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-[#112225] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#C85A32]" />
                          {msg.senderBusiness} ({msg.isSeller ? 'Seller Response' : 'Buyer Inquiry'})
                        </span>
                        <span className="text-[#888]">{msg.timestamp}</span>
                      </div>
                      <p className="text-[#162C30] leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Reply Form */}
                <form onSubmit={handleSendReply} className="pt-2">
                  <label className="block text-xs font-semibold text-[#112225] mb-1">
                    Follow Up in Thread
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply to this inquiry..."
                    className="w-full p-3 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      id="btn-send-inquiry-reply"
                      className="px-4 py-2 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Follow-up Message</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* New Inquiry Form */
              <form onSubmit={handleSubmitNewInquiry} className="space-y-4">
                {/* Topic Selector */}
                <div>
                  <label className="block text-xs font-semibold text-[#112225] mb-1.5">
                    Select Inquiry Category / Intent *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {TOPICS.map(t => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => {
                          setTopic(t.key);
                          if (!messageText) {
                            setMessageText(t.placeholder);
                          }
                        }}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                          topic === t.key
                            ? 'bg-[#F7F4EE] border-[#C85A32] font-semibold text-[#C85A32]'
                            : 'bg-white border-[#E5DFD5] hover:bg-[#FAF7F2] text-[#162C30]'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Quantity and Target Price Optional Inputs */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#112225] mb-1">
                      Target Order Quantity (Optional)
                    </label>
                    <input
                      type="number"
                      min={inquiryTargetProduct.moq}
                      value={targetQty}
                      onChange={e => setTargetQty(e.target.value)}
                      placeholder={`Min: ${inquiryTargetProduct.moq} ${inquiryTargetProduct.unit}`}
                      className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#112225] mb-1">
                      Target Price / Unit (Optional, ETB)
                    </label>
                    <input
                      type="number"
                      value={targetPrice}
                      onChange={e => setTargetPrice(e.target.value)}
                      placeholder={`e.g. ${inquiryTargetProduct.price}`}
                      className="w-full px-3 py-2 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                    />
                  </div>
                </div>

                {/* Question Textarea */}
                <div>
                  <label className="block text-xs font-semibold text-[#112225] mb-1">
                    Specific Requirements &amp; Commercial Questions *
                  </label>
                  <textarea
                    id="textarea-inquiry-message"
                    rows={4}
                    required
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    placeholder="Provide specific technical parameters, delivery location in Ethiopia, packaging specifications, or payment terms..."
                    className="w-full p-3 bg-[#F7F4EE] border border-[#D8CFBF] rounded-xl text-xs text-[#112225] focus:outline-none focus:border-[#C85A32]"
                  />
                  <p className="text-[11px] text-[#888] mt-1">
                    Your inquiry will be logged directly in the seller's verified inbox and trigger an instant SMS notice.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInquiryModalOpen(false)}
                    className="px-4 py-2.5 border border-[#D8CFBF] hover:bg-[#F3EFE6] text-xs font-semibold text-[#162C30] rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="btn-submit-structured-inquiry"
                    className="px-5 py-2.5 bg-[#C85A32] hover:bg-[#A34320] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Inquiry &amp; Dispatch SMS Alert</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
