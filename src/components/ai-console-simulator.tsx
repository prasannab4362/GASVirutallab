"use client";

import { useState, useEffect, useRef } from "react";
import { Play, RotateCcw, Cpu, Network, CheckCircle, Database, CpuIcon } from "lucide-react";

type Tab = "train" | "rag";

export default function AIConsoleSimulator() {
  const [activeTab, setActiveTab] = useState<Tab>("train");
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentEpoch, setCurrentEpoch] = useState(0);
  const [loss, setLoss] = useState<number[]>([]);
  const [accuracy, setAccuracy] = useState<number[]>([]);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [ragStep, setRagStep] = useState(0);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs, ragStep]);

  // Handle Tab switches
  const handleTabChange = (tab: Tab) => {
    if (isSimulating) return;
    setActiveTab(tab);
    resetSimulator();
  };

  const resetSimulator = () => {
    setIsSimulating(false);
    setCurrentEpoch(0);
    setLoss([]);
    setAccuracy([]);
    setConsoleLogs([]);
    setRagStep(0);
  };

  const startTrainingSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setConsoleLogs(["[System] Initializing training backend...", "[System] Loading ResNet34 model weights..."]);
    setLoss([]);
    setAccuracy([]);
    setCurrentEpoch(0);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    await sleep(800);
    setConsoleLogs((prev) => [...prev, "[Data] Dataset: MNIST Digit Database loaded (60,000 samples)."]);
    await sleep(600);
    setConsoleLogs((prev) => [...prev, "[CUDA] Loaded model parameters on GPU Tesla T4."]);
    await sleep(600);
    setConsoleLogs((prev) => [...prev, "[System] Beginning epoch updates..."]);

    const epochs = 5;
    const finalLosses = [0.85, 0.42, 0.21, 0.11, 0.05];
    const finalAccuracies = [72.4, 88.1, 93.5, 96.8, 98.9];

    for (let e = 1; e <= epochs; e++) {
      await sleep(1000);
      setCurrentEpoch(e);
      setLoss((prev) => [...prev, finalLosses[e - 1]]);
      setAccuracy((prev) => [...prev, finalAccuracies[e - 1]]);
      setConsoleLogs((prev) => [
        ...prev,
        `Epoch ${e}/5: [==============================] - loss: ${finalLosses[e - 1].toFixed(4)} - accuracy: ${finalAccuracies[e - 1]}% - val_loss: ${(finalLosses[e - 1] * 1.15).toFixed(4)}`,
      ]);
    }

    await sleep(500);
    setConsoleLogs((prev) => [
      ...prev,
      "[System] Training completed successfully!",
      "[System] Saved checkpoint to 'checkpoints/resnet34_gas_latest.pt'.",
      "[System] Validation accuracy reached 98.9% (Passed threshold check).",
    ]);
    setIsSimulating(false);
  };

  const startRagSimulation = async () => {
    if (isSimulating) return;
    setIsSimulating(true);
    setConsoleLogs(["[RAG] Initiating retrieval pipeline..."]);
    setRagStep(1);

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    await sleep(800);
    setConsoleLogs((prev) => [
      ...prev,
      `User query received: "How do we verify a certificate?"`,
    ]);
    setRagStep(2);
    await sleep(1000);

    setConsoleLogs((prev) => [
      ...prev,
      "[Embed] Generating 384-dimensional query embedding...",
      "[Vector DB] Querying Pinecone Vector Index with cosine similarity...",
    ]);
    setRagStep(3);
    await sleep(1200);

    setConsoleLogs((prev) => [
      ...prev,
      "[Search Results] Match found: 'GAS_Verification_Module.txt' (Score: 0.982)",
      "[Search Results] Match found: 'Certificate_Manual_2026.pdf' (Score: 0.814)",
      "[LLM] Injection of relevant text chunks into generative prompt...",
      "[LLM] Prompt synthesis with Context: 'Each graduate has a unique identifier...'",
    ]);
    setRagStep(4);
    await sleep(1400);

    setConsoleLogs((prev) => [
      ...prev,
      `[LLM Response]: "You can instantly verify any graduate's certificate by copying and entering their unique ID (e.g. GAS-2026-ALEX-0089) directly on the landing page interface to fetch credential details from our database."`,
      "[RAG] Pipeline executed successfully in 24ms.",
    ]);
    setRagStep(5);
    setIsSimulating(false);
  };

  // Render simulated Python code for Training tab
  const renderTrainCode = () => (
    <pre className="font-mono text-xs leading-relaxed text-zinc-300 overflow-x-auto select-none">
      <code>
        <span className="text-emerald-400">import</span> torch<br />
        <span className="text-emerald-400">import</span> torch.nn <span className="text-emerald-400">as</span> nn<br />
        <br />
        <span className="text-zinc-500"># 1. Initialize neural backbone</span><br />
        <span className="text-emerald-400">class</span> <span className="text-yellow-300">GASNet</span>(nn.Module):<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-emerald-400">def</span> <span className="text-blue-300">__init__</span>(self):<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;super().__init__()<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;self.backbone = nn.Sequential(<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nn.Linear(<span className="text-orange-300">784</span>, <span className="text-orange-300">256</span>),<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nn.ReLU(),<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;nn.Linear(<span className="text-orange-300">256</span>, <span className="text-orange-300">10</span>)<br />
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;)<br />
        <br />
        <span className="text-zinc-500"># 2. Run Backpropagation loop</span><br />
        model = GASNet().to(<span className="text-pink-300">"cuda"</span>)<br />
        optimizer = torch.optim.Adam(model.parameters(), lr=<span className="text-orange-300">1e-3</span>)<br />
        criterion = nn.CrossEntropyLoss()
      </code>
    </pre>
  );

  // Render simulated TS code for RAG tab
  const renderRagCode = () => (
    <pre className="font-mono text-xs leading-relaxed text-zinc-300 overflow-x-auto select-none">
      <code>
        <span className="text-emerald-400">import</span> &#123; Pinecone &#125; <span className="text-emerald-400">from</span> <span className="text-pink-300">"@pinecone-database/pinecone"</span>;<br />
        <br />
        <span className="text-emerald-400">export async function</span> <span className="text-blue-300">queryPipeline</span>(query: <span className="text-yellow-300">string</span>) &#123;<br />
        &nbsp;&nbsp;<span className="text-zinc-500">// Embed user input queries</span><br />
        &nbsp;&nbsp;<span className="text-emerald-400">const</span> embeddings = <span className="text-emerald-400">await</span> getEmbeddings(query);<br />
        <br />
        &nbsp;&nbsp;<span className="text-zinc-500">// Run vector database cosine index lookup</span><br />
        &nbsp;&nbsp;<span className="text-emerald-400">const</span> docs = <span className="text-emerald-400">await</span> pinecone.Index(<span className="text-pink-300">"gas-ai"</span>).query(&#123;<br />
        &nbsp;&nbsp;&nbsp;&nbsp;vector: embeddings,<br />
        &nbsp;&nbsp;&nbsp;&nbsp;topK: <span className="text-orange-300">3</span>,<br />
        &nbsp;&nbsp;&nbsp;&nbsp;includeMetadata: <span className="text-emerald-400">true</span><br />
        &nbsp;&nbsp;&#125;);<br />
        <br />
        &nbsp;&nbsp;<span className="text-zinc-500">// Synthesize text chunks with Generator LLM</span><br />
        &nbsp;&nbsp;<span className="text-emerald-400">return</span> <span className="text-emerald-400">await</span> generateResponse(query, docs);<br />
        &#125;
      </code>
    </pre>
  );

  return (
    <div className="w-full bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col min-h-[460px] text-left">
      {/* Editor Header Bar */}
      <div className="bg-zinc-950 px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/80" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <span className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        
        {/* Workspace Tab selectors */}
        <div className="flex bg-zinc-900/60 p-0.5 rounded-lg border border-zinc-800">
          <button
            onClick={() => handleTabChange("train")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "train"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            train.py
          </button>
          <button
            onClick={() => handleTabChange("rag")}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === "rag"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            rag_pipeline.ts
          </button>
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
          <Cpu className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          <span className="hidden sm:inline">CUDA Dev: Tesla T4</span>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="p-5 flex-1 flex flex-col md:flex-row gap-5 overflow-hidden">
        {/* Left Side: Code Editor Workspace */}
        <div className="flex-1 bg-zinc-950/65 rounded-2xl p-4 border border-zinc-800 relative flex flex-col justify-between overflow-hidden">
          <div className="overflow-y-auto">
            {activeTab === "train" ? renderTrainCode() : renderRagCode()}
          </div>

          {/* Action triggers */}
          <div className="mt-4 pt-3.5 border-t border-zinc-800 flex items-center justify-between gap-3 flex-wrap">
            <button
              onClick={activeTab === "train" ? startTrainingSimulation : startRagSimulation}
              disabled={isSimulating}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/10 disabled:opacity-50 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isSimulating ? "Running..." : activeTab === "train" ? "Train Model" : "Deploy RAG"}</span>
            </button>
            
            <button
              onClick={resetSimulator}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white transition-all text-xs font-semibold flex items-center justify-center shrink-0 cursor-pointer"
              title="Reset Console"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Simulation Console */}
        <div className="w-full md:w-56 bg-zinc-950/80 rounded-2xl p-4 border border-zinc-800 flex flex-col overflow-hidden relative">
          
          {/* Simulation View for Training Model */}
          {activeTab === "train" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Metrics</span>
                <span className="text-xs font-mono font-bold text-emerald-400">Epoch {currentEpoch}/5</span>
              </div>

              {/* Accuracy & Loss Charts / Metrics */}
              <div className="py-4 space-y-4 flex-1 flex flex-col justify-center">
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-500 font-medium">Model Accuracy</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {accuracy.length > 0 ? `${accuracy[accuracy.length - 1]}%` : "0.0%"}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500 shadow-[0_0_8px_#10b981]"
                      style={{ width: `${accuracy.length > 0 ? accuracy[accuracy.length - 1] : 0}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-zinc-500 font-medium">Training Loss</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {loss.length > 0 ? loss[loss.length - 1].toFixed(4) : "0.0000"}
                    </span>
                  </div>
                  {/* Visual simulated loss graph using lightweight SVG */}
                  <div className="h-16 w-full bg-zinc-900/60 border border-zinc-800 rounded-xl relative overflow-hidden flex items-end">
                    {loss.length > 0 ? (
                      <svg className="w-full h-full text-emerald-500" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          points={loss
                            .map((val, idx) => {
                              const x = (idx / 4) * 100;
                              const y = 90 - (val / 0.9) * 80;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                        />
                        {/* Glow path */}
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="6"
                          strokeOpacity="0.2"
                          points={loss
                            .map((val, idx) => {
                              const x = (idx / 4) * 100;
                              const y = 90 - (val / 0.9) * 80;
                              return `${x},${y}`;
                            })
                            .join(" ")}
                        />
                      </svg>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-zinc-600 font-mono">
                        Awaiting training...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <Network className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] text-zinc-400 font-mono">
                  {isSimulating ? "Running SGD optimizer" : "GPU Idle"}
                </span>
              </div>
            </div>
          )}

          {/* Simulation View for RAG querying */}
          {activeTab === "rag" && (
            <div className="flex-1 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Node Map</span>
                <span className="text-xs font-mono font-bold text-emerald-400">
                  {ragStep === 0 ? "Awaiting Pipeline" : ragStep === 5 ? "Synced" : "Tracing..."}
                </span>
              </div>

              {/* Graphical Trace flow of RAG node elements */}
              <div className="py-4 flex-1 flex flex-col justify-around relative">
                {/* Visual node stack */}
                <div className="flex flex-col items-center gap-3 relative z-10">
                  {/* User query Node */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      ragStep >= 1 ? "bg-zinc-800 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <CheckCircle className={`w-3 h-3 ${ragStep >= 1 ? "text-emerald-500" : "text-zinc-600"}`} />
                    User Input
                  </div>

                  {/* Embedding Vector Space Node */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      ragStep >= 2 ? "bg-zinc-800 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <CpuIcon className={`w-3 h-3 ${ragStep >= 2 ? "text-emerald-500 animate-pulse" : "text-zinc-600"}`} />
                    Embed Model
                  </div>

                  {/* Vector Index Node */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      ragStep >= 3 ? "bg-zinc-800 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <Database className={`w-3 h-3 ${ragStep >= 3 ? "text-emerald-500" : "text-zinc-600"}`} />
                    Vector Index
                  </div>

                  {/* LLM Generator Node */}
                  <div
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-semibold transition-all ${
                      ragStep >= 4 ? "bg-zinc-800 border-emerald-500 text-white" : "bg-zinc-900 border-zinc-800 text-zinc-500"
                    }`}
                  >
                    <CheckCircle className={`w-3 h-3 ${ragStep >= 4 ? "text-emerald-500" : "text-zinc-600"}`} />
                    LLM Synthesis
                  </div>
                </div>

                {/* Animated connectors */}
                {ragStep > 0 && (
                  <div className="absolute inset-0 flex justify-center pointer-events-none">
                    <div className="w-0.5 bg-zinc-800 h-[80%] absolute top-[10%] -z-10" />
                    {/* Glowing animated bullet running down the pipe */}
                    {ragStep < 5 && (
                      <div
                        className="w-1.5 h-1.5 bg-emerald-400 rounded-full absolute shadow-[0_0_8px_#10b981] animate-ping"
                        style={{
                          top: `${(ragStep / 5) * 85}%`,
                          transition: "top 0.5s ease-in-out",
                        }}
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Status footer */}
              <div className="flex items-center gap-2 pt-2 border-t border-zinc-800">
                <Database className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-[10px] text-zinc-400 font-mono">Latency: 24ms</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shared Stdout Logs Console Panel */}
      <div className="bg-zinc-950 border-t border-zinc-800 h-28 p-4 font-mono text-[10px] text-zinc-400 overflow-y-auto flex flex-col gap-1 select-none">
        {consoleLogs.length === 0 ? (
          <span className="text-zinc-600 italic">Console output terminal initialized. Click "Train Model" or "Deploy RAG" to execute pipelines.</span>
        ) : (
          consoleLogs.map((log, index) => {
            let color = "text-zinc-400";
            if (log.startsWith("[System]")) color = "text-blue-400";
            if (log.startsWith("[CUDA]")) color = "text-yellow-500";
            if (log.startsWith("[Data]") || log.startsWith("[Embed]")) color = "text-purple-400";
            if (log.startsWith("[RAG]") || log.startsWith("[Vector DB]")) color = "text-emerald-400 animate-pulse";
            if (log.startsWith("Epoch")) color = "text-white";
            if (log.includes("completed") || log.includes("successfully")) color = "text-green-400 font-bold";
            if (log.includes("[LLM Response]")) color = "text-white font-medium bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800 my-1 block leading-relaxed";

            return (
              <div key={index} className={`${color} leading-relaxed`}>
                {log}
              </div>
            );
          })
        )}
        {/* Animated flashing command cursor */}
        {isSimulating && (
          <div className="flex items-center gap-1 mt-1 text-emerald-400">
            <span className="w-1.5 h-3 bg-emerald-500 animate-pulse" />
            <span className="text-[9px] font-semibold text-zinc-500 italic">Processing GPU pipeline execution stream...</span>
          </div>
        )}
        <div ref={consoleEndRef} />
      </div>
    </div>
  );
}
