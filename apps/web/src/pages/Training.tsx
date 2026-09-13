import { Link } from "react-router-dom";
import { SquareOneCspLoop } from "@/features/square-one/SquareOneCspLoop";

const Training = () => (
    <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-semibold mb-6">Training</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link
                to="/training/square1-csp"
                className="block rounded-lg border border-foreground/10 overflow-hidden hover:border-foreground/25 hover:bg-foreground/3 transition-colors"
            >
                <SquareOneCspLoop className="h-40 w-full" />
                <div className="p-4">
                    <div className="font-medium">Square-1 CSP</div>
                    <div className="text-sm text-foreground/45">
                        Practice cube shape planning on an interactive Square-1.
                    </div>
                </div>
            </Link>
        </div>
    </div>
);

export default Training;
