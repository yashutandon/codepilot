
"use client";

import { ClerkProvider, SignInButton, SignUpButton, useAuth, UserButton } from "@clerk/nextjs";
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ThemeProvider } from "./theme-provider";
import { UnauthView } from "@/features/components/unauth-view";
import AuthLoader from "@/features/components/auth-loader";


const convex = new ConvexReactClient(
    process.env.NEXT_PUBLIC_CONVEX_URL!
)

export const Providers = ({ children }: { children: React.ReactNode }) => {
    return (
        <ClerkProvider>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
            <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    enableSystem
                    disableTransitionOnChange
                >
                    {/* <Authenticated>
                       <UserButton/> */}
                       {children}
                    {/* </Authenticated>
                    <Unauthenticated>
                        <UnauthView/>
                    </Unauthenticated>
                    <AuthLoading>
                       <AuthLoader/>
                    </AuthLoading> */}
                   
                </ThemeProvider>
            </ConvexProviderWithClerk>
        </ClerkProvider>
    )
}