import { Link } from "react-router-dom";
import { SquareOneCspLoop } from "@/features/square-one/SquareOneCspLoop";
import { StaticCube } from "@/features/three-by-three/StaticCube";

const THUMBNAIL_SCRAMBLE = "R U F' L2 D B' R2 U' F2 L D2";

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
            <Link
                to="/training/3bld"
                className="block rounded-lg border border-foreground/10 overflow-hidden hover:border-foreground/25 hover:bg-foreground/3 transition-colors"
            >
                <StaticCube sequence={THUMBNAIL_SCRAMBLE} className="h-40 w-full" />
                <div className="p-4">
                    <div className="font-medium">3BLD Tracing</div>
                    <div className="text-sm text-foreground/45">
                        Practice tracing Old Pochmann edge and corner cycles.
                    </div>
                </div>
            </Link>
            <Link
                to="/training/3bld-memo"
                className="block rounded-lg border border-foreground/10 overflow-hidden hover:border-foreground/25 hover:bg-foreground/3 transition-colors"
            >
                <div className="h-40 w-full flex items-center justify-center gap-4 font-mono text-3xl font-semibold tracking-widest text-foreground/25">
                    <span>AB</span>
                    <span>CD</span>
                </div>
                <div className="p-4">
                    <div className="font-medium">Letter Memo</div>
                    <div className="text-sm text-foreground/45">
                        Memorize random Speffz letter pairs and recall the full sequence.
                    </div>
                </div>
            </Link>
        </div>
    </div>
);

export default Training;
