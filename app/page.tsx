"use client";

import { useState, useEffect } from "react";

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  image: string;
}

interface CartItem extends Product {
  count: number;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Букет роз «Премиум»",
    price: 250000,
    category: "Цветы",
    image: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=500&q=80",
  },
  {
    id: 2,
    title: "Пионы микс",
    price: 320000,
    category: "Цветы",
    image: "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=500&q=80",
  },
  {
    id: 3,
    title: "Фирменная открытка",
    price: 25000,
    category: "Подарки",
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80",
  },
];

export default function Home() {
  const [cart, setCart] = useState<Record<number, CartItem>>({});
  const [tgUser, setTgUser] = useState<any>(null);

  // Состояние формы заказа
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState("+998 ");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.user) {
          setTgUser(tg.initDataUnsafe.user);
        }
      }
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => ({
      ...prev,
      [product.id]: {
        ...product,
        count: (prev[product.id]?.count || 0) + 1,
      },
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => {
      const currentCount = prev[productId]?.count || 0;
      if (currentCount <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          count: currentCount - 1,
        },
      };
    });
  };

  const cartList = Object.values(cart);
  const totalAmount = cartList.reduce((sum, item) => sum + item.price * item.count, 0);
  const totalCount = cartList.reduce((sum, item) => sum + item.count, 0);

  // Отправка заказа на наш серверный API Route
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim() || !address.trim()) {
      alert("Пожалуйста, укажите номер телефона и адрес");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: tgUser,
          phone,
          address,
          items: cartList,
          totalAmount,
        }),
      });

      if (res.ok) {
        const tg = (window as any).Telegram?.WebApp;
        if (tg) {
          tg.close();
        } else {
          alert("Заказ успешно оформлен!");
          setIsModalOpen(false);
          setCart({});
        }
      } else {
        alert("Ошибка при отправке заказа");
      }
    } catch (err) {
      alert("Не удалось отправить заказ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen pb-28 px-4 pt-4 max-w-md mx-auto bg-slate-50">
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">Цветочная лавка</h1>
        <p className="text-xs text-slate-500 mt-1">
          {tgUser ? `Привет, ${tgUser.first_name}!` : "Заказ букетов с быстрой доставкой"}
        </p>
      </header>

      {/* Товары */}
      <div className="grid grid-cols-1 gap-4">
        {PRODUCTS.map((product) => {
          const inCart = cart[product.id]?.count || 0;
          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-3 items-center"
            >
              <img
                src={product.image}
                alt={product.title}
                className="w-20 h-20 rounded-xl object-cover"
              />
              <div className="flex-1">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-600">
                  {product.category}
                </span>
                <h2 className="font-medium text-sm leading-snug text-slate-900">
                  {product.title}
                </h2>
                <div className="text-sm font-bold mt-1 text-slate-900">
                  {product.price.toLocaleString()} UZS
                </div>
              </div>

              <div className="flex items-center gap-2">
                {inCart > 0 ? (
                  <>
                    <button
                      onClick={() => removeFromCart(product.id)}
                      className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition"
                    >
                      -
                    </button>
                    <span className="font-semibold text-sm w-4 text-center">
                      {inCart}
                    </span>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
                    >
                      +
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => addToCart(product)}
                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-semibold hover:bg-blue-100 transition"
                  >
                    В корзину
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Нижняя плашка заказа */}
      {totalCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur border-t border-slate-200 shadow-lg">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-500">Итого ({totalCount} шт.)</div>
              <div className="text-base font-extrabold text-slate-900">
                {totalAmount.toLocaleString()} UZS
              </div>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium text-sm shadow-md active:scale-95 transition text-center"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно с формой доставки */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">Куда доставить?</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Номер телефона
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Адрес или ориентир
                </label>
                <textarea
                  required
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Улица, дом, квартира / ориентир..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition"
                >
                  {isSubmitting ? "Отправка..." : `Подтвердить заказ на ${totalAmount.toLocaleString()} UZS`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}