

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../src/components/ui/dialog"
import { Badge } from "../../src/components/ui/badge"
import { Keyboard, Command } from "lucide-react"

interface Shortcut {
  keys: string[]
  description: string
  condition?: string
}

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false)

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
        className="fixed bottom-4 left-4 z-50 bg-gray-800 hover:bg-gray-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="Keyboard shortcuts (Ctrl+Shift+?)"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Command className="h-5 w-5" />
              Keyboard Shortcuts
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Use these keyboard shortcuts to navigate quickly around the site:
            </p>
            
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
            </div>
            
            <div className="pt-4 border-t text-xs text-gray-500">
              <p>💡 Tip: Press <Badge variant="outline" className="text-xs">Esc</Badge> to close any modal or this help.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}