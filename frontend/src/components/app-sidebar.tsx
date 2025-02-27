"use client"

import * as React from "react"
import { motion, AnimatePresence, useMotionTemplate, useMotionValue } from "framer-motion"
import { usePathname } from "next/navigation"
import { LayoutDashboard, ShoppingCart, History, CreditCard } from "lucide-react"

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarGroup,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"

type MenuItem = {
  title: string
  url: string
  icon: React.ElementType
}

const navMain: MenuItem[] = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Product", url: "/Product", icon: ShoppingCart },
  { title: "History", url: "/History", icon: History },
  { title: "Top Up", url: "/Top_Up", icon: CreditCard },
]

// Enhanced menu item animations
const menuItemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
  hover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  tap: { scale: 0.98 },
  exit: {
    opacity: 0,
    x: -20,
    transition: { duration: 0.2 },
  },
}

// Logo animation
const logoVariants = {
  initial: { opacity: 0, y: -10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
}

// Active indicator animation
const activeIndicatorVariants = {
  initial: { scaleX: 0, originX: 0 },
  animate: {
    scaleX: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    scaleX: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

// Container animation
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.2,
    },
  },
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const [isHovered, setIsHovered] = React.useState<string | null>(null)
  const { state } = useSidebar()
  const isExpanded = state === "expanded"

  // Mouse follow effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      const { currentTarget, clientX, clientY } = e
      const { left, top } = currentTarget.getBoundingClientRect()
      mouseX.set(clientX - left)
      mouseY.set(clientY - top)
    },
    [mouseX, mouseY],
  )

  // Gradient follow effect
  const background = useMotionTemplate`
    radial-gradient(
      250px circle at ${mouseX}px ${mouseY}px,
      var(--blue-glow) 0%,
      transparent 80%
    )
  `

  return (
    <Sidebar
      {...props}
      className="bg-white dark:bg-gray-900 transition-all duration-500 ease-in-out border-r dark:border-gray-800"
    >
      <motion.div
        className="absolute inset-0 z-0 opacity-30 dark:opacity-20 pointer-events-none"
        style={{ background }}
        onMouseMove={handleMouseMove}
      />

      <SidebarHeader className="p-4 relative z-10">
        <motion.div className="flex items-center gap-2" initial="initial" animate="animate" variants={logoVariants}>
          <motion.div
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="font-bold text-lg">P</span>
          </motion.div>
          <div className="leading-none">
            <motion.span
              className="font-semibold block text-lg"
              onClick={() => window.open("https://github.com/SiHantuuu/PKasir", "_blank")}
              whileHover={{ color: "rgb(59, 130, 246)" }}
              transition={{ duration: 0.2 }}
            >
              <b>PKasir</b>
            </motion.span>
            <motion.span
              className="text-sm text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.3, duration: 0.3 } }}
            >
              v100
            </motion.span>
          </div>
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="relative z-10">
        <SidebarGroup>
          <motion.div variants={containerVariants} initial="hidden" animate="show">
            <SidebarMenu>
              {navMain.map(({ title, url, icon: Icon }, i) => (
                <motion.div
                  key={title}
                  custom={i}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={menuItemVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onHoverStart={() => setIsHovered(title)}
                  onHoverEnd={() => setIsHovered(null)}
                >
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      className={`w-full justify-between group relative overflow-hidden ${
                        pathname === url ? "text-blue-500 bg-blue-50/50 dark:bg-blue-900/20" : ""
                      }`}
                    >
                      <a
                        href={url}
                        className="flex items-center justify-between py-3 px-4 rounded-xl transition-colors duration-300"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Icon
                            className={`h-5 w-5 transition-transform duration-300 ${
                              pathname === url ? "text-blue-500" : "text-gray-500 dark:text-gray-400"
                            }`}
                          />
                          <span className="font-medium">{title}</span>
                        </div>
                      </a>
                    </SidebarMenuButton>
                    <AnimatePresence>
                      {isHovered === title && pathname !== url && (
                        <motion.div
                          className="absolute inset-0 bg-blue-50/80 dark:bg-blue-900/10 rounded-xl z-[-1]"
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </AnimatePresence>
                  </SidebarMenuItem>
                </motion.div>
              ))}
            </SidebarMenu>
          </motion.div>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 relative z-10">
        <motion.div
          className="h-px w-full bg-gray-200 dark:bg-gray-800"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-500">
      <AppSidebar />
      <main className="flex-1 p-6 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                duration: 0.4,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            exit={{
              opacity: 0,
              y: -20,
              filter: "blur(10px)",
              transition: {
                duration: 0.3,
                ease: [0.22, 1, 0.36, 1],
              },
            }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

