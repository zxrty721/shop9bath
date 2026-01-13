import { useEffect, useState, useMemo } from "react";
import { type Product } from "../../types";
import api from "../../api";
import { AxiosError } from "axios"; // ✅ 1. เพิ่ม import AxiosError
import {
    Search,
    ShoppingCart,
    Check,
    Calculator,
    Loader2,
    PackageX,
    ChevronUp,
    ChevronDown,
    Trash2,
    Plus,
    Minus,
} from "lucide-react";
import ConfirmModal from "../ui/ConfirmModal";
import AlertModal from "../ui/AlertModal";

interface CartItem {
    id: number;
    product_name: string;
    price: number;
    selectedQty: number;
    maxQty: number;
}

interface PointOfSaleProps {
    onDataChange?: () => void;
}

// ✅ 2. สร้าง Interface สำหรับ Modal State เพื่อเลิกใช้ as any
interface ConfirmModalState {
    isOpen: boolean;
    title: string;
    message: string;
    variant: "info" | "success" | "warning" | "danger";
    action: () => Promise<void> | void;
}

export default function PointOfSale({ onDataChange }: PointOfSaleProps) {
    const [products, setProducts] = useState<Product[]>([]);
    const [cart, setCart] = useState<Map<number, CartItem>>(new Map());
    const [searchTerm, setSearchTerm] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant: "success" | "error" | "info";
    }>({
        isOpen: false,
        title: "",
        message: "",
        variant: "success",
    });

    // ✅ 3. ใช้ Type ที่ถูกต้อง และกำหนด default value ที่ถูกต้อง
    const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
        isOpen: false,
        title: "",
        message: "",
        variant: "info",
        action: async () => {},
    });

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const res = await api.get<Product[]>("/products");
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            }
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
                maxQty: product.quantity,
            });
        }
        setCart(newCart);
    };

    const updateQuantity = (id: number, qty: number) => {
        const newCart = new Map(cart);
        const item = newCart.get(id);
        if (item) {
            newCart.set(id, {
                ...item,
                selectedQty: Math.max(1, Math.min(qty, item.maxQty)),
            });
            setCart(newCart);
        }
    };

    const removeFromCart = (id: number) => {
        const newCart = new Map(cart);
        newCart.delete(id);
        setCart(newCart);
    };

    const handleCheckoutClick = () => {
        if (cart.size === 0 || isSubmitting) return;
        setConfirmModal({
            isOpen: true,
            title: "ยืนยันการขาย?",
            message: `รายการสินค้า ${Array.from(cart.values()).reduce((s, i) => s + i.selectedQty, 0)} ชิ้น \nยอดรวม ฿${totalAmount.toLocaleString()}`,
            variant: "info",
            action: processCheckout,
        });
    };

    const processCheckout = async () => {
        if (isSubmitting) return;
        setIsSubmitting(true);

        try {
            const itemsPayload = Array.from(cart.values()).map((item) => ({
                id: item.id,
                selectedQty: item.selectedQty,
            }));
            await api.post("/checkout", { items: itemsPayload });

            setProducts((currentProducts) => {
                return currentProducts.map((p) => {
                    const cartItem = cart.get(p.id);
                    if (cartItem) {
                        return {
                            ...p,
                            quantity: p.quantity - cartItem.selectedQty,
                        };
                    }
                    return p;
                });
            });

            setAlertConfig({
                isOpen: true,
                title: "บันทึกสำเร็จ",
                message: "ทำรายการขายเรียบร้อย",
                variant: "success",
            });
            setCart(new Map());
            setIsMobileCartOpen(false);

            if (onDataChange) onDataChange();
        } catch (err) {
            // ✅ 4. แก้ไข catch (error: any) เป็น AxiosError
            const error = err as AxiosError<{ error: string }>;
            setAlertConfig({
                isOpen: true,
                title: "ผิดพลาด",
                message: error.response?.data?.error || "เกิดข้อผิดพลาด",
                variant: "error",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredProducts = useMemo(
        () =>
            products.filter(
                (p) =>
                    p.quantity > 0 &&
                    p.product_name
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()),
            ),
        [products, searchTerm],
    );

    const totalAmount = useMemo(
        () =>
            Array.from(cart.values()).reduce(
                (sum, item) => sum + item.price * item.selectedQty,
                0,
            ),
        [cart],
    );

    const getProductImage = (product: Product) => {
        if (
            !product.product_image ||
            product.product_image === "no_image.png"
        ) {
            return `https://pub.shop9bath.online/${product.product_code}.webp`;
        }
        return `https://pub.shop9bath.online/${product.product_image}`;
    };

    return (
        <div className="flex flex-col h-[calc(100dvh-80px)] md:h-full gap-4 font-prompt relative">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shrink-0 px-1">
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-zinc-800 dark:text-white flex items-center gap-2">
                        <Calculator className="text-indigo-600 dark:text-indigo-400" />{" "}
                        ขายสินค้า
                    </h2>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search
                        className="absolute left-3 top-2.5 text-zinc-400 pointer-events-none"
                        size={18}
                    />
                    <input
                        type="text"
                        placeholder="ค้นหาสินค้า..."
                        className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm transition-all focus:ring-2 focus:ring-indigo-500 text-zinc-800 dark:text-white placeholder:text-zinc-400 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Content Area (Products) */}
            <div className="flex-1 overflow-hidden relative rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50">
                <div className="h-full overflow-y-auto p-4 pb-32 md:pb-4 md:pr-96">
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4">
                        {filteredProducts.map((product) => {
                            const isSelected = cart.has(product.id);
                            const itemInCart = cart.get(product.id);
                            const imageSrc = getProductImage(product);

                            return (
                                <div
                                    key={product.id}
                                    onClick={() => toggleProduct(product)}
                                    className={`group relative flex flex-col bg-white dark:bg-zinc-900 rounded-xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                                        isSelected
                                            ? "border-indigo-500 ring-1 ring-indigo-500 shadow-md"
                                            : "border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg"
                                    }`}
                                >
                                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 relative overflow-hidden">
                                        <img
                                            src={imageSrc}
                                            alt={product.product_name}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) =>
                                                (e.currentTarget.src =
                                                    "https://via.placeholder.com/150?text=No+Image")
                                            }
                                        />
                                        {isSelected && (
                                            <div className="absolute inset-0 bg-indigo-900/20 backdrop-blur-[1px] flex items-center justify-center animate-fade-in">
                                                <div className="bg-indigo-600 text-white rounded-full p-1.5 shadow-lg">
                                                    <Check
                                                        size={20}
                                                        strokeWidth={3}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                            เหลือ {product.quantity}
                                        </div>
                                    </div>

                                    <div className="p-3 flex flex-col flex-1">
                                        <h4
                                            className="font-bold text-zinc-800 dark:text-zinc-100 text-sm line-clamp-1 mb-1"
                                            title={product.product_name}
                                        >
                                            {product.product_name}
                                        </h4>
                                        <div className="mt-auto flex items-center justify-between">
                                            <span className="text-indigo-600 dark:text-indigo-400 font-bold text-base">
                                                ฿
                                                {product.price.toLocaleString()}
                                            </span>
                                        </div>

                                        {isSelected && (
                                            <div
                                                className="mt-2 flex items-center gap-1"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQuantity(
                                                            product.id,
                                                            (itemInCart?.selectedQty ||
                                                                1) - 1,
                                                        );
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <input
                                                    type="number"
                                                    className="flex-1 w-full h-8 text-center font-bold bg-transparent border-b border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-white focus:outline-none focus:border-indigo-500"
                                                    value={
                                                        itemInCart?.selectedQty ||
                                                        1
                                                    }
                                                    onChange={(e) =>
                                                        updateQuantity(
                                                            product.id,
                                                            parseInt(
                                                                e.target.value,
                                                            ) || 1,
                                                        )
                                                    }
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                />
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        updateQuantity(
                                                            product.id,
                                                            (itemInCart?.selectedQty ||
                                                                1) + 1,
                                                        );
                                                    }}
                                                    className="w-8 h-8 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Cart Section */}
                <div
                    className={`
            fixed md:absolute top-auto bottom-0 right-0 left-0 md:left-auto md:top-0 md:h-full
            w-full md:w-96
            bg-white dark:bg-black
            border-t md:border-l border-zinc-200 dark:border-zinc-800
            shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.1)] md:shadow-none
            transition-transform duration-300 ease-in-out z-20
            flex flex-col
            ${isMobileCartOpen ? "h-[85vh] rounded-t-3xl" : "h-20 md:h-full rounded-t-none"}
          `}
                >
                    <div
                        className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center cursor-pointer md:cursor-default bg-white dark:bg-zinc-900 md:bg-transparent"
                        onClick={() => setIsMobileCartOpen(!isMobileCartOpen)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-800 dark:text-white text-sm md:text-base">
                                    ตะกร้าสินค้า
                                </h3>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400 md:hidden">
                                    {cart.size} รายการ (แตะเพื่อดูรายละเอียด)
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 md:hidden">
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                                ฿{totalAmount.toLocaleString()}
                            </span>
                            {isMobileCartOpen ? (
                                <ChevronDown
                                    size={20}
                                    className="text-zinc-400"
                                />
                            ) : (
                                <ChevronUp
                                    size={20}
                                    className="text-zinc-400"
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-black/50">
                        {Array.from(cart.values()).map((item) => (
                            <div
                                key={item.id}
                                className="flex justify-between items-center p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
                            >
                                <div className="flex-1 min-w-0 mr-3">
                                    <p className="font-bold text-zinc-700 dark:text-zinc-200 text-sm truncate">
                                        {item.product_name}
                                    </p>
                                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                                        {item.selectedQty} x ฿
                                        {item.price.toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <p className="font-bold text-zinc-800 dark:text-white text-sm">
                                        ฿
                                        {(
                                            item.price * item.selectedQty
                                        ).toLocaleString()}
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeFromCart(item.id);
                                        }}
                                        className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {cart.size === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 space-y-3 py-10">
                                <PackageX size={48} className="opacity-20" />
                                <p className="text-sm">
                                    ยังไม่มีสินค้าในตะกร้า
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 pb-8 md:pb-4">
                        <div className="flex justify-between items-end mb-4 md:flex">
                            <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                                ยอดสุทธิ
                            </span>
                            <span className="font-extrabold text-2xl text-indigo-600 dark:text-indigo-400">
                                ฿{totalAmount.toLocaleString()}
                            </span>
                        </div>

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCheckoutClick();
                            }}
                            disabled={cart.size === 0 || isSubmitting}
                            className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg transition-all active:scale-[0.98] flex justify-center items-center gap-2 ${
                                cart.size === 0 || isSubmitting
                                    ? "bg-zinc-300 dark:bg-zinc-800 cursor-not-allowed shadow-none text-zinc-500"
                                    : "bg-zinc-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-zinc-200 hover:shadow-xl"
                            }`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                "ยืนยันการขาย"
                            )}
                        </button>
                    </div>
                </div>

                {isMobileCartOpen && (
                    <div
                        className="fixed inset-0 bg-black/60 z-10 md:hidden backdrop-blur-sm"
                        onClick={() => setIsMobileCartOpen(false)}
                    />
                )}
            </div>

            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() =>
                    setConfirmModal({ ...confirmModal, isOpen: false })
                }
                onConfirm={confirmModal.action}
                title={confirmModal.title}
                message={confirmModal.message}
                variant={confirmModal.variant}
                confirmText="ยืนยัน"
            />
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() =>
                    setAlertConfig({ ...alertConfig, isOpen: false })
                }
                title={alertConfig.title}
                message={alertConfig.message}
                variant={alertConfig.variant}
            />
        </div>
    );
}
