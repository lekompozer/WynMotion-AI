/**
 * Apple Sign-In Backend API Service
 *
 * Calls ai.wordai.pro API endpoints for Apple Sign-In account management.
 *
 * Endpoints:
 *   POST /api/auth/apple/link          — Link Apple ID to Firebase account
 *   POST /api/auth/apple/revoke        — Revoke Apple refresh token
 *   DELETE /api/auth/account           — Delete entire account (Apple Guideline 5.1.1)
 */

import { wordaiAuth } from '@/lib/wordai-firebase';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://ai.wordai.pro';

async function getAuthToken(): Promise<string> {
    const user = wordaiAuth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return await user.getIdToken(true);
}

// ── Types ────────────────────────────────────────────────────────

export interface AppleLinkResult {
    linked: boolean;
    message: string;
    apple_email?: string;
    merged_from_uid?: string;
}

export interface AppleRevokeResult {
    success: boolean;
    message: string;
}

export interface DeleteAccountResult {
    success: boolean;
    message: string;
    errors?: string[];
}

// ── API Calls ────────────────────────────────────────────────────

/**
 * Link Apple ID to the current Firebase account.
 * Tries Firebase auth first; falls back to sending Apple idToken as Bearer.
 */
export async function linkAppleAccount(
    appleIdToken: string,
    appleRefreshToken?: string,
): Promise<AppleLinkResult> {
    // Try Firebase token first; fall back to Apple idToken if not signed in yet
    let authToken: string;
    try {
        const user = wordaiAuth.currentUser;
        authToken = user ? await user.getIdToken(true) : appleIdToken;
    } catch {
        authToken = appleIdToken;
    }

    const res = await fetch(`${API_BASE}/api/auth/apple/link`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
            apple_id_token: appleIdToken,
            apple_refresh_token: appleRefreshToken ?? null,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || `Link failed (${res.status})`);
    }
    return await res.json();
}

/**
 * Revoke an Apple refresh token.
 */
export async function revokeAppleToken(refreshToken?: string): Promise<AppleRevokeResult> {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/api/auth/apple/revoke`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            refresh_token: refreshToken ?? null,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || `Revoke failed (${res.status})`);
    }
    return await res.json();
}

/**
 * Permanently delete user account and all associated data.
 * Required by Apple App Store Guideline 5.1.1.
 */
export async function deleteAccount(
    appleRefreshToken?: string,
): Promise<DeleteAccountResult> {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE}/api/auth/account`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            apple_refresh_token: appleRefreshToken ?? null,
        }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.message || `Delete account failed (${res.status})`);
    }
    return await res.json();
}
