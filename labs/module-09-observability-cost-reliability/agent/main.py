from __future__ import annotations

from fastapi import FastAPI
from pydantic import BaseModel

from .agent import run

app = FastAPI(title="Module 09 Customer Support Agent")


class ChatRequest(BaseModel):
    message: str
    user_id: str = "lab-user"


class ChatResponse(BaseModel):
    message: str


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest) -> ChatResponse:
    return ChatResponse(message=run(request.message, request.user_id))

