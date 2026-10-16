import { getCookie } from '@tanstack/react-start/server'
import { verifySigned } from './guard'

export const ADMIN_COOKIE = 'll_admin'
export const requireAdmin = async () => verifySigned(getCookie(ADMIN_COOKIE))
