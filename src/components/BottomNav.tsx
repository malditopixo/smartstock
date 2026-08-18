import React from 'react';
import { ActiveTab } from '../types';
import { Home, Package, BarChart3, History, PlusCircle, Sparkles } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lowStockCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  lowStockCount
}) => {
  const navItems = [
    {
      id: 'home' as ActiveTab,
      label: 'Início',
      icon: Home,
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'Estoque',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
    },
    {
      id: 'dashboard' as ActiveTab,
      label: 'Gráficos',
      icon: BarChart3,
    },
    {
      id: 'ai' as ActiveTab,
      label: 'IA',
      icon: Sparkles,
    },
    {
      id: 'history' as ActiveTab,
      label: 'Histórico',
      icon: History,
    },
    {
      id: 'new_product' as ActiveTab,
      label: 'Novo',
      icon: PlusCircle,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t-4 border-zinc-900 shadow-[0_-4px_0_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto px-1.5 h-16 flex items-center justify-around gap-0.5">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-12 py-1 px-0.5 rounded-xl transition-all ${
                isActive
                  ? 'text-red-600 bg-zinc-100 border-2 border-zinc-900 shadow-[2px_2px_0px_rgba(0,0,0,1)] font-black'
                  : 'text-zinc-500 hover:text-zinc-900 font-bold hover:bg-zinc-50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4.5 h-4.5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[2]'}`} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1.5 -right-2 bg-red-600 text-white text-[9px] font-black w-4 h-4 rounded-md flex items-center justify-center border border-zinc-900 shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] uppercase font-black tracking-wider mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
