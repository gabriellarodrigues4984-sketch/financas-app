import type { ReactNode } from 'react'
import { Header } from './Header'
import { BottomNav } from './BottomNav'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mt-[76px] mb-24 md:mb-12 px-4 md:px-8 py-4 max-w-5xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
