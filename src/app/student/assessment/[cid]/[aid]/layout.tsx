"use client";
import { enterFullscreen, fullscreenCheck } from "@/hooks/fullscreen";
import { useEffect, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
    ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { AlertTriangle } from "lucide-react";

const AssessmentLayout = ({ children }: { children: React.ReactNode }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const enterFs = () => {
        
        console.log('started')
        enterFullscreen(document.documentElement);
        setIsDialogOpen(false);
    };

    const handleFullscreenChange = () => {
        if (!fullscreenCheck()) {
            setIsDialogOpen(true);
        }
    };

    const checkAndEnableFullscreen = () => {
        if (!fullscreenCheck()) {
            console.log('checked')
            setIsDialogOpen(true);
        }
    };
    useEffect(() => {
        checkAndEnableFullscreen();
        document.addEventListener("fullscreenchange", handleFullscreenChange);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
        };
    }, []);
    return (
        <div className="min-h-screen min-w-screen overflow-hidden">
            <ContextMenu>
                <ContextMenuTrigger>
                    {children}
                    <AlertDialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen} >
                        <AlertDialogContent onEscapeKeyDown={(e) => e.preventDefault()}>
                            <AlertDialogTitle className="w-full text-center text-red-500">
                                Warning !
                            </AlertDialogTitle>
                            <AlertDialogHeader>
                                <AlertDialogDescription className="flex flex-col gap-4 justify-center items-center my-8">
                                    <AlertTriangle className="text-yellow-500" />
                                    Do not exit Fullscreen mode.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="flex flex-grow justify-center items-center">
                                <AlertDialogAction
                                    className="w-full bg-yellow-500 hover:bg-yellow-500/80"
                                    onClick={enterFs}
                                >
                                    Goto Fullscreen
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </ContextMenuTrigger>
                <ContextMenuContent>
                    <ContextMenuItem>Help ?</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

        </div>
    );
};

export default AssessmentLayout;
