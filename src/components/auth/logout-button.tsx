"use client"
import ConfirmLogout from "@/components/auth/confirm-logout"

/**
 * Topbar logout entry — now opens a confirmation dialog first.
 * ConfirmLogout owns the power-icon trigger + the confirm/cancel popup,
 * so the same flow is applied to every role (admin / staff / student)
 * through the shared Topbar.
 */
const LogoutButton = () => {
    return <ConfirmLogout />
}

export default LogoutButton
