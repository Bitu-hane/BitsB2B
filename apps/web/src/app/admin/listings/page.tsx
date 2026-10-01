'use client';

import React, { useState, useEffect } from 'react';
import {
  Package,
  FolderTree,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  Send,
  Trash2,
  HelpCircle,
  Layers,
  ChevronRight,
  Info,
  Maximize2,
  Minimize2,
  Search,
  UnfoldVertical,
  FoldVertical,
  Sprout,
  Factory,
  Shirt,
  Zap,
  Truck,
  Pill,
  Cog,
  Box,
  Monitor,
  Armchair,
  Wrench,
  Flame,
  Car,
  ShoppingBag,
  Droplet,
  HardHat,
  Wheat,
  Eye,
  X,
  Image as ImageIcon,
  Folder,
  Tag,
  Upload,
  Star,
} from 'lucide-react';
import { Seal, Th, Td, Btn } from '../layout-components';
import { api } from '../../../services/api';
import { toast } from '../../../components/Toast';
import { useMarketplace } from '../../../context/MarketplaceContext';
import { ProductCard } from '../../../components/ProductCard';
import { Product } from '../../../types';

export interface AdminListingItem {
  id: string;
  name: string;
  title?: string;
  cat: string;
  categoryName?: string;
  categoryId?: string;
  seller: string;
  sellerBusinessId?: string;
  price: string;
  moq: string;
  status: string;
  image?: string;
  images?: string[];
  verifiedSeller?: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  parentId: string;
}

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
  level?: number;
  isLeaf?: boolean;
  icon?: string;
  iconName?: string;
  subcategories: CategoryTreeItem[];
}

export interface CategoryRequest {
  id: string;
  name: string;
  requestedByName: string;
  reason: string;
  icon?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedByName?: string;
  rejectionReason?: string;
  createdAt: string;
}

const LeatherIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3h12l2 4-2 3 3 5-3 6H6l-3-6 3-5-2-3 2-4z" />
  </svg>
);

const CURATED_ICONS = [
  { key: 'Sprout', label: 'Agriculture', Icon: Sprout },
  { key: 'Factory', label: 'Factory & Industrial', Icon: Factory },
  { key: 'Shirt', label: 'Apparel & Textiles', Icon: Shirt },
  { key: 'Zap', label: 'Electrical & Power', Icon: Zap },
  { key: 'Truck', label: 'Logistics & Vehicles', Icon: Truck },
  { key: 'Pill', label: 'Medical & Pharma', Icon: Pill },
  { key: 'Cog', label: 'Machinery & Parts', Icon: Cog },
  { key: 'Box', label: 'Packaging & Cartons', Icon: Box },
  { key: 'Monitor', label: 'IT & Electronics', Icon: Monitor },
  { key: 'Armchair', label: 'Furniture & Decor', Icon: Armchair },
  { key: 'Wrench', label: 'Tools & Hardware', Icon: Wrench },
  { key: 'ShieldCheck', label: 'Security & Safety', Icon: ShieldCheck },
  { key: 'Flame', label: 'Energy & Chemicals', Icon: Flame },
  { key: 'Car', label: 'Automotive Parts', Icon: Car },
  { key: 'Package', label: 'General Wholesale', Icon: Package },
  { key: 'ShoppingBag', label: 'Consumer Goods', Icon: ShoppingBag },
  { key: 'Droplet', label: 'Liquids & Oils', Icon: Droplet },
  { key: 'HardHat', label: 'Construction', Icon: HardHat },
  { key: 'Wheat', label: 'Grains & Cereals', Icon: Wheat },
  { key: 'Layers', label: 'Raw Materials', Icon: Layers },
  { key: 'Leather', label: 'Leather & Leather Goods', Icon: LeatherIcon },
];

const RenderCategoryIcon: React.FC<{ iconName?: string; name?: string; className?: string }> = ({
  iconName,
  name,
  className = 'w-4 h-4 text-emerald-700',
}) => {
  const match = CURATED_ICONS.find((item) => item.key === iconName);
  if (match) {
    const Component = match.Icon;
    return <Component className={className} />;
  }
  return <Package className={className} />;
};

