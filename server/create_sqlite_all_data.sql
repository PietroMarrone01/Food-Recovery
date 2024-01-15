BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "users" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "email" TEXT,
    "name" TEXT,
    "salt" TEXT,
    "hash" TEXT
);

CREATE TABLE IF NOT EXISTS "restaurants" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "address" TEXT,
    "phone_number" TEXT,
    "cuisine_type" TEXT,
    "food_category" TEXT
);

CREATE TABLE IF NOT EXISTS "packages" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "restaurant_id" INTEGER,
    "restaurant_name" TEXT, 
    "surprise_package" INTEGER, /* BOOLEAN field, 0 for normal_package, 1 for surprise_package, */
    "content" TEXT,
    "price" REAL, 
    "size" TEXT,
    "start_time" DATE, /* l'ora di inizio prelievo */
    "end_time" DATE, /* l'ora di fine prelievo */
    "availability" INTEGER /* BOOLEAN field, 0 for false, 1 for true */
);

CREATE TABLE IF NOT EXISTS "bookings" (
    "id" INTEGER PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER,
    "package_ids" TEXT /* Nuovo campo per memorizzare gli id dei pacchetti della prenotazione */ 
);
INSERT INTO "users" VALUES (1,'enrico@test.com','Enrico', '123348dusd437840', 'bddfdc9b092918a7f65297b4ba534dfe306ed4d5d72708349ddadb99b1c526fb'); /* password='pwd' */
INSERT INTO "users" VALUES (2,'luigi@test.com','Luigi',   '7732qweydg3sd637', '498a8d846eb4efebffc56fc0de16d18905714cf12edf548b8ed7a4afca0f7c1c');
INSERT INTO "users" VALUES (3,'alice@test.com','Alice',   'wgb32sge2sh7hse7', '09a79c91c41073e7372774fcb114b492b2b42f5e948c61d775ad4f628df0e160');
INSERT INTO "users" VALUES (4,'harry@test.com','Harry',   'safd6523tdwt82et', '330f9bd2d0472e3ca8f11d147d01ea210954425a17573d0f6b8240ed503959f8');
INSERT INTO "users" VALUES (5,'carol@test.com','Carol',   'ad37JHUW38wj2833', 'bbbcbac88d988bce98cc13e4c9308306d621d9e278ca62aaee2d156f898a41dd');

INSERT INTO "restaurants" VALUES (1, 'Panificio del Gusto', 'Via del Pane 123', '+39 123 456 7890', 'Italiana', 'Panificio');
INSERT INTO "restaurants" VALUES (2, 'Pizzeria Margherita', 'Via Napoli 456', '+39 987 654 3210', 'Italiana', 'Pizzeria');
INSERT INTO "restaurants" VALUES (3, 'Pizzeria Vesuvio', 'Corso Pizza 789', '+39 456 789 0123', 'Italiana', 'Pizzeria');
INSERT INTO "restaurants" VALUES (4, 'Fruttivendolo Bio', 'Piazza della Frutta 456', '+39 345 678 9012', 'Frutta e Verdura', 'Fruttivendolo');
INSERT INTO "restaurants" VALUES (5, 'Sushi Fusion', 'Via Sushi 789', '+39 567 890 1234', 'Giapponese', 'Sushi');
INSERT INTO "restaurants" VALUES (6, 'Dolci Tentazioni', 'Largo dei Dolci 012', '+39 789 012 3456', 'Italiana', 'Pasticceria');

-- Panificio del Gusto
INSERT INTO "packages" VALUES (1, 1, 'Panificio del Gusto', 0, '[{"name": "Cornetto", "quantity": 2}, {"name": "Cappuccino", "quantity": 1}, {"name": "Macchiato", "quantity": 1}]', 12.99, 'Piccola', '2024-01-25 10:30:00', '2024-01-25 17:00:00', 1);
INSERT INTO "packages" VALUES (2, 1, 'Panificio del Gusto', 1, NULL, 19.99, 'Grande', '2024-01-25 08:00:00', '2024-01-25 17:00:00', 1);

-- Pizzeria Margherita
INSERT INTO "packages" VALUES (3, 2, 'Pizzeria Margherita', 0, '[{"name": "Pizza Margherita", "quantity": 1}, {"name": "Insalata Caprese", "quantity": 1}, {"name": "Panino con wurstel", "quantity": 1}]', 14.99, 'Media', '2024-01-25 02:00:00', '2024-01-25 05:00:00', 1);
INSERT INTO "packages" VALUES (4, 2, 'Pizzeria Margherita', 0, '[{"name": "Pizza Pepperoni", "quantity": 1}, {"name": "Calzone", "quantity": 1}, {"name": "Tiramisù", "quantity": 1}, {"name": "Insalata Caprese", "quantity": 1}, {"name": "Marinara", "quantity": 1}]', 24.99, 'Grande', '2024-01-25 18:00:00', '2024-01-25 21:00:00', 1);
INSERT INTO "packages" VALUES (5, 2, 'Pizzeria Margherita', 1, NULL, 29.99, 'Grande', '2024-01-25 12:00:00', '2024-01-25 19:00:00', 1);

