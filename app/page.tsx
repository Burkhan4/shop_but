"use client";

import { useState, useEffect } from "react";

// Интерфейсы для TypeScript
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
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    // Безопасное обращение к объекту Telegram
    if (typeof window !== "undefined") {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        if (tg.initDataUnsafe?.user?.first_name) {
          setUserName(tg.initDataUnsafe.user.first_name);
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

  const handleCheckout = () => {
    alert(`Заказ оформлен на сумму: ${totalAmount.toLocaleString()} UZS`);
  };

  return (
    <main className="min-h-screen pb-28 px-4 pt-4 max-w-md mx-auto bg-slate-50">
      {/* Шапка */}
      <header className="mb-4 text-center">
        <h1 className="text-xl font-bold text-slate-900">Цветочная лавка</h1>
        <p className="text-xs text-slate-500 mt-1">
          {userName ? `Привет, ${userName}!` : "Заказ букетов с быстрой доставкой"}
        </p>
      </header>

      {/* Список товаров */}
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
              onClick={handleCheckout}
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-xl font-medium text-sm shadow-md active:scale-95 transition text-center"
            >
              Оформить заказ
            </button>
          </div>
        </div>
      )}
    </main>
  );
}