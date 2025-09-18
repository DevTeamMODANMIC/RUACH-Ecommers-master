

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Keyboard, Command } from "lucide-react"
import { useIsMobile } from "@/hooks/use-mobile"

interface Shortcut {
  keys: string[]
  description: string
  condition?: string
}

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useIsMobile()

  const shortcuts: Shortcut[] = [
    {
      keys: ["Ctrl", "Shift", "A"],
      description: "Open Vendor Dashboard",
      condition: "Vendors only"
    },
    {
      keys: ["Ctrl", "Shift", "H"],
      description: "Go to Home page"
    },
    {
      keys: ["Ctrl", "Shift", "S"],
      description: "Go to Shop page"
    },
    {
      keys: ["Ctrl", "Shift", "C"],
      description: "Go to Cart"
    },
    {
      keys: ["Ctrl", "Shift", "P"],
      description: "Go to Profile",
      condition: "Logged in users"
    },
    {
      keys: ["Ctrl", "Shift", "V"],
      description: "Vendor Registration/Dashboard"
    },
    {
      keys: ["Ctrl", "Shift", "D"],
      description: "Admin Dashboard",
      condition: "Admins only"
    },
    {
      keys: ["Ctrl", "K"],
      description: "Quick search"
    },
    {
      keys: ["Ctrl", "Shift", "?"],
      description: "Show this help"
    }
  ]

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Show help with Ctrl+Shift+? or Ctrl+/
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === '?') {
        event.preventDefault()
        setIsOpen(true)
      }
      
      // Also allow Ctrl+/ for help
      if ((event.ctrlKey || event.metaKey) && event.key === '/') {
        event.preventDefault()
        setIsOpen(true)
      }

      // Close with Escape
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const isMac = typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0

  const formatKeys = (keys: string[]) => {
    return keys.map(key => {
      if (key === 'Ctrl' && isMac) return 'Cmd'
      return key
    })
  }

  return (
    <>
      {/* Help trigger button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-4 left-4 z-50 text-white rounded-full shadow-lg transition-all duration-300 ${
          isMobile 
            ? "bg-gray-900/90 hover:bg-gray-800/95 backdrop-blur-md border border-gray-700/50 p-3 shadow-2xl" 
            : "bg-gray-800 hover:bg-gray-700 p-2"
        }`}
        title="Keyboard shortcuts (Ctrl+Shift+?)"
      >
        <Keyboard className={isMobile ? "h-5 w-5" : "h-4 w-4"} />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className={`max-w-md ${
          isMobile 
            ? "bg-white/95 backdrop-blur-md border border-gray-200/50 shadow-2xl" 
            : "bg-white"
        }`}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
            <DialogDescription>
              Use these keyboard shortcuts to navigate quickly around the site
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-3">
              {shortcuts.map((shortcut, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{shortcut.description}</div>
                    {shortcut.condition && (
                      <div className="text-xs text-gray-500">{shortcut.condition}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {formatKeys(shortcut.keys).map((key, keyIndex) => (
                      <span key={keyIndex} className="flex items-center">
                        <Badge variant="outline" className="text-xs px-2 py-1">
                          {key}
                        </Badge>
                        {keyIndex < shortcut.keys.length - 1 && (
                          <span className="mx-1 text-gray-400">+</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Special note for Ctrl+Shift+G */}
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="flex-1">
                  <div className="text-sm font-medium">Service Provider Dashboard</div>
                  <div className="text-xs text-gray-500">Only works on Service Provider pages</div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="text-xs px-2 py-1">Ctrl</Badge>
                  <span className="mx-1 text-gray-400">+</span>
                  <Badge variant="outline" className="text-xs px-2 py-1">Shift</Badge>
                  <span className="mx-1 text-gray-400">+</span>
                  <Badge variant="outline" className="text-xs px-2 py-1">G</Badge>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t text-xs text-gray-500">
              <div>💡 Tip: Press <Badge variant="outline" className="text-xs">Esc</Badge> to close any modal or this help.</div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}