import { useEffect, useState, useMemo } from 'react';
import api from '../../api';
import { type Product } from '../../types';
import {
  Plus,
  Trash2,
  X,
  Image as ImageIcon,
  Package,
  Tag,
  DollarSign,
  Layers,
  Search,
  Loader2,
  Pencil,
} from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

const CATEGORIES = [
  'Coffee',
  'Tea',
  'Milk',
  'Soda',
  'Smoothie',
  'Bakery',
  'Food',
  'Other',
];

interface ProductManagerProps {
  onDataChange?: () => void;
}

const InputGroup = ({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
}: any) => (
  <div>
    <label className="text-sm font-bold text-slate-700 mb-1.5 block">
      {label}
    </label>
    <div className="relative">
      <Icon
        className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
        size={18}
      />
      {type === 'select' && options ? (
        <select
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium appearance-none transition focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 disabled:bg-slate-100 disabled:text-slate-500"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {options.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          disabled={disabled}
          required
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 font-medium transition focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 disabled:bg-slate-100 disabled:text-slate-500"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  </div>
);

export default function ProductManager({ onDataChange }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // สำหรับแก้ไข
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState<{
    product_code: string;
    product_name: string;
    category: string;
    price: string;
    quantity: string;
    product_image: File | null;
  }>({
    product_code: '',
    product_name: '',
    category: CATEGORIES[0],
    price: '',
    quantity: '',
    product_image: null,
  });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    id: number | null;
  }>({ isOpen: false, id: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const fetchProducts = async () => {
    try {
      const res = await api.get<Product[]>('/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setShowAddForm(true);
    setFormData({
      product_code: product.product_code,
      product_name: product.product_name,
      category: product.category || CATEGORIES[0],
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      product_image: null,
    });
    setImagePreview(
      product.product_image
        ? `https://pub.shop9bath.online/${product.product_image}`
        : null,
    );
  };

  const closeModal = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setFormData({
      product_code: '',
      product_name: '',
      category: CATEGORIES[0],
      price: '',
      quantity: '',
      product_image: null,
    });
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
  };

  const uploadImageIfNeeded = async (productId: number) => {
    if (!formData.product_image) return;

    const fd = new FormData();
    fd.append('image', formData.product_image);

    await api.post(`/products/${productId}/image`, fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    const price = parseFloat(formData.price);
    const quantity = parseInt(formData.quantity, 10);

    if (!formData.product_code || !formData.product_name || isNaN(price) || isNaN(quantity)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      product_code: formData.product_code,
      product_name: formData.product_name,
      category: formData.category,
      price,
      quantity,
    };

    try {
      const res = await api.post<Product>('/products', payload);
      const newProduct = res.data;

      // ถ้ามีเลือกรูป -> อัปโหลดตาม product id
      await uploadImageIfNeeded(newProduct.id);

      await fetchProducts();
      if (onDataChange) onDataChange();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !editingProduct) return;

    const price = parseFloat(formData.price);
    const quantity = parseInt(formData.quantity, 10);

    if (!formData.product_code || !formData.product_name || isNaN(price) || isNaN(quantity)) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      product_code: formData.product_code,
      product_name: formData.product_name,
      category: formData.category,
      price,
      quantity,
    };

    try {
      await api.put<Product>(`/products/${editingProduct.id}`, payload);

      // ถ้ามีเลือกรูปใหม่ -> upload image
      await uploadImageIfNeeded(editingProduct.id);

      await fetchProducts();
      if (onDataChange) onDataChange();
      closeModal();
    } catch (err) {
      console.error(err);
      alert('แก้ไขสินค้าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.id) return;
    try {
      await api.delete(`/products/${deleteModal.id}`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.id));
      if (onDataChange) onDataChange();
    } catch {
      alert('ลบไม่สำเร็จ');
    }
    setDeleteModal({ isOpen: false, id: null });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setFormData((prev) => ({ ...prev, product_image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (p) =>
          p.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.category || '').toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [products, searchTerm],
  );

  if (loading)
    return (
      <div className="p-10 text-center text-slate-400 animate-pulse">
        กำลังโหลดข้อมูล...
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="text-indigo-600" /> คลังสินค้า
          </h2>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative group flex-1 md:w-64">
            <Search
              className="absolute left-3 top-2.5 text-slate-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาสินค้า..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all focus:bg-white focus:ring-2 focus:ring-indigo-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => {
              setEditingProduct(null);
              setShowAddForm(true);
            }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-700 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={18} /> เพิ่มสินค้า
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden group flex flex-col relative hover:shadow-md transition-all"
          >
            <div className="relative h-48 bg-slate-50 overflow-hidden">
              <img
                src={
                  p.product_image
                    ? `https://pub.shop9bath.online/${p.product_image}`
                    : `https://pub.shop9bath.online/${p.product_code}.webp`
                }
                alt={p.product_name}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/300x300?text=No+Image';
                }}
              />
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEditClick(p)}
                  className="p-2 bg-white/90 text-indigo-500 rounded-lg shadow-sm hover:bg-indigo-50 transition"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() =>
                    setDeleteModal({ isOpen: true, id: p.id })
                  }
                  className="p-2 bg-white/90 text-red-500 rounded-lg shadow-sm hover:bg-red-50 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {p.quantity === 0 ? (
                <span className="absolute top-2 left-2 bg-slate-800/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                  SOLD OUT
                </span>
              ) : (
                p.quantity < 10 && (
                  <span className="absolute top-2 left-2 bg-red-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                    LOW STOCK
                  </span>
                )
              )}
            </div>
            <div className="p-4 flex flex-col flex-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-full w-fit mb-2">
                {p.category || 'Uncategorized'}
              </span>
              <h3 className="font-bold text-slate-800 text-lg mb-auto line-clamp-2">
                {p.product_name}
              </h3>
              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-xs text-slate-400">ราคา</p>
                  <p className="text-xl font-bold text-indigo-600">
                    ฿{p.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">คงเหลือ</p>
                  <div
                    className={`flex items-center gap-1 font-bold ${
                      p.quantity === 0
                        ? 'text-red-500'
                        : 'text-slate-700'
                    }`}
                  >
                    <Layers size={14} /> {p.quantity}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Add/Edit */}
      {showAddForm && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingProduct ? 'แก้ไขรายละเอียดสินค้า' : 'เพิ่มสินค้าใหม่'}
              </h3>
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-slate-600"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>
            <form
              onSubmit={
                editingProduct ? handleUpdateSubmit : handleAddSubmit
              }
            >
              <div className="p-6 md:p-8 grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <InputGroup
                    label="ชื่อสินค้า"
                    icon={Package}
                    value={formData.product_name}
                    onChange={(v: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        product_name: v,
                      }))
                    }
                  />
                  <InputGroup
                    label="หมวดหมู่"
                    icon={Tag}
                    type="select"
                    options={CATEGORIES}
                    value={formData.category}
                    onChange={(v: string) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: v,
                      }))
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputGroup
                      label="ราคา"
                      icon={DollarSign}
                      type="number"
                      value={formData.price}
                      onChange={(v: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          price: v,
                        }))
                      }
                    />
                    <InputGroup
                      label="จำนวน"
                      icon={Layers}
                      type="number"
                      value={formData.quantity}
                      onChange={(v: string) =>
                        setFormData((prev) => ({
                          ...prev,
                          quantity: v,
                        }))
                      }
                    />
                  </div>
                </div>

                {/* อัปโหลดรูป */}
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    รูปภาพสินค้า
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl h-48 relative overflow-hidden bg-slate-50 hover:bg-slate-100 transition-colors group cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                      onChange={handleImageChange}
                    />
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        className="w-full h-full object-cover"
                        alt="Preview"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-indigo-500">
                        <ImageIcon size={48} />
                        <span className="text-xs font-bold mt-2">
                          คลิกเพื่ออัปโหลด
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-2 rounded-xl font-bold shadow-lg transition flex items-center gap-2 ${
                    isSubmitting
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />{' '}
                      กำลังบันทึก...
                    </>
                  ) : (
                    'บันทึก'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() =>
          setDeleteModal({ ...deleteModal, isOpen: false })
        }
        onConfirm={confirmDelete}
        title="ลบสินค้า?"
        message="สินค้าจะหายไปถาวร ไม่สามารถกู้คืนได้"
        variant="danger"
        confirmText="ยืนยันการลบ"
      />
    </div>
  );
}
