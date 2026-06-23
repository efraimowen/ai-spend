'use client'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* ============ DESKTOP SIDEBAR ============ */}
      {/* Hanya tampil di desktop (md:flex = ≥768px) */}
      <aside className="hidden md:flex w-64 bg-white border-r flex-col p-6 space-y-8 shadow-sm">
        <div className="text-xl font-bold text-blue-600 flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-fintech rounded-lg" />
          SmartSpend
        </div>
        
        <nav className="flex-1 space-y-2">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Menu
          </div>
          <a 
            href="#" 
            className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors hover:bg-blue-100"
          > 
            Dashboard 
          </a>
          <a 
            href="#" 
            className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          > 
            History 
          </a>
          <a 
            href="#" 
            className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          > 
            Settings 
          </a>
        </nav>
        
        <div className="p-4 bg-gradient-fintech text-white rounded-xl">
          <p className="font-semibold text-sm">Pro Plan</p>
          <p className="text-slate-200 text-xs mt-1">Unlock AI Insights</p>
        </div>
      </aside>

      {/* ============ MOBILE SIDEBAR ============ */}
      {/* Hanya tampil di mobile (md:hidden) */}
      {/* Slide in dari kiri saat isOpen = true */}
      <aside
        className={`
          md:hidden
          fixed top-16 left-0 w-64 h-screen bg-white border-r z-40
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="text-xl font-bold text-blue-600 flex items-center gap-2 p-6 pb-4">
          <div className="w-8 h-8 bg-gradient-fintech rounded-lg" />
          SmartSpend
        </div>
        
        <nav className="flex-1 space-y-2 px-6">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Menu
          </div>
          <a 
            href="#" 
            onClick={onClose}
            className="flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg font-medium transition-colors hover:bg-blue-100 block"
          > 
            Dashboard 
          </a>
          <a 
            href="#" 
            onClick={onClose}
            className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors block"
          > 
            History 
          </a>
          <a 
            href="#" 
            onClick={onClose}
            className="flex items-center gap-3 p-3 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors block"
          > 
            Settings 
          </a>
        </nav>
        
        <div className="p-6 border-t">
          <div className="p-4 bg-gradient-fintech text-white rounded-xl">
            <p className="font-semibold text-sm">Pro Plan</p>
            <p className="text-slate-200 text-xs mt-1">Unlock AI Insights</p>
          </div>
        </div>
      </aside>

      {/* ============ OVERLAY (gelap di belakang) ============ */}
      {/* Hanya tampil saat sidebar buka di mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={onClose}
        />
      )}
    </>
  )
}