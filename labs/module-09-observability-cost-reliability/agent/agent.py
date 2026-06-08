from __future__ import annotations


def web_search(query: str) -> str:
    return f"Search result for '{query}': check the help-center article before escalating."


def run(user_message: str, user_id: str = "lab-user") -> str:
    if "policy" in user_message.lower() or "warranty" in user_message.lower():
        return web_search(user_message)
    return "I can help with order status, returns, warranties, and basic troubleshooting."