-- Pizzeria Vesuvio
INSERT INTO "packages" VALUES (6, 3, 'Pizzeria Vesuvio', 0, '[{"name": "Vesuvio Special", "quantity": 1}, {"name": "Bruschetta", "quantity": 2}, {"name": "Marinara", "quantity": 1}, {"name": "Pane", "quantity": 3}]', 16.99, 'Media', '2024-01-25 00:00:00', '2024-01-25 04:00:00', 1);
INSERT INTO "packages" VALUES (7, 3, 'Pizzeria Vesuvio', 0, '[{"name": "Family Pizza", "quantity": 2}, {"name": "Insalata di Rucola", "quantity": 1}, {"name": "Crostata di Frutta", "quantity": 1}, {"name": "Ciccio", "quantity": 1}]', 32.99, 'Grande', '2024-01-25 07:30:00', '2024-01-25 17:00:00', 1);
INSERT INTO "packages" VALUES (8, 3, 'Pizzeria Vesuvio', 1, NULL, 39.99, 'Piccola', '2024-01-25 12:00:00', '2024-01-25 23:30:00', 1);

-- Fruttivendolo Bio
INSERT INTO "packages" VALUES (9, 4, 'Fruttivendolo Bio', 0, '[{"name": "Fruit Basket", "quantity": 3}, {"name": "Yogurt Biologico", "quantity": 2}, {"name": "Banane", "quantity": 2}, {"name": "Albicocche", "quantity": 2}]', 18.99, 'Media', '2024-01-25 09:00:00', '2024-01-25 18:00:00', 1);
INSERT INTO "packages" VALUES (10, 4, 'Fruttivendolo Bio', 1, NULL, 22.99, 'Grande', '2024-01-25 08:00:00', '2024-01-25 23:30:00', 1);
INSERT INTO "packages" VALUES (11, 4, 'Fruttivendolo Bio', 1, NULL, 12.99, 'Piccolo', '2024-01-25 03:00:00', '2024-01-25 09:00:00', 1);
INSERT INTO "packages" VALUES (12, 4, 'Fruttivendolo Bio', 0, '[{"name": "Veggie Delight", "quantity": 2}, {"name": "Insalata di Frutta", "quantity": 1}, {"name": "Mele", "quantity": 2}, {"name": "Pere", "quantity": 2}]', 25.99, 'Grande', '2024-01-25 18:00:00', '2024-01-25 21:00:00', 1);

-- Sushi Fusion
INSERT INTO "packages" VALUES (13, 5, 'Sushi Fusion', 0, '[{"name": "Sushi Assortito", "quantity": 15}, {"name": "Miso Soup", "quantity": 1}, {"name": "Dragon Roll", "quantity": 1}, {"name": "Tempura Udon", "quantity": 1}, {"name": "Edamame", "quantity": 1}]', 35.99, 'Media', '2024-01-25 19:00:00', '2024-01-25 21:30:00', 1);

-- Dolci Tentazioni
INSERT INTO "packages" VALUES (14, 6, 'Dolci Tentazioni', 0, '[{"name": "Dolce al Cioccolato", "quantity": 2}, {"name": "Tiramisù", "quantity": 1}]', 21.99, 'Piccola', '2024-01-25 20:00:00', '2024-01-25 22:00:00', 1);
INSERT INTO "packages" VALUES (15, 6, 'Dolci Tentazioni', 1, NULL, 29.99, 'Grande', '2024-01-25 16:00:00', '2024-01-25 23:30:00', 1);
INSERT INTO "packages" VALUES (16, 6, 'Dolci Tentazioni', 1, NULL, 19.99, 'Medio', '2024-01-25 00:00:00', '2024-01-25 04:00:00', 1);
INSERT INTO "packages" VALUES (17, 6, 'Dolci Tentazioni', 0, '[{"name": "Chocolate Lover Pack", "quantity": 3}, {"name": "Panna Cotta", "quantity": 1}]', 26.99, 'Medio', '2024-01-25 18:30:00', '2024-01-25 20:00:00', 1);
INSERT INTO "packages" VALUES (18, 6, 'Dolci Tentazioni', 1, NULL, 9.99, 'Piccolo', '2024-01-25 00:00:00', '2024-01-25 04:00:00', 1);
INSERT INTO "packages" VALUES (19, 6, 'Dolci Tentazioni', 0, '[{"name": "Chocolate Lover Pack", "quantity": 3}, {"name": "Panna Cotta", "quantity": 2}, {"name": "Biscotti", "quantity": 3}, {"name": "Tiramisù", "quantity": 1}]', 36.99, 'Grande', '2024-01-25 18:30:00', '2024-01-25 20:00:00', 1);

COMMIT;