const CuratedIconPicker: React.FC<{
  selectedIcon: string;
  onSelectIcon: (key: string) => void;
  label?: string;
}> = ({ selectedIcon, onSelectIcon, label = 'Select Category Icon' }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="f-mono text-[10px] uppercase text-stone-500 font-semibold flex items-center gap-1">
          <span>{label} *</span>
          <span className="text-[9px] text-stone-400 font-normal">(Pick from curated brand library)</span>
        </label>
        {selectedIcon && (
          <span className="f-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
            Selected: <strong className="ml-1">{selectedIcon}</strong>
          </span>
        )}
      </div>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 p-2 bg-white border border-stone-300 rounded max-h-[140px] overflow-y-auto">
        {CURATED_ICONS.map(({ key, label: itemLabel, Icon }) => {
          const isSelected = selectedIcon === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectIcon(key)}
              title={`${itemLabel} (${key})`}
              className={`p-1.5 rounded border text-center flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-900 font-bold scale-105 shadow-xs'
                  : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200 hover:border-stone-400'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-[8px] font-mono leading-tight truncate max-w-[45px]">{key}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const countDescendants = (node: CategoryTreeItem): { level2Count: number; level3Count: number; level4Count: number } => {
  let level2Count = 0;
  let level3Count = 0;
  let level4Count = 0;

  if (!node.subcategories || node.subcategories.length === 0) {
    return { level2Count: 0, level3Count: 0, level4Count: 0 };
  }

  for (const child of node.subcategories) {
    if (child.level === 2) level2Count += 1;
    else if (child.level === 3) level3Count += 1;
    else if (child.level === 4) level4Count += 1;

    const childCounts = countDescendants(child);
    level2Count += childCounts.level2Count;
    level3Count += childCounts.level3Count;
    level4Count += childCounts.level4Count;
  }

  return { level2Count, level3Count, level4Count };
};

const CategoryTreeNode: React.FC<{
  node: CategoryTreeItem;
  expandedMap: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onEdit: (id: string, name: string, icon?: string) => Promise<void> | void;
  onDelete: (id: string, name: string) => void;
  depth?: number;
}> = ({ node, expandedMap, onToggleExpand, onEdit, onDelete, depth = 0 }) => {
  const isExpanded = expandedMap[node.id] ?? true;
  const hasChildren = Boolean(node.subcategories && node.subcategories.length > 0);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [editIcon, setEditIcon] = useState(node.icon || node.iconName || 'Package');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditName(node.name);
    setEditIcon(node.icon || node.iconName || 'Package');
  }, [node.name, node.icon, node.iconName]);

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    try {
      setIsSaving(true);
      await onEdit(node.id, editName.trim(), editIcon);
      setIsEditing(false);
    } catch {
      // Keep editing mode on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditName(node.name);
    setEditIcon(node.icon || node.iconName || 'Package');
    setIsEditing(false);
  };

  const levelBadgeTone =
    !hasChildren ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' :
    node.level === 1 ? 'bg-amber-100 text-amber-900 border-amber-200' :
    node.level === 2 ? 'bg-sky-100 text-sky-900 border-sky-200' :
    'bg-purple-100 text-purple-900 border-purple-200';

  const levelLabel =
    !hasChildren ? '📦 Product Type' :
    node.level === 1 ? 'Vertical' :
    node.level === 2 ? 'Category Group' :
    'Subcategory Group';

  const bgTone =
    depth === 0 ? 'bg-stone-50 hover:bg-stone-100' :
    depth === 1 ? 'bg-emerald-50/40 hover:bg-emerald-50/80 border-l-2 border-l-emerald-600' :
    depth === 2 ? 'bg-sky-50/40 hover:bg-sky-50/80 border-l-2 border-l-sky-600' :
    'bg-purple-50/40 hover:bg-purple-50/80 border-l-2 border-l-purple-600';

  return (
    <div className="border border-stone-200 rounded overflow-hidden mb-1.5 shadow-2xs">
      <div className={`${bgTone} p-2 flex items-center justify-between transition-colors gap-2`}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            onClick={() => onToggleExpand(node.id)}
            className="flex items-center gap-1.5 text-left cursor-pointer focus:outline-none"
          >
            {hasChildren ? (
              <ChevronRight
                size={14}
                className={`text-stone-600 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
              />
            ) : (
              <span className="w-3.5 h-3.5 flex items-center justify-center text-[10px] text-stone-400">•</span>
            )}
          </button>

          {isEditing ? (
            <div className="flex flex-col gap-2 flex-1 my-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveEdit();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
                className="text-xs font-bold text-stone-900 bg-white border border-emerald-700 px-2 py-1 rounded focus:outline-none shadow-xs flex-1"
              />
              <CuratedIconPicker selectedIcon={editIcon} onSelectIcon={setEditIcon} label="Update Icon" />
            </div>
          ) : (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <RenderCategoryIcon iconName={node.icon || node.iconName} name={node.name} className="w-4 h-4 text-emerald-800 shrink-0" />
              <span
                onDoubleClick={() => setIsEditing(true)}
                className="f-body text-xs font-bold text-stone-900 truncate cursor-pointer hover:text-emerald-800 transition-colors"
                title="Double click to edit category name"
              >
                {node.name}
              </span>
            </div>
          )}

          <span className={`f-mono text-[9px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${levelBadgeTone}`}>
            Level {node.level || 1}: {levelLabel}
          </span>
          <span className="f-mono text-[10px] text-stone-400 font-normal truncate">({node.slug})</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="text-[10px] bg-emerald-800 hover:bg-emerald-900 text-white font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                title="Save changes (Enter)"
              >
                <CheckCircle2 size={11} /> Save
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="text-[10px] bg-stone-200 hover:bg-stone-300 text-stone-700 font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 transition-colors cursor-pointer"
                title="Cancel editing (Esc)"
              >
                <XCircle size={11} /> Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-[10px] text-amber-700 hover:text-amber-900 font-mono font-semibold px-1.5 py-0.5 rounded hover:bg-amber-100/70 border border-amber-200/60 transition-colors"
                title="Edit category name"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(node.id, node.name)}
                className="text-[10px] text-rose-600 hover:text-rose-800 font-mono font-semibold px-1.5 py-0.5 rounded hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                title="Delete category node"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recursive Render of Subcategories when expanded */}
      {isExpanded && hasChildren && (
        <div className="p-2 bg-white space-y-1.5 border-t border-stone-100 pl-4">
          {node.subcategories.map((sub) => (
            <CategoryTreeNode
              key={sub.id}
              node={sub}
              expandedMap={expandedMap}
              onToggleExpand={onToggleExpand}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const flattenCategoryTree = (nodes: CategoryTreeItem[]): CategoryTreeItem[] => {
  let result: CategoryTreeItem[] = [];
  nodes.forEach((node) => {
    result.push(node);
    if (node.subcategories && node.subcategories.length > 0) {
      result = result.concat(flattenCategoryTree(node.subcategories));
    }
  });
  return result;
};



export default function AdminListingsPage() {
  const { products: contextProducts } = useMarketplace();

  // Authenticated user's actual staff role
  const [userStaffRole, setUserStaffRole] = useState<string>('LISTINGS_MODERATOR');
  // Role view state ('LISTINGS_MODERATOR' vs 'SUPER_ADMIN')
  const [viewRole, setViewRole] = useState<'LISTINGS_MODERATOR' | 'SUPER_ADMIN'>('LISTINGS_MODERATOR');

  // Listings State
  const [listingTab, setListingTab] = useState<'all' | 'pending' | 'flagged' | 'published'>('all');
  const [listings, setListings] = useState<AdminListingItem[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [fixModalListing, setFixModalListing] = useState<AdminListingItem | null>(null);
  const [fixNote, setFixNote] = useState('');

  // Preview Modal State for Product Image Audit & Marketplace Card Preview
  const [previewModalListing, setPreviewModalListing] = useState<AdminListingItem | null>(null);
  const [selectedPreviewImgIdx, setSelectedPreviewImgIdx] = useState<number>(0);

  const mapListingToProduct = (item: AdminListingItem): Product => {
    const numPrice = parseFloat(item.price.replace(/[^0-9.]/g, '')) || 2500;
    const numMoq = parseInt(item.moq.replace(/[^0-9]/g, '')) || 5;
    const unitStr = item.price.includes('/') ? item.price.split('/')[1].trim() : 'units';
    const imgList =
      item.images && item.images.length > 0
        ? item.images
        : item.image
        ? [item.image]
        : ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80'];

    return {
      id: item.id,
      name: item.name || item.title || 'B2B Wholesale Product',
      categoryId: item.categoryId || 'cat_1',
      categoryName: item.categoryName || item.cat || 'Agriculture & Food',
      sellerId: item.sellerBusinessId || 'seller_1',
      sellerBusinessName: item.seller || 'Prime B2B Producer PLC',
      sellerVerified: item.verifiedSeller ?? true,
      sellerRegion: 'Addis Ababa',
      price: numPrice,
      currency: 'ETB',
      priceTiers: [
        { minQty: numMoq, maxQty: numMoq * 5, pricePerUnit: numPrice },
        { minQty: numMoq * 5 + 1, pricePerUnit: Math.round(numPrice * 0.9) },
      ],
      moq: numMoq,
      unit: unitStr,
      stockStatus: 'in_stock',
      stockQuantity: 500,
      stockLastUpdated: 'Today',
      leadTime: '2 - 5 Days',
      deliveryZones: ['Addis Ababa', 'Oromia', 'Dire Dawa', 'Amhara'],
      images: imgList,
      description:
        'High quality wholesale B2B product verified for marketplace buyers. Direct order and escrow protected.',
      specifications: {
        Origin: 'Ethiopia',
        'Quality Grade': 'Export Grade A',
        Packaging: 'Bulk B2B Packaging',
      },
      createdAt: new Date().toISOString(),
      status: item.status,
    };
  };

  // Category State
  const [categories, setCategories] = useState<CategoryTreeItem[]>([]);
  const [flatCategories, setFlatCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Full-screen taxonomy modal state
  const [isTreeFullScreen, setIsTreeFullScreen] = useState(false);
  const [treeSearchQuery, setTreeSearchQuery] = useState('');

  // Expand / Collapse all tree nodes
  const handleExpandAllNodes = () => {
    const map: Record<string, boolean> = {};
    const mark = (nodes: CategoryTreeItem[]) => {
      nodes.forEach((n) => {
        map[n.id] = true;
        if (n.subcategories) mark(n.subcategories);
      });
    };
    mark(categories);
    setExpandedCategories(map);
  };

  const handleCollapseAllNodes = () => {
    const map: Record<string, boolean> = {};
    const mark = (nodes: CategoryTreeItem[]) => {
      nodes.forEach((n) => {
        map[n.id] = false;
        if (n.subcategories) mark(n.subcategories);
      });
    };
    mark(categories);
    setExpandedCategories(map);
  };

  // Subcategory instant creation form state
  const [selectedParentId, setSelectedParentId] = useState('');
  const [subcatName, setSubcatName] = useState('');
  const [subcatSubmitting, setSubcatSubmitting] = useState(false);

  // Moderator & Admin: New Top-Level Category Request Form State
  const [reqCatName, setReqCatName] = useState('');
  const [reqCatReason, setReqCatReason] = useState('');
  const [reqSelectedIcon, setReqSelectedIcon] = useState<string>('Package');
  const [reqSubmitting, setReqSubmitting] = useState(false);

  // Admin: Category Requests Queue
  const [categoryRequests, setCategoryRequests] = useState<CategoryRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load Data
  const fetchData = async (isInitial = false) => {
    try {
      if (isInitial) {
        setLoadingListings(true);
        setLoadingCategories(true);
        setLoadingRequests(true);
      }

      const [profileRes, listingsRes, categoriesRes, requestsRes] = await Promise.all([
        api.getProfile(),
        api.getAdminListings(),
        api.getCategories(),
        api.getCategoryRequests(),
      ]);

      if (profileRes.data) {
        const role = profileRes.data.staffRole || profileRes.data.staff_role || 'LISTINGS_MODERATOR';
        setUserStaffRole(role);
        if (role !== 'SUPER_ADMIN') {
          setViewRole('LISTINGS_MODERATOR');
        } else {
          setViewRole('SUPER_ADMIN');
        }
      }

      const remoteListings: AdminListingItem[] = listingsRes.data?.data && Array.isArray(listingsRes.data.data) ? listingsRes.data.data : [];
      
      // Map marketplace context products into AdminListingItem format
      const localListings: AdminListingItem[] = contextProducts.map(p => ({
        id: p.id,
        name: p.name,
        title: p.name,
        cat: p.categoryId,
        categoryName: p.categoryName || 'General Wholesale',
        seller: p.sellerBusinessName || 'Verified Seller',
        sellerBusinessId: p.sellerId,
        price: `${p.price} ETB / ${p.unit}`,
        moq: `${p.moq} ${p.unit}`,
        status: p.status || 'PENDING_APPROVAL',
        images: p.images || [],
        verifiedSeller: p.sellerVerified,
      }));

      // Combine remote listings with local listings (deduplicating by ID)
      const remoteIds = new Set(remoteListings.map(l => l.id));
      const extraLocals = localListings.filter(l => !remoteIds.has(l.id));
      const combinedListings = [...remoteListings, ...extraLocals];

      setListings(prev => {
        if (JSON.stringify(prev) === JSON.stringify(combinedListings)) return prev;
        return combinedListings;
      });

      if (categoriesRes.data?.data && Array.isArray(categoriesRes.data.data)) {
        const tree = categoriesRes.data.data;
        setCategories(prev => {
          if (JSON.stringify(prev) === JSON.stringify(tree)) return prev;
          return tree;
        });

        const flattened = flattenCategoryTree(tree);
        setFlatCategories(flattened);

        // Expand all by default if not already initialized
        setExpandedCategories(prev => {
          if (Object.keys(prev).length > 0) return prev;
          const initExpanded: Record<string, boolean> = {};
          flattened.forEach((c: CategoryTreeItem) => {
            initExpanded[c.id] = true;
          });
          return initExpanded;
        });

        // Preserve user's selected parent category choice
        if (flattened.length > 0) {
          setSelectedParentId(prev => {
            if (prev && flattened.some((c: any) => c.id === prev)) {
              return prev;
            }
            return flattened[0].id;
          });
        }
      }

      if (requestsRes.data?.data && Array.isArray(requestsRes.data.data)) {
        setCategoryRequests(prev => {
          if (JSON.stringify(prev) === JSON.stringify(requestsRes.data.data)) return prev;
          return requestsRes.data.data;
        });
      }
    } catch (err: any) {
      console.error('Error fetching admin listings data:', err);
    } finally {
      if (isInitial) {
        setLoadingListings(false);
        setLoadingCategories(false);
        setLoadingRequests(false);
      }
    }
  };

  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => fetchData(false), 5000);
    return () => clearInterval(interval);
  }, [contextProducts]);

  const flashMessage = (text: string, type: 'success' | 'error' = 'success', customDuration?: number) => {
    setActionMessage({ text, type });
    const duration = customDuration ?? (type === 'error' ? 7000 : 4000);
    setTimeout(() => setActionMessage(null), duration);
  };

  // Listing Moderation Actions
  const handleListingAction = async (
    id: string,
    action: 'APPROVE' | 'REJECT' | 'FLAG' | 'REQUEST_FIX' | 'BULK_REMOVE_SELLER',
    notes?: string,
  ) => {
    if (action === 'APPROVE') {
      const item = listings.find((l) => l.id === id);
      const photoCount = item?.images && Array.isArray(item.images) ? item.images.length : (item?.image ? 1 : 0);
      if (photoCount < 1) {
        flashMessage(
          `⚠️ Publishing Notice: Listing "${item?.name || id}" has no photos attached. Please ask seller for product photos if required before approving.`,
          'error',
          7000
        );
        return;
      }
    }
    try {
      const { data } = await api.handleListingAction(id, action, notes);
      if (data?.success) {
        flashMessage(data.message || 'Listing updated successfully.');
        setFixModalListing(null);
        setFixNote('');
        fetchData();
      } else {
        flashMessage(data?.message || 'Failed to update listing status', 'error');
      }
    } catch (err: any) {
      flashMessage(err.message || 'Action error', 'error');
    }
  };

  // Instant Subcategory Creation (Listings Moderator or Super Admin)
  const handleCreateSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentId || !subcatName.trim()) {
      flashMessage('Please select a top-level category and enter a subcategory name.', 'error');
      return;
    }

    try {
      setSubcatSubmitting(true);
      const { data, error } = await api.createSubcategory({ parentId: selectedParentId, name: subcatName.trim() });
      if (data?.success) {
        flashMessage(data.message || 'Subcategory added instantly!');
        setSubcatName('');
        fetchData();
      } else {
        flashMessage(data?.message || error?.message || 'Failed to create subcategory', 'error');
      }
    } catch (err: any) {
      flashMessage(err.message, 'error');
    } finally {
      setSubcatSubmitting(false);
    }
  };

  // Moderator: Submit Top-Level Category Request
  const handleSubmitCategoryRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqCatName.trim() || !reqCatReason.trim()) {
      flashMessage('Category name and business reason are required.', 'error');
      return;
    }

    try {
      setReqSubmitting(true);
      const { data, error } = await api.submitCategoryRequest({
        name: reqCatName.trim(),
        reason: reqCatReason.trim(),
        icon: reqSelectedIcon,
      });
      if (data?.success) {
        flashMessage(data.message || 'Request submitted successfully! Awaiting Super Admin approval.');
        setReqCatName('');
        setReqCatReason('');
        setReqSelectedIcon('Package');
        fetchData();
      } else {
        flashMessage(data?.message || error?.message || 'Failed to submit request', 'error');
      }
    } catch (err: any) {
      flashMessage(err.message, 'error');
    } finally {
      setReqSubmitting(false);
    }
  };

  // Super Admin: Direct Create Top-Level Category
  const handleCreateTopLevelDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqCatName.trim()) {
      flashMessage('Category name is required.', 'error');
      return;
    }

    try {
      setReqSubmitting(true);
      const { data, error } = await api.createTopLevelCategory({
        name: reqCatName.trim(),
        description: reqCatReason.trim() || reqCatName.trim(),
        icon: reqSelectedIcon,
      });
      if (data?.success) {
        flashMessage(data.message || 'Top-level category vertical created and published live!');
        setReqCatName('');
        setReqCatReason('');
        setReqSelectedIcon('Package');
        fetchData();
      } else {
        flashMessage(data?.message || error?.message || 'Failed to create top-level category', 'error');
      }
    } catch (err: any) {
      flashMessage(err.message, 'error');
    } finally {
      setReqSubmitting(false);
    }
  };

  const handleEditCategory = async (catId: string, newName: string, newIcon?: string) => {
    if (!newName || !newName.trim()) return;
    try {
      const { data, error } = await api.updateCategory(catId, { name: newName.trim(), icon: newIcon });
      if (data?.success) {
        flashMessage(data.message || `Category updated to "${newName.trim()}".`);
        fetchData();
      } else {
        const errMsg = data?.message || error?.message || 'Failed to update category';
        flashMessage(errMsg, 'error');
        throw new Error(errMsg);
      }
    } catch (err: any) {
      flashMessage(err.message || 'Failed to update category', 'error');
      throw err;
    }
  };

  const handleDeleteCategory = async (catId: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;
    try {
      const { data, error } = await api.deleteCategory(catId);
      if (data?.success) {
        flashMessage(data.message || 'Category deleted.');
        fetchData();
      } else {
        flashMessage(data?.message || error?.message || 'Failed to delete category', 'error');
      }
    } catch (err: any) {
      flashMessage(err.message, 'error');
    }
  };



  // Admin: Approve or Reject Category Request
  const handleCategoryRequestAction = async (requestId: string, action: 'APPROVE' | 'REJECT', rejectionReason?: string) => {
    try {
      const { data, error } = await api.handleCategoryRequestAction(requestId, action, rejectionReason);
      if (data?.success) {
        flashMessage(data.message || `Category request ${action.toLowerCase()}d successfully.`);
        fetchData();
      } else {
        flashMessage(data?.message || error?.message || 'Action failed', 'error');
      }
    } catch (err: any) {
      flashMessage(err.message, 'error');
    }
  };

  const toggleCategoryExpand = (id: string) => {
    setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredListings = listings.filter((l) => {
    if (listingTab === 'pending') return l.status === 'PENDING_APPROVAL' || l.status === 'Pending approval';
    if (listingTab === 'flagged') return l.status === 'FLAGGED' || l.status.includes('Flagged');
    if (listingTab === 'published') return l.status === 'PUBLISHED' || l.status === 'Published';
    return true;
  });

  const pendingCategoryRequests = categoryRequests.filter((r) => r.status === 'PENDING');
  const pastCategoryRequests = categoryRequests.filter((r) => r.status !== 'PENDING');

  return (
    <div className="space-y-8 pb-12">
      {/* Toast Notification Alert (Fixed Z-100 Visible in Normal & Full-Screen Modal) */}
      {actionMessage && (
        <div
          className={`fixed top-5 right-5 z-[100] p-4 max-w-md rounded-lg shadow-xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-200 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 size={20} className="text-emerald-300 shrink-0" />
          ) : (
            <AlertTriangle size={20} className="text-rose-300 shrink-0" />
          )}
          <div className="flex-1">
            <p className="f-mono text-[10px] uppercase font-bold tracking-wider opacity-80 mb-0.5">
              {actionMessage.type === 'success' ? 'System Notification' : 'Validation Error'}
            </p>
            <p className="f-body text-xs font-semibold">{actionMessage.text}</p>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-stone-300 hover:text-white text-xs font-mono p-1 rounded"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header & Role Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <h1 className="f-display text-2xl font-semibold text-stone-900">Listings & Category Management Desk</h1>
          <p className="f-body text-stone-500 mt-1 text-sm">
            Approve wholesale products, enforce commercial policy rules, and maintain the two-tier category system.
          </p>
        </div>

        {/* Role Display Badge */}
        <div
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg border shrink-0 ${
            userStaffRole === 'SUPER_ADMIN'
              ? 'bg-amber-50 border-amber-200 text-amber-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          {userStaffRole === 'SUPER_ADMIN' ? (
            <ShieldCheck size={18} className="text-amber-700" />
          ) : (
            <UserCheck size={18} className="text-emerald-800" />
          )}
          <div className="flex flex-col">
            <span className="f-mono text-[10px] uppercase font-bold text-stone-500">Authenticated Role</span>
            <span className="f-body text-xs font-bold">
              {userStaffRole === 'SUPER_ADMIN' ? 'Super Admin' : 'Listings Moderator (Desk)'}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Role Banner */}
      <div
        className={`p-4 rounded-lg border flex items-start gap-3.5 ${
          userStaffRole === 'SUPER_ADMIN'
            ? 'bg-amber-950/5 border-amber-800/30 text-amber-950'
            : 'bg-emerald-950/5 border-emerald-800/30 text-emerald-950'
        }`}
      >
        <div
          className={`p-2 rounded ${
            userStaffRole === 'SUPER_ADMIN' ? 'bg-amber-700 text-white' : 'bg-emerald-800 text-white'
          }`}
        >
          {userStaffRole === 'SUPER_ADMIN' ? <ShieldCheck size={18} /> : <UserCheck size={18} />}
        </div>
        <div className="flex-1 text-xs leading-relaxed space-y-1">
          <p className="font-bold text-sm">
            Active Mode: {userStaffRole === 'SUPER_ADMIN' ? 'Super Admin Operational Console' : 'Listings Moderator Desk'}
          </p>
          {userStaffRole === 'SUPER_ADMIN' ? (
            <p className="text-stone-600">
              <span className="font-semibold text-amber-900">Capabilities:</span> Full platform administrative authority. Review and approve/reject pending top-level category requests from moderators, manage global fee policies, and oversee catalog integrity.
            </p>
          ) : (
            <p className="text-stone-600">
              <span className="font-semibold text-emerald-900">Capabilities:</span> Approve new listings, flag policy violations, request seller fixes, bulk-remove seller items, and add subcategories instantly. <br />
              <span className="font-semibold text-rose-800">Restrictions:</span> Cannot silently edit seller prices/MOQs. New top-level verticals require Super Admin request submission & approval.
            </p>
          )}
        </div>
      </div>

      {/* SECTION 1: LISTINGS MODERATION TABLE */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="f-display text-lg font-semibold text-stone-900 flex items-center gap-2">
            <Package size={20} className="text-emerald-800" /> Product Listings Moderation Queue
          </h2>
          <span className="f-mono text-xs text-stone-500">Total Listings: {listings.length}</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-stone-200">
          {[
            ['all', 'All listings'],
            ['pending', `Pending approval · ${listings.filter((l) => l.status === 'PENDING_APPROVAL' || l.status === 'Pending approval').length}`],
            ['flagged', `Reported / Flagged · ${listings.filter((l) => l.status === 'FLAGGED' || l.status.includes('Flagged')).length}`],
            ['published', 'Published'],
          ].map(([k, l]) => (
            <button
              key={k}
              onClick={() => setListingTab(k as any)}
              className={`f-body text-sm font-medium px-4 py-2.5 border-b-2 cursor-pointer transition-colors ${
                listingTab === k
                  ? 'border-emerald-800 text-emerald-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        {/* Listings Table */}
        <div className="bg-white border border-stone-200 overflow-hidden shadow-sm rounded-lg">
          {loadingListings ? (
            <p className="f-body text-sm text-stone-400 p-8">Loading product listings...</p>
          ) : filteredListings.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
                <Package size={24} />
              </div>
              <h3 className="f-display text-base font-semibold text-stone-900">No listings in queue</h3>
              <p className="f-body text-xs text-stone-500 max-w-sm mx-auto">
                There are currently no wholesale product listings matching this status filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[480px] sm:max-h-[520px] overflow-y-auto border-t border-stone-200">
              <table className="w-full text-left min-w-[900px] border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200 sticky top-0 z-10 shadow-2xs">
                  <tr>
                    <Th>Product Item</Th>
                    <Th>Category</Th>
                    <Th>Seller Enterprise</Th>
                    <Th>Price / Unit</Th>
                    <Th>MOQ</Th>
                    <Th>B2B Photos Audit</Th>
                    <Th>Status</Th>
                    <Th right>Moderation Actions</Th>
                  </tr>
                </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredListings.map((item) => {
                  const imgCount = item.images && Array.isArray(item.images) ? item.images.length : (item.image ? 1 : 0);
                  const isPhotoPassing = imgCount >= 3;
                  return (
                    <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                      <Td>
                        <div className="flex items-center gap-3">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              onClick={() => {
                                setPreviewModalListing(item);
                                setSelectedPreviewImgIdx(0);
                              }}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              title="Click to view full image & marketplace card preview"
                            />
                          ) : item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              onClick={() => {
                                setPreviewModalListing(item);
                                setSelectedPreviewImgIdx(0);
                              }}
                              className="w-10 h-10 object-cover rounded-lg border border-stone-200 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                              title="Click to view full image & marketplace card preview"
                            />
                          ) : (
                            <div
                              onClick={() => {
                                setPreviewModalListing(item);
                                setSelectedPreviewImgIdx(0);
                              }}
                              className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0 cursor-pointer hover:bg-stone-200"
                              title="Click to preview marketplace card"
                            >
                              <Package className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span
                              onClick={() => {
                                setPreviewModalListing(item);
                                setSelectedPreviewImgIdx(0);
                              }}
                              className="f-body text-sm font-semibold text-stone-900 truncate hover:text-emerald-800 cursor-pointer underline decoration-dotted underline-offset-2"
                              title="Click to preview marketplace card & audit photos"
                            >
                              {item.name}
                            </span>
                            <span className="f-mono text-[10px] text-stone-400 truncate">ID: {item.id}</span>
                          </div>
                        </div>
                      </Td>
                      <Td>
                        <span className="f-mono text-xs text-stone-600">{item.categoryName || item.cat}</span>
                      </Td>
                      <Td>
                        <div className="flex flex-col">
                          <span className="f-body text-xs text-stone-800 font-medium">{item.seller}</span>
                          {item.sellerBusinessId && (
                            <button
                              onClick={() => {
                                if (confirm(`Bulk-remove all listings from seller "${item.seller}" due to account ban/policy violation?`)) {
                                  handleListingAction(item.sellerBusinessId!, 'BULK_REMOVE_SELLER');
                                }
                              }}
                              className="text-[10px] text-rose-600 hover:text-rose-800 underline font-mono text-left mt-0.5"
                              title="Bulk remove all listings from this seller"
                            >
                              [Bulk remove seller]
                            </button>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <div className="flex items-center gap-1">
                          <span className="f-mono text-xs font-semibold text-stone-900">{item.price}</span>
                          <span className="text-[10px] text-stone-400" title="Commercial terms cannot be edited silently by moderators">
                            🔒
                          </span>
                        </div>
                      </Td>
                      <Td>
                        <span className="f-mono text-xs text-stone-600">{item.moq}</span>
                      </Td>
                      <Td>
                        <div
                          onClick={() => {
                            setPreviewModalListing(item);
                            setSelectedPreviewImgIdx(0);
                          }}
                          className="flex flex-col gap-1 cursor-pointer group"
                          title="Click to inspect uploaded high-res photos & marketplace card preview"
                        >
                          <div className="flex items-center gap-1 overflow-x-auto max-w-[140px]">
                            {(item.images && item.images.length > 0 ? item.images : item.image ? [item.image] : []).map((imgUrl, iIdx) => (
                              <img
                                key={iIdx}
                                src={imgUrl}
                                alt={`Photo ${iIdx + 1}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewModalListing(item);
                                  setSelectedPreviewImgIdx(iIdx);
                                }}
                                className="w-7 h-7 object-cover rounded border border-stone-200 shrink-0 group-hover:border-emerald-600 transition-colors"
                              />
                            ))}
                          </div>
                          {imgCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-900 bg-emerald-100 group-hover:bg-emerald-200 border border-emerald-300 px-1.5 py-0.5 rounded shadow-2xs w-max transition-colors">
                              ✓ {imgCount} Uploaded Photo{imgCount > 1 ? 's' : ''} · View
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-900 bg-amber-100 group-hover:bg-amber-200 border border-amber-300 px-1.5 py-0.5 rounded shadow-2xs w-max transition-colors">
                              📷 No Photos Uploaded
                            </span>
                          )}
                        </div>
                      </Td>
                      <Td>
                        <Seal
                          label={item.status}
                          tone={
                            item.status === 'PUBLISHED' || item.status === 'Published'
                              ? 'emerald'
                              : item.status === 'FLAGGED' || item.status === 'REJECTED'
                              ? 'rose'
                              : item.status === 'FIX_REQUESTED'
                              ? 'blue'
                              : 'amber'
                          }
                        />
                      </Td>
                      <Td right>
                        <div className="flex justify-end gap-1.5">
                          <Btn
                            onClick={() => {
                              setPreviewModalListing(item);
                              setSelectedPreviewImgIdx(0);
                            }}
                          >
                            <span className="inline-flex items-center gap-1">
                              <Eye size={13} className="text-emerald-700" /> Preview
                            </span>
                          </Btn>
                          {item.status !== 'PUBLISHED' && (
                            <Btn tone="emerald" filled onClick={() => handleListingAction(item.id, 'APPROVE')}>
                              Approve
                            </Btn>
                          )}
                          <Btn
                            tone="amber"
                            onClick={() => {
                              setFixModalListing(item);
                              setFixNote('');
                            }}
                          >
                            Ask Fix
                          </Btn>
                          {item.status !== 'FLAGGED' && (
                            <Btn tone="rose" onClick={() => handleListingAction(item.id, 'FLAG')}>
                              Flag Policy
                            </Btn>
                          )}
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        </div>
      </div>

      {/* Product Image Audit & Marketplace Card Preview Modal */}
      {previewModalListing && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-stone-300 shadow-2xl max-w-4xl w-full rounded-xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between border-b border-stone-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-950 border border-emerald-700/50 rounded-lg text-emerald-400">
                  <Eye size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="f-display font-semibold text-lg text-white">{previewModalListing.name}</h3>
                    <Seal
                      label={previewModalListing.status}
                      tone={
                        previewModalListing.status === 'PUBLISHED' || previewModalListing.status === 'Published'
                          ? 'emerald'
                          : previewModalListing.status === 'FLAGGED' || previewModalListing.status === 'REJECTED'
                          ? 'rose'
                          : 'amber'
                      }
                    />
                  </div>
                  <p className="f-body text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                    <span>
                      Category: <strong className="text-stone-200">{previewModalListing.categoryName || previewModalListing.cat}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Seller: <strong className="text-emerald-400">{previewModalListing.seller}</strong>
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModalListing(null)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-stone-50/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: High-Res Photo Audit Viewer */}
                <div className="space-y-4 bg-white p-4 border border-stone-200 rounded-lg shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                      <h4 className="f-mono text-xs uppercase font-bold text-stone-800 flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-emerald-700" /> B2B High-Res Photo Audit
                      </h4>
                      <span className="f-mono text-[10px] text-stone-500">
                        {selectedPreviewImgIdx + 1} of {previewModalListing.images?.length || (previewModalListing.image ? 1 : 0)} photos
                      </span>
                    </div>

                    {/* Main Full-Size Image Frame */}
                    <div className="relative aspect-4/3 bg-stone-900 rounded-lg overflow-hidden border border-stone-300 flex items-center justify-center">
                      {previewModalListing.images && previewModalListing.images.length > 0 ? (
                        <img
                          src={previewModalListing.images[selectedPreviewImgIdx] || previewModalListing.images[0]}
                          alt="Product preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : previewModalListing.image ? (
                        <img
                          src={previewModalListing.image}
                          alt="Product preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-center p-8 text-stone-500 space-y-2">
                          <Package size={48} className="mx-auto text-stone-600" />
                          <p className="f-body text-xs">No photos uploaded for this listing</p>
                        </div>
                      )}
                    </div>

                    {/* Image Selector Strip */}
                    {previewModalListing.images && previewModalListing.images.length > 1 && (
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                        {previewModalListing.images.map((imgUrl, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSelectedPreviewImgIdx(idx)}
                            className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                              selectedPreviewImgIdx === idx
                                ? 'border-emerald-600 ring-2 ring-emerald-600/20 scale-105'
                                : 'border-stone-200 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={imgUrl} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 bg-stone-50 p-2.5 rounded text-[11px] text-stone-600 space-y-1 f-body">
                    <p className="font-semibold text-stone-800">📸 Quality Audit Checklist:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-stone-500">
                      <li>Check for watermarks, seller contact details or phone numbers in photo</li>
                      <li>Verify photo represents actual wholesale product specs</li>
                      <li>Confirm photo resolution and lighting meet B2B catalog standards</li>
                    </ul>
                  </div>
                </div>

                {/* Right Column: Marketplace Product Card Preview */}
                <div className="space-y-4 bg-white p-4 border border-stone-200 rounded-lg shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                      <h4 className="f-mono text-xs uppercase font-bold text-stone-800 flex items-center gap-1.5">
                        <Package size={16} className="text-emerald-700" /> Marketplace Card Preview
                      </h4>
                      <span className="f-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        Buyer View Live Replica
                      </span>
                    </div>

                    {/* Live Rendered Product Card */}
                    <div className="max-w-sm mx-auto shadow-md rounded-xl overflow-hidden border border-stone-200 transform scale-95 sm:scale-100 transition-transform">
                      <ProductCard product={mapListingToProduct(previewModalListing)} />
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-emerald-50/60 border border-emerald-200/80 rounded-lg text-xs space-y-1 text-emerald-950">
                    <p className="font-semibold flex items-center gap-1">
                      <CheckCircle2 size={14} className="text-emerald-700" /> Catalog Quality Standard
                    </p>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      Approving will immediately publish this card onto the public marketplace for wholesale buyers across Ethiopia.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer / Action Toolbar */}
            <div className="bg-stone-100 px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="f-mono text-xs text-stone-500">Listing Price:</span>
                <span className="f-mono text-sm font-bold text-stone-900">{previewModalListing.price}</span>
                <span className="f-mono text-xs text-stone-400">|</span>
                <span className="f-mono text-xs text-stone-500">MOQ:</span>
                <span className="f-mono text-xs font-semibold text-stone-800">{previewModalListing.moq}</span>
              </div>

              <div className="flex items-center gap-2">
                <Btn onClick={() => setPreviewModalListing(null)}>Close Preview</Btn>

                <Btn
                  tone="amber"
                  onClick={() => {
                    const item = previewModalListing;
                    setPreviewModalListing(null);
                    setFixModalListing(item);
                    setFixNote('');
                  }}
                >
                  Ask Fix
                </Btn>

                {previewModalListing.status !== 'FLAGGED' && (
                  <Btn
                    tone="rose"
                    onClick={() => {
                      const id = previewModalListing.id;
                      setPreviewModalListing(null);
                      handleListingAction(id, 'FLAG');
                    }}
                  >
                    Flag Policy
                  </Btn>
                )}

                {previewModalListing.status !== 'PUBLISHED' && (
                  <Btn
                    tone="emerald"
                    filled
                    onClick={() => {
                      const id = previewModalListing.id;
                      setPreviewModalListing(null);
                      handleListingAction(id, 'APPROVE');
                    }}
                  >
                    Approve &amp; Publish Listing
                  </Btn>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Request Fix Modal */}
      {fixModalListing && (
        <div className="fixed inset-0 bg-stone-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-stone-200 shadow-xl max-w-md w-full p-6 space-y-4 rounded-lg">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="f-display font-semibold text-stone-900 flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-600" /> Ask Seller to Fix Listing
              </h3>
              <button onClick={() => setFixModalListing(null)} className="text-stone-400 hover:text-stone-600">
                ✕
              </button>
            </div>
            <p className="f-body text-xs text-stone-600">
              Listing: <span className="font-semibold text-stone-900">{fixModalListing.name}</span> (<span className="f-mono">{fixModalListing.seller}</span>)
            </p>
            <div>
              <label className="f-body text-xs font-semibold text-stone-700 block mb-1">
                Required Change / Correction Note for Seller:
              </label>
              <textarea
                value={fixNote}
                onChange={(e) => setFixNote(e.target.value)}
                placeholder="e.g. Please update category from Construction to Plumbing, or provide missing ISO quality certificate..."
                rows={3}
                className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-emerald-800"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Btn onClick={() => setFixModalListing(null)}>Cancel</Btn>
              <Btn
                tone="emerald"
                filled
                onClick={() => handleListingAction(fixModalListing.id, 'REQUEST_FIX', fixNote)}
              >
                Send Fix Request
              </Btn>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: CATEGORIES TWO-TIER MANAGEMENT SYSTEM */}
      <div className="pt-6 border-t border-stone-200 space-y-6">
        <div>
          <h2 className="f-display text-xl font-semibold text-stone-900 flex items-center gap-2">
            <FolderTree size={22} className="text-emerald-800" /> B2B Category Tree & Request System
          </h2>
          <p className="f-body text-xs text-stone-500 mt-1">
            Two-tier architecture: Subcategories can be added instantly by anyone with Listings access. Top-level verticals require Super Admin approval.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT COLUMN: LIVE CATEGORY TREE & INSTANT SUBCATEGORY ADDITION */}
          <div className="bg-white border border-stone-200 p-6 space-y-5 rounded-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h3 className="f-display text-base font-semibold text-stone-900 flex items-center gap-2">
                  <Layers size={18} className="text-emerald-700" /> Live Category Tree
                </h3>
                <p className="f-body text-xs text-stone-500">Top-level verticals with active subcategories</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsTreeFullScreen(true)}
                  className="f-mono text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-800 px-2.5 py-1 rounded border border-stone-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  title="Expand Full-Screen Taxonomy Inspector"
                >
                  <Maximize2 size={12} className="text-stone-700" /> Full-Screen Inspector
                </button>
                <span className="f-mono text-[10px] bg-emerald-50 text-emerald-800 px-2.5 py-1 border border-emerald-200 font-semibold">
                  {categories.length} Verticals
                </span>
              </div>
            </div>

            {/* Instant Subcategory Creation Form */}
            <form onSubmit={handleCreateSubcategory} className="bg-stone-50 border border-stone-200 p-3.5 rounded space-y-3">
              <p className="f-body text-xs font-semibold text-stone-800 flex items-center gap-1.5">
                <Plus size={14} className="text-emerald-700" /> Instant Subcategory Addition
                <span className="f-mono text-[9px] bg-emerald-100 text-emerald-900 px-1.5 py-0.5 rounded font-normal">
                  No approval needed
                </span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">Target Parent Category</label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded text-stone-900 font-medium focus:outline-none focus:border-emerald-800"
                  >
                    {flatCategories.length === 0 ? (
                      <option value="">No parent categories available</option>
                    ) : (
                      flatCategories
                        .filter((c: any) => (c.level || 1) < 4)
                        .map((c: any) => {
                          const lvl = c.level || 1;
                          const indent = lvl === 1 ? '' : lvl === 2 ? '  ↳ ' : '    ↳ ';
                          const tag = lvl === 1 ? 'Vertical' : lvl === 2 ? 'Category' : 'Subcategory';
                          return (
                            <option key={c.id} value={c.id}>
                              {indent}Level {lvl} ({tag}): {c.name}
                            </option>
                          );
                        })
                    )}
                  </select>
                </div>
                <div>
                  <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">Subcategory Name</label>
                  <input
                    type="text"
                    value={subcatName}
                    onChange={(e) => setSubcatName(e.target.value)}
                    placeholder="e.g. Solar Accessories"
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-emerald-800"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={subcatSubmitting}
                  className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} /> Add Subcategory Instantly
                </button>
              </div>
            </form>

            {/* Tree View */}
            {loadingCategories ? (
              <p className="f-body text-xs text-stone-400">Loading categories hierarchy...</p>
            ) : categories.length === 0 ? (
              <p className="f-body text-xs text-stone-500">No categories found.</p>
            ) : (
              <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <CategoryTreeNode
                    key={cat.id}
                    node={cat}
                    expandedMap={expandedCategories}
                    onToggleExpand={toggleCategoryExpand}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategory}
                  />
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: NEW TOP-LEVEL CATEGORY (MODERATOR REQUEST VS ADMIN APPROVAL QUEUE) */}
          <div className="bg-white border border-stone-200 p-6 space-y-5 rounded-lg shadow-sm flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div>
                  <h3 className="f-display text-base font-semibold text-stone-900 flex items-center gap-2">
                    <ShieldCheck
                      size={18}
                      className={viewRole === 'LISTINGS_MODERATOR' ? 'text-emerald-700' : 'text-amber-700'}
                    />
                    New Top-Level Category Management
                  </h3>
                  <p className="f-body text-xs text-stone-500">
                    {viewRole === 'LISTINGS_MODERATOR'
                      ? 'Submit request for a new vertical (Requires Admin Approval)'
                      : 'Super Admin: Instantly Create Vertical or Approve Requests'}
                  </p>
                </div>
                <span
                  className={`f-mono text-[10px] px-2.5 py-1 font-semibold uppercase ${
                    viewRole === 'LISTINGS_MODERATOR'
                      ? 'bg-stone-100 text-stone-800 border border-stone-300'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}
                >
                  {viewRole === 'LISTINGS_MODERATOR' ? 'Moderator Mode' : 'Admin Mode'}
                </span>
              </div>

              {/* WHY TOP LEVEL CATEGORIES NEED ADMIN APPROVAL NOTICE */}
              <div className="bg-stone-50 border border-stone-200 p-3 rounded text-xs space-y-1">
                <p className="font-semibold text-stone-800 flex items-center gap-1.5">
                  <Info size={14} className="text-amber-600" /> Two-Tier Governance Rule
                </p>
                <p className="text-stone-600 text-[11px] leading-relaxed">
                  A new top-level vertical can quietly require different verification documents, different fee handling tiers, or different fraud risk policies — decisions reserved exclusively for Super Admin authority.
                </p>
              </div>

              {/* VIEW MODE 1: LISTINGS MODERATOR REQUEST FORM */}
              {viewRole === 'LISTINGS_MODERATOR' ? (
                <div className="space-y-4">
                  <form onSubmit={handleSubmitCategoryRequest} className="space-y-3 bg-stone-50/70 p-4 border border-stone-200 rounded">
                    <p className="f-body text-xs font-semibold text-stone-900">Request New Top-Level Vertical</p>
                    <div>
                      <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={reqCatName}
                        onChange={(e) => setReqCatName(e.target.value)}
                        placeholder="e.g. Medical Supplies & Healthcare"
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">
                        Business Justification / Reason *
                      </label>
                      <textarea
                        value={reqCatReason}
                        onChange={(e) => setReqCatReason(e.target.value)}
                        placeholder="Explain why a new top-level vertical is needed instead of a subcategory under an existing vertical..."
                        rows={3}
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-emerald-800"
                      />
                    </div>
                    <CuratedIconPicker
                      selectedIcon={reqSelectedIcon}
                      onSelectIcon={setReqSelectedIcon}
                      label="Category Icon"
                    />
                    <button
                      type="submit"
                      disabled={reqSubmitting}
                      className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Send size={14} /> Submit Category Request for Admin Approval
                    </button>
                  </form>

                  {/* Moderator Submitted Requests Log */}
                  <div className="space-y-2">
                    <p className="f-mono text-[10px] uppercase text-stone-500 font-semibold">Your Submitted Requests Log</p>
                    {categoryRequests.length === 0 ? (
                      <p className="f-body text-xs text-stone-400 italic">No submitted requests recorded yet.</p>
                    ) : (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                        {categoryRequests.map((req) => (
                          <div key={req.id} className="p-2.5 bg-stone-50 border border-stone-200 rounded flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <RenderCategoryIcon iconName={req.icon} name={req.name} className="w-4 h-4 text-emerald-800 shrink-0" />
                              <div>
                                <p className="font-semibold text-stone-900">{req.name}</p>
                                <p className="text-[10px] text-stone-500 truncate max-w-xs">{req.reason}</p>
                              </div>
                            </div>
                            <Seal
                              label={req.status}
                              tone={req.status === 'APPROVED' ? 'emerald' : req.status === 'REJECTED' ? 'rose' : 'amber'}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* VIEW MODE 2: SUPER ADMIN CREATION & APPROVAL QUEUE */
                <div className="space-y-5">
                  {/* Direct Super Admin Vertical Creation Form */}
                  <form onSubmit={handleCreateTopLevelDirect} className="space-y-3 bg-amber-50/70 p-4 border border-amber-200 rounded">
                    <p className="f-body text-xs font-semibold text-amber-950 flex items-center gap-1.5">
                      <Plus size={14} className="text-amber-800" /> Create Top-Level Vertical Instantly (Super Admin)
                    </p>
                    <div>
                      <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">
                        Category Name *
                      </label>
                      <input
                        type="text"
                        value={reqCatName}
                        onChange={(e) => setReqCatName(e.target.value)}
                        placeholder="e.g. Medical Supplies & Healthcare"
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-amber-800"
                      />
                    </div>
                    <div>
                      <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">
                        Description / Policy Notes
                      </label>
                      <input
                        type="text"
                        value={reqCatReason}
                        onChange={(e) => setReqCatReason(e.target.value)}
                        placeholder="e.g. B2B Wholesale Medical & Pharmaceutical Equipment"
                        className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-500 placeholder:font-normal focus:outline-none focus:border-amber-800"
                      />
                    </div>
                    <CuratedIconPicker
                      selectedIcon={reqSelectedIcon}
                      onSelectIcon={setReqSelectedIcon}
                      label="Category Icon"
                    />
                    <button
                      type="submit"
                      disabled={reqSubmitting}
                      className="w-full py-2 bg-amber-800 hover:bg-amber-900 text-white text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      <Plus size={14} /> Create Vertical Instantly
                    </button>
                  </form>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="f-mono text-[10px] uppercase text-stone-500 font-semibold">
                          Pending Approval Requests ({pendingCategoryRequests.length})
                        </p>
                      </div>

                      {loadingRequests ? (
                        <p className="f-body text-xs text-stone-400">Loading pending requests...</p>
                      ) : pendingCategoryRequests.length === 0 ? (
                        <div className="p-6 text-center bg-stone-50 border border-dashed border-stone-200 rounded space-y-1">
                          <CheckCircle2 size={20} className="text-emerald-700 mx-auto" />
                          <p className="f-body text-xs font-semibold text-stone-800">No pending category requests</p>
                          <p className="f-body text-[11px] text-stone-500">All submitted top-level categories have been reviewed.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
                          {pendingCategoryRequests.map((req) => (
                            <div key={req.id} className="p-3 bg-amber-50/50 border border-amber-200 rounded space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                  <RenderCategoryIcon iconName={req.icon} name={req.name} className="w-5 h-5 text-amber-800 shrink-0" />
                                  <div>
                                    <span className="f-body text-xs font-bold text-stone-900">{req.name}</span>
                                    <p className="f-mono text-[10px] text-stone-500">
                                      Requested by {req.requestedByName} · {req.createdAt}
                                    </p>
                                  </div>
                                </div>
                                <Seal label="PENDING ADMIN" tone="amber" />
                              </div>
                              <p className="f-body text-xs text-stone-700 bg-white p-2 border border-amber-100 rounded">
                                "{req.reason}"
                              </p>
                              <div className="flex justify-end gap-2 pt-1">
                                <button
                                  onClick={() => {
                                    const reason = prompt('Rejection reason (optional):');
                                    if (reason !== null) handleCategoryRequestAction(req.id, 'REJECT', reason);
                                  }}
                                  className="px-3 py-1 bg-stone-200 hover:bg-rose-100 hover:text-rose-800 text-stone-700 text-xs font-semibold rounded transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleCategoryRequestAction(req.id, 'APPROVE')}
                                  className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded flex items-center gap-1 transition-colors cursor-pointer shadow-sm"
                                >
                                  <CheckCircle2 size={13} /> Approve & Publish
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Past Processed Category Requests Log */}
                    {pastCategoryRequests.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-stone-200">
                        <p className="f-mono text-[10px] uppercase text-stone-500 font-semibold">Reviewed History Log</p>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {pastCategoryRequests.map((req) => (
                            <div key={req.id} className="p-2 bg-stone-50 border border-stone-200 rounded flex items-center justify-between text-xs">
                              <div>
                                <p className="font-semibold text-stone-900">{req.name}</p>
                                <p className="text-[10px] text-stone-500">Reviewed by {req.reviewedByName || 'Admin'}</p>
                              </div>
                              <Seal label={req.status} tone={req.status === 'APPROVED' ? 'emerald' : 'rose'} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* FULL-SCREEN TAXONOMY INSPECTOR MODAL */}
      {isTreeFullScreen && (
        <div className="fixed inset-0 bg-stone-950/75 backdrop-blur-md z-50 flex flex-col p-4 sm:p-6 overflow-hidden">
          <div className="bg-white border border-stone-200 rounded-xl shadow-2xl flex-1 flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-50 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="f-display text-lg sm:text-xl font-bold text-stone-900 flex items-center gap-2">
                  <FolderTree size={22} className="text-emerald-800" /> Full-Screen B2B Taxonomy Inspector
                </h2>
                <p className="f-body text-xs text-stone-500">
                  Inspect and manage multi-level industry verticals, categories, subcategories, and leaf item groups.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="text"
                    value={treeSearchQuery}
                    onChange={(e) => setTreeSearchQuery(e.target.value)}
                    placeholder="Filter category tree..."
                    className="text-xs pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-800 w-48 sm:w-64"
                  />
                </div>

                {/* Expand / Collapse All */}
                <button
                  onClick={handleExpandAllNodes}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Expand all tree nodes"
                >
                  <UnfoldVertical size={13} /> Expand All
                </button>
                <button
                  onClick={handleCollapseAllNodes}
                  className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Collapse all tree nodes"
                >
                  <FoldVertical size={13} /> Collapse All
                </button>

                {/* Close Modal */}
                <button
                  onClick={() => setIsTreeFullScreen(false)}
                  className="p-1.5 bg-stone-200 hover:bg-rose-100 hover:text-rose-800 text-stone-700 rounded transition-colors cursor-pointer"
                  title="Close Full-Screen Inspector"
                >
                  <Minimize2 size={16} />
                </button>
              </div>
            </div>

            {/* Metrics Summary Bar */}
            <div className="bg-emerald-900 text-white p-3 px-6 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-6 font-mono">
                <span>Total Verticals (L1): <strong className="text-amber-300">{categories.length}</strong></span>
                <span>Total Categories (L2): <strong className="text-emerald-300">{flatCategories.filter(c => (c.level || 1) === 2).length}</strong></span>
                <span>Total Subcategories (L3): <strong className="text-sky-300">{flatCategories.filter(c => (c.level || 1) === 3).length}</strong></span>
                <span>Total Leaf Categories (Ready for Products): <strong className="text-purple-300">{flatCategories.filter(c => Boolean(c.isLeaf)).length}</strong></span>
              </div>
              <span className="text-stone-300 text-[11px]">System Status: Live 4-Tier Hierarchy Active</span>
            </div>

            {/* Full-Screen Category Creation Bar */}
            <div className="bg-stone-50 p-3.5 px-6 border-b border-stone-200 shadow-2xs">
              <form onSubmit={handleCreateSubcategory} className="flex flex-wrap items-end gap-3">
                <div className="flex-1 min-w-[220px]">
                  <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">Target Parent Category</label>
                  <select
                    value={selectedParentId}
                    onChange={(e) => setSelectedParentId(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded text-stone-900 font-medium focus:outline-none focus:border-emerald-800"
                  >
                    {flatCategories.length === 0 ? (
                      <option value="">No parent categories available</option>
                    ) : (
                      flatCategories
                        .filter((c: any) => (c.level || 1) < 4)
                        .map((c: any) => {
                          const lvl = c.level || 1;
                          const indent = lvl === 1 ? '' : lvl === 2 ? '  ↳ ' : '    ↳ ';
                          const tag = lvl === 1 ? 'Vertical' : lvl === 2 ? 'Category' : 'Subcategory';
                          return (
                            <option key={c.id} value={c.id}>
                              {indent}Level {lvl} ({tag}): {c.name}
                            </option>
                          );
                        })
                    )}
                  </select>
                </div>
                <div className="flex-1 min-w-[220px]">
                  <label className="f-mono text-[10px] uppercase text-stone-500 block mb-1">Subcategory Name</label>
                  <input
                    type="text"
                    value={subcatName}
                    onChange={(e) => setSubcatName(e.target.value)}
                    placeholder="e.g. Grade 1 Washed Yirgacheffe"
                    className="w-full text-xs p-2 bg-white border border-stone-300 rounded text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:border-emerald-800"
                  />
                </div>
                <button
                  type="submit"
                  disabled={subcatSubmitting}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus size={14} /> Add Subcategory Instantly
                </button>
              </form>
            </div>

            {/* Tree Workspace Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-stone-100/50 space-y-3">
              {loadingCategories ? (
                <p className="f-body text-xs text-stone-500">Loading taxonomy tree...</p>
              ) : categories.length === 0 ? (
                <p className="f-body text-xs text-stone-500">No categories found.</p>
              ) : (
                categories
                  .filter(cat =>
                    !treeSearchQuery.trim() ||
                    cat.name.toLowerCase().includes(treeSearchQuery.toLowerCase()) ||
                    JSON.stringify(cat.subcategories).toLowerCase().includes(treeSearchQuery.toLowerCase())
                  )
                  .map((cat) => (
                    <CategoryTreeNode
                      key={cat.id}
                      node={cat}
                      expandedMap={expandedCategories}
                      onToggleExpand={toggleCategoryExpand}
                      onEdit={handleEditCategory}
                      onDelete={handleDeleteCategory}
                    />
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
