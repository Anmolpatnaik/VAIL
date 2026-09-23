"""
VAIL 2.0 — AI Virtual Lab Demonstrator API Router
Blueprint Reference: AI Assistant / Virtual Demonstrator

Provides an intelligent endpoint for lab guidance, formula calculations,
and optional LLM / local Ollama model bridging.
"""

import os
from typing import Optional, Dict, Any
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    query: str
    experiment_id: str = "rc"
    active_tab: str = "experiment"
    live_values: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    status: str
    type: str
    response: str
    experiment_id: str
    suggestions: list[str]

@router.post("/chat", response_model=ChatResponse)
async def assistant_chat(req: ChatRequest):
    """
    Intelligent Virtual Lab Demonstrator endpoint.
    Handles calculations, procedural guidance, diagnostics, and viva questions.
    """
    q = req.query.lower().strip()
    exp = req.experiment_id.lower()
    live = req.live_values or {}

    # Check for OpenAI or Ollama environment integration
    openai_key = os.getenv("OPENAI_API_KEY")
    if openai_key:
        try:
            # Optional LLM completion if key is provided
            import urllib.request
            import json

            system_prompt = (
                f"You are the VAIL Virtual Engineering Laboratory Demonstrator for the '{exp}' experiment. "
                f"The student is currently on the '{req.active_tab}' tab. "
                f"Active simulation values: {json.dumps(live)}. "
                "Provide concise, mathematically rigorous, pedagogy-focused physics explanations."
            )
            data = json.dumps({
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": req.query}
                ],
                "temperature": 0.3,
                "max_tokens": 400
            }).encode("utf-8")

            request = urllib.request.Request(
                "https://api.openai.com/v1/chat/completions",
                data=data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {openai_key}"
                }
            )
            with urllib.request.urlopen(request, timeout=10) as res:
                res_data = json.loads(res.read().decode())
                llm_text = res_data["choices"][0]["message"]["content"]
                return ChatResponse(
                    status="success",
                    type="LLM_GENERATED",
                    response=llm_text,
                    experiment_id=exp,
                    suggestions=[
                        "Calculate my theoretical values",
                        "Explain key sources of error",
                        "Ask me a viva question"
                    ]
                )
        except Exception as e:
            # Fall back to deterministic engine on network/auth error
            pass

    # Server-side Deterministic Physics Response
    if "calc" in q or "tau" in q or "formula" in q or "gain" in q:
        if exp == "rc":
            r = float(live.get("res", 1000))
            c = float(live.get("cap", 1000)) * 1e-6
            tau = r * c
            resp_text = (
                f"**RC Transient Analysis Calculation**:\n"
                f"- Resistance R = {r} Ω\n"
                f"- Capacitance C = {float(live.get('cap', 1000))} μF\n"
                f"- **Theoretical Time Constant τ** = R × C = {tau:.3f} s\n"
                f"- Steady state (5τ) is reached around {5*tau:.2f} s."
            )
        elif exp == "opamp":
            rin = float(live.get("rin", 10000))
            rf = float(live.get("rf", 100000))
            gain = -(rf / rin)
            resp_text = (
                f"**Op-Amp Inverting Mode Calculation**:\n"
                f"- Inverting Gain A_v = -R_f / R_in = -({rf}/{rin}) = {gain:.2f}\n"
                f"- Output signal has 180° phase inversion relative to input."
            )
        else:
            resp_text = f"Calculations for {exp.upper()} are ready. Please check your slider parameters."

        return ChatResponse(
            status="success",
            type="CALCULATION",
            response=resp_text,
            experiment_id=exp,
            suggestions=["Explain procedure", "What is the physical meaning?", "Ask viva question"]
        )

    # General Demonstrator Guidance
    return ChatResponse(
        status="success",
        type="DEMONSTRATOR_GUIDE",
        response=(
            f"VAIL Virtual Demonstrator ready for **{exp.upper()}**. "
            f"You are currently viewing the **{req.active_tab}** stage. "
            "Feel free to ask about circuit wiring, mathematical derivations, or viva exam questions."
        ),
        experiment_id=exp,
        suggestions=["How to connect circuit?", "What is time constant τ?", "Ask me a viva question"]
    )
