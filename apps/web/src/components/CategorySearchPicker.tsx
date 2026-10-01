'use client';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ProductCategory } from '../types';
import { Search, ChevronDown, Check, Folder, Package, Layers, X, Tag, Info } from 'lucide-react';

interface CategorySearchPickerProps {
  categories: ProductCategory[];
  selectedCategoryId: string;
  onSelectCategory: (category: ProductCategory) => void;
  label?: string;
  error?: string;
}

interface FlatCategoryItem {
  category: ProductCategory;
  path: string[];
  depth: number;
  isLeaf: boolean;
}

export const CategorySearchPicker: React.FC<CategorySearchPickerProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  label,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten the category tree for search & selection with hierarchy paths
  const flatCategories = useMemo(() => {
    const result: FlatCategoryItem[] = [];

    const traverse = (nodes: ProductCategory[], currentPath: string[], depth: number) => {
      for (const node of nodes) {
        const path = [...currentPath, node.name];
        const isLeaf = !node.subcategories || node.subcategories.length === 0;

        result.push({
          category: node,
          path,
          depth,
          isLeaf,
        });

        if (node.subcategories && node.subcategories.length > 0) {
          traverse(node.subcategories, path, depth + 1);
        }
      }
    };

    traverse(categories, [], 0);
    return result;
  }, [categories]);

  // Find currently selected category item
  const selectedItem = useMemo(() => {
    if (!selectedCategoryId) return undefined;
    return flatCategories.find(item => item.category.id === selectedCategoryId);
  }, [flatCategories, selectedCategoryId]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return flatCategories;
    const query = searchQuery.toLowerCase().trim();
    return flatCategories.filter(
      item =>
        item.category.name.toLowerCase().includes(query) ||
        item.path.join(' > ').toLowerCase().includes(query) ||
        (item.category.description && item.category.description.toLowerCase().includes(query))
    );
  }, [flatCategories, searchQuery]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: FlatCategoryItem) => {
    onSelectCategory(item.category);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Label section */}
      <div className="flex items-center justify-between mb-1.5">
        <label className="block font-semibold text-[#1B2340] text-sm flex items-center gap-1.5">
          <span>{label || (selectedItem ? (selectedItem.isLeaf ? 'Product Category / Type *' : 'Category Group *') : 'Category *')}</span>
          {selectedItem && (
            selectedItem.isLeaf ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                <Package className="w-3 h-3 text-emerald-600" />
                <span>Product Type (Leaf)</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                <Folder className="w-3 h-3 text-amber-600" />
                <span>Category Group</span>
              </span>
            )
          )}
        </label>
      </div>

      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full px-3.5 py-2.5 bg-white border rounded-xl text-left flex items-center justify-between transition-all shadow-xs hover:border-[#C08829] cursor-pointer ${
          isOpen ? 'border-[#C08829] ring-2 ring-[#C08829]/20' : error ? 'border-rose-500' : 'border-[#E2E4EA]'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate pr-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              selectedItem?.isLeaf ? 'bg-emerald-100 text-emerald-800' : 'bg-[#1B2340]/5 text-[#1B2340]'
            }`}
          >
            {selectedItem?.isLeaf ? <Package className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
          </div>

          <div className="truncate">
            <div className="text-xs text-[#6B7280] font-medium truncate">
              {selectedItem?.path?.slice(0, -1).join(' › ') || 'Top Vertical'}
            </div>
            <div className="text-sm font-semibold text-[#1B2340] truncate flex items-center gap-1.5">
              <span>{selectedItem?.category?.name || 'Select Category'}</span>
            </div>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-[#6B7280] transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#C08829]' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white border border-[#E2E4EA] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Search Header */}
          <div className="p-2.5 bg-[#F8F9FA] border-b border-[#E2E4EA]">
            <div className="relative flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-[#6B7280]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search categories or product types..."
                autoFocus
                className="w-full pl-9 pr-8 py-2 bg-white border border-[#E2E4EA] rounded-xl text-xs text-[#1B2340] placeholder-[#9CA3AF] focus:outline-none focus:border-[#C08829] focus:ring-1 focus:ring-[#C08829]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-[#9CA3AF] hover:text-[#1B2340] p-0.5 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto p-1.5 space-y-1">
            {filteredItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#6B7280]">
                No matching category or product type found.
              </div>
            ) : (
              filteredItems.map(item => {
                const isSelected = item.category.id === selectedCategoryId;
                const indentClass =
                  item.depth === 0
                    ? 'pl-3 bg-[#F8F9FA]/70 font-bold border-t border-b border-[#E2E4EA]/60 mt-1 first:mt-0'
                    : item.depth === 1
                    ? 'pl-6 font-semibold'
                    : 'pl-9 font-medium';

                return (
                  <button
                    key={item.category.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`w-full text-left py-2 px-3 rounded-xl flex items-center justify-between transition-colors cursor-pointer group ${indentClass} ${
                      isSelected
                        ? 'bg-[#C08829]/10 text-[#C08829] border border-[#C08829]/30'
                        : 'hover:bg-[#F1F2F5] text-[#1B2340]'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="shrink-0 text-[#6B7280] group-hover:text-[#C08829]">
                        {item.isLeaf ? (
                          <Package className="w-3.5 h-3.5 text-emerald-600" />
                        ) : item.depth === 0 ? (
                          <Layers className="w-3.5 h-3.5 text-[#1B2340]" />
                        ) : (
                          <Folder className="w-3.5 h-3.5 text-amber-600" />
                        )}
                      </span>

                      <div className="truncate">
                        <div className="text-xs truncate flex items-center gap-1.5">
                          <span>{item.category.name}</span>
                          {item.isLeaf ? (
                            <span className="text-[9px] font-semibold text-emerald-700 bg-emerald-100/80 px-1.5 py-0.2 rounded">
                              Product Type
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                              {item.depth === 0 ? 'Vertical' : 'Group'}
                            </span>
                          )}
                        </div>

                        {searchQuery && item.path.length > 1 && (
                          <div className="text-[10px] text-[#6B7280] truncate">
                            {item.path.join(' › ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && <Check className="w-4 h-4 text-[#C08829] shrink-0" />}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer Info Tip */}
          <div className="px-3 py-2 bg-[#F8F9FA] border-t border-[#E2E4EA] text-[10.5px] text-[#6B7280] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#C08829] shrink-0" />
            <span>Select a specific <strong>Product Type</strong> for optimal marketplace buyer search.</span>
          </div>
        </div>
      )}
    </div>
  );
};
