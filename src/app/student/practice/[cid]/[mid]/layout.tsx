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
import { toast } from "sonner";

const PracticeLayout = ({ children }: { children: React.ReactNode }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const enterFs = () => {
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
            setIsDialogOpen(true);
        }
    };

    // const preventBackNavigation = () => {
    //     window.history.pushState(null, "", window.location.href);
    // };

    // const handlePopState = () => {
    //     window.history.pushState(null, "", window.location.href);
    //     toast.warning("Do not use Gestures!");
    // };

    useEffect(() => {
        checkAndEnableFullscreen();
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        // window.history.pushState(null, "", window.location.href);
        // window.addEventListener("popstate", handlePopState);

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange);
            // window.removeEventListener("popstate", handlePopState);
        };
    }, []);

    return (
        <div className="min-h-screen min-w-screen">
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
                                    Continue
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

export default PracticeLayout;
