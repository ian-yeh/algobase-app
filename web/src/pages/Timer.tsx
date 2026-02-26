const TimerPage = () => {
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">Timer</h1>
            <div className="bg-slate-900 border border-slate-800 p-12 rounded-xl flex flex-col items-center justify-center min-h-[400px]">
                <div className="text-8xl font-mono mb-8 text-white">0.00</div>
                <p className="text-slate-400 text-lg italic">Press Space to Start</p>
            </div>
        </div>
    );
}

export default TimerPage;
