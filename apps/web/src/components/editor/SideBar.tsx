import { ReactNode } from 'react';

export const Sidebar = ({ children }: { children: ReactNode }) => {
  return (
    <aside className="w-64 h-full border-r-2 border-zinc-800 pt-1 overflow-y-auto bg-zinc-950">
      {children}
    </aside>
  );
}

export default Sidebar;