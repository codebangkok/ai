import sqlite3
from typing import Any

def find_product(product_name: str) -> Any | None:
    """Find the closest matching product from the catalog based on substring search."""
    with sqlite3.connect("shop.db") as con:
        cur = con.cursor()
        cur.execute("select * from products where product_name like ?", (f"%{product_name}%",))
        result = cur.fetchone()
    return result if result else None

def count_order() -> int:
    """order count"""
    with sqlite3.connect("shop.db") as con:
        cur = con.cursor()
        cur.execute("select count(*) from orders")
        result = cur.fetchone()
    return result[0]

def add_order(product_id:str, customer_id:str, order_quantity:int) -> str:    
    order_id = f"ORD-{count_order() + 1}"

    with sqlite3.connect("shop.db") as con:
        cur = con.cursor()
        cur.execute("insert into orders values(?, ?, ?, ?, 'Processing')", (order_id, product_id, customer_id, order_quantity))
        cur.execute("update products set product_stock=product_stock-? where product_id=?", (order_quantity, product_id,))
        con.commit()
    return order_id

def count_complaint() -> int:
    """complaint count"""
    with sqlite3.connect("shop.db") as con:
        cur = con.cursor()
        cur.execute("select count(*) from complaints")
        result = cur.fetchone()
    return result[0]

def add_complaint(order_id:str, customer_id:str, text:str) -> str:    
    complaint_id = f"CMP-{count_complaint() + 1}"

    with sqlite3.connect("shop.db") as con:
        cur = con.cursor()
        cur.execute("insert into complaints values(?, ?, ?, ?, 'Pending')", (complaint_id, order_id, customer_id, text,))
        con.commit()
    return complaint_id

def get_order(order_id: str) -> Any | None:
    """Find the closest matching product from the catalog based on substring search."""
    with sqlite3.connect("shop.db") as con:
        cur = con.cursor()
        cur.execute("select * from orders where order_id=?", (order_id,))
        result = cur.fetchone()
    return result if result else None

def product_inquiry_tool(product_name: str) -> str:
    """Check product information using product name"""
    product = find_product(product_name)
    if not product:
        return f"Sorry, {product_name} is not available in our catalog."
    
    return f"{product[1]}: Price = ${product[2]}, Stock = {product[3]} units."    

def order_placement_tool(product_name: str, quantity: int = None, customer_id: str = "Guest") -> str:
    """Place order"""
    product = find_product(product_name)
    if not product:
        return f"Sorry, {product_name} is not available."

    if quantity is None:
        return "MISSING_INFO: Please provide the quantity to place your order."

    if product[3] < quantity:
        return f"Only {product[3]} units of {product[1]} are available."
       
    order_id = add_order(product_id=product[0], customer_id=customer_id, order_quantity=quantity)
    
    return f"Order placed successfully! Order ID: {order_id}"

def order_status_tool(order_id: str) -> str:
    """Check order status"""
    order = get_order(order_id=order_id)
    if not order:        
        return "Invalid Order ID."
    
    return f"Order ID: {order_id}, Product: {order[2]}, Quantity: {order[4]}, Status: {order[5]}."

def complaint_registration_tool(order_id: str, complaint_text: str, customer_id: str = "Guest") -> str:
    """Register complaint"""
    order = get_order(order_id=order_id)
    if not order:
        return "Invalid Order ID. Cannot register complaint."

    complaint_id = add_complaint(order_id=order_id, customer_id=customer_id, text=complaint_text)

    return f"Complaint registered successfully! Complaint ID: {complaint_id}"
