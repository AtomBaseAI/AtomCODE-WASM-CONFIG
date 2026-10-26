import LogoutButton from "@/components/auth/logout-button"

interface UserSessionProps {
    name: string,
    email: string,
    image: string | null
}

const Topbar = ({ name, email, image }: UserSessionProps) => {

    return (
        <header className="sticky top-0 w-full flex items-center h-20 px-4 sm:px-10 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm z-30">
            <div className="flex flex-shrink-0 items-center ml-auto">
                <button className="inline-flex items-center p-2  rounded-lg">
                    <span className="sr-only">User Menu</span>
                    <div className="hidden md:flex md:flex-col md:items-end md:leading-tight">
                        <span className="font-semibold">{name}</span>
                        <span className="text-sm text-gray-600">{email}</span>
                    </div>
                    <span className="h-12 w-12 ml-2 sm:ml-3 mr-2 rounded-full overflow-hidden shadow-md dark:shadow-primary bg-primary/20">
                        <img src={image === null ? `https://ik.imagekit.io/atominc/academy-mini-bg-z-grad.webp` : `${image}`} alt="user profile photo" className="h-full w-full object-cover" />
                    </span>
                </button>
                <div className="border-l pl-3 ml-3 space-x-1">
                    <LogoutButton />
                </div>
            </div>
        </header>
    )
}

export default Topbar