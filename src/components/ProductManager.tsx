import { useEffect, useState } from 'react';
import api from '../api';
import { type Product } from '../types';
import { Plus, Trash2, X, Image as ImageIcon, Search } from 'lucide-react';

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    product_name: '', category: '', price: '', quantity: '', product_image: null as File | null
  });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try { const res = await api.get('/products'); setProducts(res.data); } 
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("ลบสินค้านี้?")) return;
    try { await api.delete(`/products/${id}`); fetchProducts(); } catch { alert("ลบไม่สำเร็จ"); }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(newProduct).forEach(([key, value]) => { if (value) formData.append(key, value as any); });
    try {
      await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowAddForm(false); setNewProduct({ product_name: '', category: '', price: '', quantity: '', product_image: null });
      fetchProducts();
    } catch { alert("เพิ่มไม่สำเร็จ"); }
  };

  if (loading) return <div className="p-12 text-center text-slate-400">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">📦 คลังสินค้า</h2>
          <p className="text-slate-500 text-sm mt-1">จัดการรายการสินค้าทั้งหมดในระบบ</p>
        </div>
        <button onClick={() => setShowAddForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
          <Plus size={18} /> เพิ่มสินค้า
        </button>
      </div>

      {/* Modal Add Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
            <div className="flex justify-between mb-6">
              <h3 className="text-lg font-bold">เพิ่มสินค้าใหม่</h3>
              <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-600"><X /></button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="ชื่อสินค้า" className="input-field col-span-2" onChange={e => setNewProduct({...newProduct, product_name: e.target.value})} />
                <input required placeholder="หมวดหมู่" className="input-field" onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
                <input required type="number" placeholder="ราคา" className="input-field" onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                <input required type="number" placeholder="จำนวน" className="input-field" onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} />
                <div className="col-span-2 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition relative cursor-pointer">
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => setNewProduct({...newProduct, product_image: e.target.files ? e.target.files[0] : null})} />
                  <ImageIcon className="mx-auto text-slate-400 mb-2" />
                  <span className="text-sm text-slate-500">{newProduct.product_image ? newProduct.product_image.name : "คลิกอัปโหลดรูปภาพ"}</span>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">บันทึกสินค้า</button>
            </form>
          </div>
        </div>
      )}

      {/* Clean Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {['รูปสินค้า', 'ชื่อสินค้า', 'หมวดหมู่', 'ราคา', 'สถานะ', 'จัดการ'].map(h => (
                <th key={h} className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map((p) => (
              <tr key={p.ID} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-4"><img src={`http://localhost:8080/uploads/${p.ProductImage}`} className="w-10 h-10 rounded-lg object-cover border border-slate-100" /></td>
                <td className="p-4 font-medium text-slate-700">{p.ProductName}</td>
                <td className="p-4"><span className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs">{p.Category}</span></td>
                <td className="p-4 font-semibold">฿{p.Price.toLocaleString()}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${p.Quantity < 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>{p.Quantity} ชิ้น</span></td>
                <td className="p-4"><button onClick={() => handleDelete(p.ID)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button></td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="p-10 text-center text-slate-400">ไม่พบสินค้า</td></tr>}
          </tbody>
        </table>
      </div>
      <style>{`.input-field { @apply w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm; }`}</style>
    </div>
  );
}