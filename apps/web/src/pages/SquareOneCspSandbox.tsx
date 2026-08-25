import { Link } from "react-router-dom";
import SquareOne from "@/components/square-one";

const SquareOneCspSandbox = () => (
    <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto py-10 px-4">
            <Link to="/training/square1-csp" className="text-sm text-foreground/45 hover:text-foreground mb-6 inline-block">
                &larr; Back to Square-1 CSP
            </Link>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Square-1 CSP Sandbox</h1>
                <Link to="/training/square1-csp/recall" className="text-sm text-foreground/45 hover:text-foreground">
                    Quiz &rarr;
                </Link>
            </div>
            <SquareOne className="h-[36rem] w-full rounded-xl overflow-hidden relative border border-foreground/10" />
        </div>
    </div>
);

export default SquareOneCspSandbox;
