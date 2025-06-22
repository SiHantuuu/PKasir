'use client';

import { useState, useEffect } from 'react';
import type * as React from 'react';
import {
  Home,
  User,
  Package,
  ShoppingCart,
  BarChart3,
  LogIn,
  CreditCard,
  Wallet,
  Menu,
  X,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { NavUser } from '@/components/nav-user';

// Sample logo component
const PKasirLogo = () => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center gap-2">
      <ShoppingCart className="h-6 w-6 text-red-500" />
      <span className="text-xl font-bold">PKasir</span>
    </div>
  </div>
);

// Navigation data for admin (logged-in)
const adminNavData = [
  {
    title: 'Dashboard',
    url: '/Admin',
    icon: Home,
  },
  {
    title: 'Student',
    url: '/Admin/students',
    icon: User,
  },
  {
    title: 'Product',
    url: '/Admin/products',
    icon: Package,
  },
  {
    title: 'Transaction',
    url: '/Admin/transactions',
    icon: ShoppingCart,
  },
  {
    title: 'Top-up',
    url: '/Admin/topup',
    icon: CreditCard,
  },
  {
    title: 'Report',
    url: '/Admin/reports',
    icon: BarChart3,
  },
];

// Navigation data for guests (not logged-in)
const guestNavData = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Home,
  },
  {
    title: 'Dompetku',
    url: '/dompetku',
    icon: Wallet,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
}

export function AppSidebar({
  isLoggedIn = false,
  isAdmin = false,
  ...props
}: AppSidebarProps) {
  // Choose which navigation data to use based on login status
  const navData = isLoggedIn ? (isAdmin ? adminNavData : []) : guestNavData;

  // State for controlling sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState(true);
  // State to track if we're on mobile
  const [isMobile, setIsMobile] = useState(false);

  // Effect to handle responsiveness
  useEffect(() => {
    // Check if we're on mobile initially
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is standard md breakpoint

      // Auto-close sidebar on mobile
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    // Check on mount
    checkMobile();

    // Set up listener for window resize
    window.addEventListener('resize', checkMobile);

    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      {/* Toggle button for mobile - fixed position */}
      <button
        onClick={toggleSidebar}
        className={`md:hidden fixed z-50 top-4 left-4 p-2 bg-white shadow-md rounded-md ${
          sidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        aria-label="Open sidebar"
      >
        <Menu size={24} />
      </button>

      {/* Mobile sidebar */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 shadow-lg transform translate-x-0 transition-transform duration-300 ease-in-out">
          <div className="flex flex-col h-full overflow-y-auto">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-red-500" />
                  <span className="text-xl font-bold">PKasir</span>
                </div>
                <button
                  onClick={toggleSidebar}
                  className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 py-4">
              <SidebarMenu>
                {navData.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a
                        href={item.url}
                        className="flex items-center gap-2 px-4 py-2"
                        onClick={toggleSidebar} // Auto-close sidebar setelah klik menu
                      >
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </div>

            {!isLoggedIn && (
              <div className="p-4 border-t">
                <a
                  href="/login"
                  className="flex items-center justify-center w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </a>
              </div>
            )}

            {isLoggedIn && (
              <div className="p-4 border-t">
                <NavUser
                  user={{
                    name: isAdmin ? 'Admin' : 'User',
                    email: isAdmin ? 'admin@pkasir.com' : 'user@pkasir.com',
                    avatar: '/placeholder.svg?height=40&width=40',
                  }}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main sidebar with dynamic classes - only for desktop */}
      {!isMobile && (
        <div className="fixed md:relative z-40 h-full">
          <Sidebar
            collapsible="icon"
            collapsed={isMobile ? !sidebarOpen : undefined}
            {...props}
          >
            <SidebarHeader>
              <PKasirLogo />
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarMenu>
                  {navData.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton tooltip={item.title} asChild>
                        <a href={item.url}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroup>
            </SidebarContent>

            {!isLoggedIn && (
              <SidebarFooter>
                <div className="px-2 pb-4">
                  <a
                    href="/login"
                    className="flex items-center justify-center w-full p-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </a>
                </div>
              </SidebarFooter>
            )}

            {isLoggedIn && (
              <SidebarFooter>
                <NavUser
                  user={{
                    name: isAdmin ? 'Admin' : 'User',
                    email: isAdmin ? 'admin@pkasir.com' : 'user@pkasir.com',
                    avatar: '/placeholder.svg?height=40&width=40',
                  }}
                />
              </SidebarFooter>
            )}
            <SidebarRail />
          </Sidebar>
        </div>
      )}
    </>
  );
}
