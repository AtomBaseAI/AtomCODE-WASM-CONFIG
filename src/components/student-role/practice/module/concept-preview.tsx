"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Brain, Maximize2, X } from "lucide-react"

export default function ConceptPreview({ concepturl }: { concepturl: string }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isEnlarged, setIsEnlarged] = useState(false)

    const toggleSize = () => {
        setIsEnlarged(!isEnlarged)
    }

    const closePopup = () => {
        setIsOpen(false)
        setIsEnlarged(false)
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <div
                    className={`w-full flex flex-row items-center p-1 gap-2 border-2 h-10 cursor-pointer rounded-md ${isOpen ? 'border-primary' : ''}  hover:border-primary hover:transition-colors duration-1000 ease-in-out`}>
                    <Brain className={`p-1 my-2 rounded-md ${isOpen ? 'bg-primary text-white' : ''}`} /> Concept
                </div>
            </DialogTrigger>
            <DialogContent
                aria-describedby={undefined}
                className={`p-0 border-0 bg-transparent shadow-none max-w-none ${isEnlarged ? "w-[100vw] h-[100vh]" : "w-[50vw] h-[50vh]"
                    } transition-all duration-300 ease-in-out [&>button]:hidden`}
            >
                <DialogTitle className="sr-only">Concept Preview</DialogTitle>
                <div className="relative w-full h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="absolute top-4 right-6 z-10 flex gap-2">
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm text-purple-600"
                            onClick={toggleSize}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="h-8 w-8 bg-white/90 hover:bg-white shadow-sm text-red-500"
                            onClick={closePopup}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Iframe */}
                    <iframe
                        src={concepturl}
                        className="w-full h-full border-0 rounded-lg"
                        title="Embedded Content"
                        loading="lazy"
                    />
                </div>
            </DialogContent>
        </Dialog>
    )
}
