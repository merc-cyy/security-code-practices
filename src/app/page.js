"use client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation'
import getUserID from './fingerprint'

// This is the default page that gets executed when you visit
// http://localhost:3000. This redirects to /home.
export default function GoHome () {
    const router = useRouter();
    // This hook executes when the page renders
    useEffect(() => {
        // Get user ID
        if (!window.localStorage.getItem('userID')) {
            window.localStorage.setItem('userID', getUserID());
        }

        // Redirect to a new page
        router.replace("/home");
    }, [])
}