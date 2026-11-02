import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Code Playground – CodePilot AI",
  description:
    "Write, compile, and run code in 16+ languages including C, C++, Java, Rust, Python, Go, and more - directly in your browser.",
};

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
