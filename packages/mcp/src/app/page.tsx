export default function Home() {
    return (
        <div className="grid min-h-screen items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 items-center sm:items-start">
                <h1 className="text-4xl font-bold text-center sm:text-left">
                    TechGear MCP Server
                </h1>
                <p className="text-lg text-center sm:text-left max-w-2xl">
                    This is the TechGear MCP server for headphone recommendations.
                    The MCP endpoint is available at <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">/mcp</code>.
                </p>
                <div className="flex flex-col gap-4 w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold">Available Widgets</h2>
                    <ul className="list-disc list-inside space-y-2">
                        <li>
                            <a
                                href="/widgets/headphones"
                                className="text-blue-600 dark:text-blue-400 hover:underline"
                            >
                                Headphones Widget
                            </a>{" "}
                            - Browse and filter headphones
                        </li>
                    </ul>
                </div>
                <div className="flex flex-col gap-4 w-full max-w-2xl">
                    <h2 className="text-2xl font-semibold">Testing</h2>
                    <p>
                        To test this MCP server, use the MCPJam inspector from the
                        playground package or connect it to ChatGPT in developer mode.
                    </p>
                </div>
            </main>
        </div>
    );
}

