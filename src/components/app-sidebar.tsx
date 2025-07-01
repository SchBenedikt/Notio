"use client";

import type { AppView } from '@/lib/types';
import { SidebarContent } from './sidebar-content';

type AppSidebarProps = {
  currentView: AppView;
  onSetView: (view: AppView) => void;
  userName: string | null;
};

export function AppSidebar(props: AppSidebarProps) {
    return (
        <aside className="hidden lg:flex flex-col gap-4 w-80 bg-background border-r fixed top-0 left-0 h-screen p-6">
            <SidebarContent {...props} />
        </aside>
    );
}
