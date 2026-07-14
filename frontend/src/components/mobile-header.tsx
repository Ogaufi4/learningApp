import { MobileSidebar } from "./mobile-sidebar";

export const MobileHeader = () => {
  return (
    <nav className="fixed top-0 z-50 flex h-[50px] w-full items-center border-b border-[#e4d7c5] bg-[#fffdf7] px-4 shadow-sm lg:hidden">
      <MobileSidebar />
    </nav>
  );
};
