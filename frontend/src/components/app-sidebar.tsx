'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarRail,
} from "@/components/ui/sidebar"

type MenuItem = {
  title: string;
  url: string;
};

const navMain: MenuItem[] = [
  { title: "Dashboard", url: "/" },
  { title: "Product", url: "/Product" },
  { title: "History", url: "/History" },
  { title: "Top Up", url: "/Top_Up" },
];

const menuItemVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 }
};

const pillVariants = {
  initial: { scaleY: 0 },
  animate: { scaleY: 1, transition: { duration: 0.5, ease: "circOut" } }
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = React.useState<string | null>(null)

  return (
    <Sidebar {...props} className="bg-white dark:bg-gray-900 transition-all duration-300 ease-in-out">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="leading-none">
            <span 
              className="font-semibold block text-lg cursor-pointer hover:text-blue-500"
              onClick={() => window.open("https://github.com/SiHantuuu/PKasir", "_blank")}
            >
              <b>PKasir</b>
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">v100</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {navMain.map(({ title, url }) => (
              <motion.div
                key={title}
                variants={menuItemVariants}
                whileHover="hover"
                whileTap="tap"
                onHoverStart={() => setIsHovered(title)}
                onHoverEnd={() => setIsHovered(null)}
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className={`w-full justify-between group relative ${
                      pathname === url ? 'text-blue-500' : ''
                    }`}
                  >
                    <a href={url} className="flex items-center py-2 px-4 rounded-lg transition-colors duration-200">
                      <span className="font-medium">{title}</span>
                    </a>
                  </SidebarMenuButton>
                  <AnimatePresence>
                    {isHovered === title && (
                      <motion.div
                        className="absolute inset-0 bg-blue-100 dark:bg-blue-900 rounded-lg z-[-1]"
                        layoutId="hoverBackground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      />
                    )}
                  </AnimatePresence>
                </SidebarMenuItem>
              </motion.div>
            ))}
            <motion.div
              className="absolute left-0 h-10 bg-blue-500 rounded-r-full w-1"
              variants={pillVariants}
              initial="initial"
              animate="animate"
              style={{
                top: navMain.findIndex(item => item.url === pathname) * 40 + 16,
              }}
              layoutId="activePill"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AppSidebar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={usePathname()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}