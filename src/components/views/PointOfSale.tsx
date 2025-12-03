import { useEffect, useState, useMemo } from 'react';
import { type Product } from '../../types';
import api from '../../api';
import { Search, ShoppingCart, Check, Calculator } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';
import AlertModal from '../ui/AlertModal';

interface CartItem {
  id: number;
  product_name: string;
  price: number;
  selectedQty: number;
  maxQty: number;
}

interface PointOfSaleProps {
  onSaleComplete?: () => void;
}

const getImageUrl = (imgName: string | null) => {
    if (!imgName || imgName === 'no_image.png') return 'https://via.placeholder.com/150?text=No+Image';
    return `http://localhost:8080/uploads/${imgName}`;
};

export default function PointOfSale({ onSaleComplete }: PointOfSaleProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Map<number, CartItem>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  
  const [alertConfig, setAlertConfig] = useState<{ isOpen: boolean; title: string; message: string; variant: 'success' | 'error' | 'info'; }>({
    isOpen: false, title: '', message: '', variant: 'success'
  });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', variant: 'info' as any, action: async () => {} });

  useEffect(() => {
    const loadProducts = async () => {
        try {
            const res = await api.get('/products');
            setProducts(res.data);
        } catch (err) { console.error(err); }
    };
    loadProducts();
  }, []);

  const toggleProduct = (product: Product) => {
    const newCart = new Map(cart);
    if (newCart.has(product.id)) {
      newCart.delete(product.id);
    } else {
      newCart.set(product.id, {
        id: product.id,
        product_name: product.product_name,
        price: product.price,
        selectedQty: 1,
        maxQty: product.quantity
      });
    }
    setCart(newCart);
  };

  const updateQuantity = (id: number, qty: number) => {
    const newCart = new Map(cart);
    const item = newCart.get(id);
    if (item) {
      newCart.set(id, { ...item, selectedQty: Math.max(1, Math.min(qty, item.maxQty)) });
      setCart(newCart);
    }
  };

  const handleCheckoutClick = () => {
    if (cart.size === 0) return;
    const totalAmount = Array.from(cart.values()).reduce((sum, item) => sum + (item.price * item.selectedQty), 0);
    const totalItems = Array.from(cart.values()).reduce((sum, item) => sum + item.selectedQty, 0);

    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการขาย?',
      message: `รายการสินค้า ${totalItems} ชิ้น \nยอดรวมทั้งสิ้น ฿${totalAmount.toLocaleString()} \n\n*ระบบจะตัดสต็อกทันที`,
      variant: 'info',
      action: processCheckout
    });
  };

  const processCheckout = async () => {
    try {
      const itemsPayload = Array.from(cart.values()).map(item => ({ id: item.id, selectedQty: item.selectedQty }));
      await api.post('/checkout', { items: itemsPayload });
      
      setProducts(currentProducts => {
          return currentProducts.map(p => {
              const cartItem = cart.get(p.id);
              if (cartItem) {
                  return { ...p, quantity: p.quantity - cartItem.selectedQty };
              }
              return p;
          });
      });

      setAlertConfig({ isOpen: true, title: 'บันทึกสำเร็จ', message: 'ทำรายการขายเรียบร้อย', variant: 'success' });
      setCart(new Map());
      if (onSaleComplete) onSaleComplete(); 

    } catch (error: any) {
      setAlertConfig({ isOpen: true, title: 'ผิดพลาด', message: error.response?.data?.error || "เกิดข้อผิดพลาด", variant: 'error' });
    }
  };

  const filteredProducts = useMemo(() => products.filter(p => 
    p.quantity > 0 && 
    p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);
  
  const totalAmount = useMemo(() => Array.from(cart.values()).reduce((sum, item) => sum + (item.price * item.selectedQty), 0), [cart]);

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] animate-fade-in gap-6">
        <div className="flex justify-between items-center shrink-0">
            <div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Calculator className="text-indigo-600" /> ขายสินค้า / ตัดสต็อก</h2></div>
            <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input type="text" placeholder="ค้นหาสินค้า..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-100" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
        </div>
        <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
                <div className="p-4 bg-slate-50 border-b border-slate-100 font-bold text-slate-600">สินค้าพร้อมขาย ({filteredProducts.length})</div>
                <div className="overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredProducts.map(product => {
                         const isSelected = cart.has(product.id);
                         const itemInCart = cart.get(product.id);
                         return (
                            <div 
                                key={product.id} 
                                onClick={() => toggleProduct(product)} 
                                className={`relative rounded-xl border p-3 flex gap-3 cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/30 shadow-inner ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:shadow-md hover:border-indigo-200'}`}
                            >
                                {/* Checkmark มุมขวาบน */}
                                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center border transition-all z-10 ${isSelected ? 'bg-indigo-500 border-indigo-500 text-white scale-110' : 'border-slate-300 bg-white scale-100'}`}>
                                    {isSelected && <Check size={14} />}
                                </div>

                                {/* รูปภาพสินค้า */}
                                <div className="w-20 h-20 bg-slate-100 rounded-lg shrink-0 overflow-hidden">
                                    <img src={getImageUrl(product.product_image)} alt={product.product_name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://via.placeholder.com/150'} />
                                </div>

                                {/* รายละเอียดสินค้า */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center relative">
                                    <h4 className="font-bold text-slate-700 truncate pr-6">{product.product_name}</h4>
                                    <p className="text-xs text-slate-400 mb-2">เหลือ: {product.quantity}</p>
                                    <p className="text-lg font-bold text-indigo-600">฿{product.price.toLocaleString()}</p>
                                    
                                    {/* ✅ ช่องกรอกจำนวน: ย้ายมามุมขวาล่าง, ปรับดีไซน์, เอาปุ่มลบออก */}
                                    {isSelected && (
                                        <div 
                                            className="absolute bottom-0 right-0 animate-fade-in" 
                                            onClick={e => e.stopPropagation()} // กดที่ช่องเลขแล้วไม่ toggle การ์ด
                                        >
                                            <input 
                                                type="number" 
                                                min="1" 
                                                max={product.quantity} 
                                                value={itemInCart?.selectedQty || 1} 
                                                onChange={(e) => updateQuantity(product.id, parseInt(e.target.value) || 1)} 
                                                className="w-14 h-9 text-center font-bold text-indigo-600 bg-white border border-indigo-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" 
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                         )
                    })}
                </div>
            </div>
            
            {/* ตะกร้าสินค้าด้านขวา */}
            <div className="w-full lg:w-96 bg-white rounded-2xl shadow-lg border border-slate-100 flex flex-col shrink-0">
                 <div className="p-5 border-b border-slate-100 bg-slate-50 rounded-t-2xl"><h3 className="font-bold text-slate-800 flex items-center gap-2"><ShoppingCart className="text-indigo-600" /> ตะกร้าสินค้า</h3></div>
                 <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {Array.from(cart.values()).map(item => (
                        <div key={item.id} className="flex justify-between items-center pb-3 border-b border-dashed border-slate-100 last:border-0">
                            <div className="flex-1"><p className="font-bold text-slate-700 text-sm truncate">{item.product_name}</p><p className="text-xs text-slate-400">{item.selectedQty} x ฿{item.price.toLocaleString()}</p></div>
                            <div className="text-right"><p className="font-bold text-slate-800">฿{(item.price * item.selectedQty).toLocaleString()}</p><button onClick={() => toggleProduct(products.find(p => p.id === item.id)!)} className="text-[10px] text-red-500 hover:underline mt-1 hover:text-red-700">ลบ</button></div>
                        </div>
                    ))}
                    {cart.size === 0 && <div className="text-center text-slate-400 py-10 flex flex-col items-center"><ShoppingCart size={40} className="mb-2 opacity-20" /><p className="text-sm">ตะกร้าว่างเปล่า</p></div>}
                 </div>
                 <div className="p-6 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
                    <div className="flex justify-between items-center mb-6"><span className="font-bold text-slate-800 text-lg">ยอดสุทธิ</span><span className="font-extrabold text-3xl text-indigo-600">฿{totalAmount.toLocaleString()}</span></div>
                    <button onClick={handleCheckoutClick} disabled={cart.size === 0} className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] ${cart.size === 0 ? 'bg-slate-300 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-xl'}`}>ยืนยันการขาย</button>
                 </div>
            </div>
        </div>
        <ConfirmModal isOpen={confirmModal.isOpen} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={confirmModal.action} title={confirmModal.title} message={confirmModal.message} variant={confirmModal.variant} confirmText="ยืนยัน" />
        <AlertModal isOpen={alertConfig.isOpen} onClose={() => setAlertConfig({ ...alertConfig, isOpen: false })} title={alertConfig.title} message={alertConfig.message} variant={alertConfig.variant} />
    </div>
  );
}