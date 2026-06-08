from __future__ import annotations


def read_order_status(order_id: str) -> str:
    return f"Order {order_id} is in transit and expected tomorrow."


def search_catalog(query: str) -> str:
    return f"Top catalog match for '{query}': standard replacement part."


def send_email(to: str, subject: str, body: str) -> str:
    return f"Email queued to {to}: {subject}"


def refund_order(order_id: str, amount_usd: float) -> str:
    return f"Refund queued for order {order_id}: ${amount_usd:.2f}"


REGISTERED_TOOLS = {
    "read_order_status": read_order_status,
    "search_catalog": search_catalog,
    "send_email": send_email,
    "refund_order": refund_order,
}

