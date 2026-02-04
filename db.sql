-- ================= USERS =================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  firstname VARCHAR NOT NULL,
  lastname VARCHAR NOT NULL,
  mail VARCHAR NOT NULL,
  picture VARCHAR,
  password VARCHAR NOT NULL
);

-- ================= HOMES =================
CREATE TABLE homes (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL
);

-- ================= PERMISSIONS =================
CREATE TABLE permissions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id),
  home_id INT NOT NULL REFERENCES homes(id),
  type VARCHAR NOT NULL,
  UNIQUE(user_id, home_id)
);

-- ================= CATEGORIES =================
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  home_id INT NOT NULL REFERENCES homes(id),
  name VARCHAR NOT NULL,
  picture VARCHAR NOT NULL
);

CREATE TABLE subcategories (
  id SERIAL PRIMARY KEY,
  category_id INT NOT NULL REFERENCES categories(id),
  name VARCHAR NOT NULL
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  home_id INT NOT NULL REFERENCES homes(id),
  name VARCHAR NOT NULL,
  picture VARCHAR NOT NULL,
  mass INT,
  liquid INT
);

CREATE TABLE subcategories_products (
  id SERIAL PRIMARY KEY,
  subcategory_id INT NOT NULL REFERENCES subcategories(id),
  product_id INT NOT NULL REFERENCES products(id),
  UNIQUE(subcategory_id, product_id)
);

-- ================= STOCK REEL (unités physiques) =================
CREATE TABLE product_batches (
  id SERIAL PRIMARY KEY,
  product_id INT NOT NULL REFERENCES products(id),
  home_id INT NOT NULL REFERENCES homes(id),
  expiration_date DATE
);

CREATE INDEX idx_batches_home_product
  ON product_batches(home_id, product_id);

-- ================= CART (1 par maison) =================
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  home_id INT NOT NULL UNIQUE REFERENCES homes(id)
);

CREATE TABLE carts_products (
  id SERIAL PRIMARY KEY,
  cart_id INT NOT NULL REFERENCES carts(id),
  product_id INT NOT NULL REFERENCES products(id),
  quantity INT NOT NULL DEFAULT 1,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE(cart_id, product_id)
);

-- ================= RECIPES =================
CREATE TABLE recipes (
  id SERIAL PRIMARY KEY,
  home_id INT NOT NULL REFERENCES homes(id),
  name VARCHAR NOT NULL,
  picture VARCHAR NOT NULL,
  prep_time INT NOT NULL,
  recipe TEXT NOT NULL
);

CREATE TABLE recipes_products (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES recipes(id),
  product_id INT NOT NULL REFERENCES products(id),
  quantity_needed INT,
  multipliable BOOLEAN NOT NULL,
  UNIQUE(recipe_id, product_id)
);

-- ================= RECIPE STEPS =================
CREATE TABLE recipe_steps (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES recipes(id),
  step_number INT NOT NULL,
  content TEXT NOT NULL,
  UNIQUE(recipe_id, step_number)
);

-- ================= RECIPE TAGS =================
CREATE TABLE recipe_tags (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE
);

CREATE TABLE recipes_recipe_tags (
  id SERIAL PRIMARY KEY,
  recipe_id INT NOT NULL REFERENCES recipes(id),
  tag_id INT NOT NULL REFERENCES recipe_tags(id),
  UNIQUE(recipe_id, tag_id)
);
