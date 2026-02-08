export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-blue-500/30">
            <main className="container mx-auto">{children}</main>
        </div>
    );
}
