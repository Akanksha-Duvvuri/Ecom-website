CREATE DATABASE IF NOT EXISTS products;
USE products;

CREATE TABLE IF NOT EXISTS items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(500),
    description TEXT
);

INSERT INTO items (name, price, image, description)
VALUES

("White-shirt", 29.99, "whiteshirt.jpg", "White Plain Shirt"),
("Black-shoes", 59.99, "blackshoes.jpg", "Black shoes"),
("Hoodie", 39.99, "Hoodie.jpg", "Beige-Hoodie"),
("Cap", 9.99, "cap.jpg", "cap"),
("Socks", 19.99, "socks.jpg", "socks");
