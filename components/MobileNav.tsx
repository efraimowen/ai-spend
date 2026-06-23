// components/MobileNav.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Menu, X } from 'lucide-react'

interface MobileNavProps {
  onToggle: (open: boolean) => void
  isOpen: boolean
}

export default function MobileNav({ onToggle, isOpen }: MobileNavProps) {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-50 flex items-center justify-between p-4">
      <div className="text-lg font-bold text-blue-600">SmartSpend</div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onToggle(!isOpen)}
        className="relative z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>
    </div>
  )
}