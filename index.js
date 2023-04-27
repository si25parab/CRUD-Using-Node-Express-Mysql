const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();
const port = 3000;


//set views file
// app.set('views', path.join(__dirname, 'views'));

// middleware to parse JSON data
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "crud",
  multipleStatements: true,
});

connection.connect((err) => {
  if (!err) console.log("Connection Established Successfully");
  else console.log("Connection Failed!" + JSON.stringify(err, undefined, 2));
});


app.get("/", (req, res) => {
  res.render("home");
});


app.get("/products", (req, res) => {
  // res.send('CRUD Operation using NodeJS / ExpressJS / MySQL');
  let sql = "SELECT * FROM products";
  let query = connection.query(sql, (err, rows) => {
    if (err) throw err;
    // let resultsPerPage = 10;
    // let noOfResults = rows.length;
    //   let numberOfPages = Math.ceil(noOfResults / resultsPerPage);
    // let page = req.query.page ? Number(req.query.page) : 1; 
    // if (page > numberOfPages) {
    //   res.redirect("../?page=" + encodeURIComponent(numberOfPages));
    // } else {
    //   res.redirect("products/?page=" + encodeURIComponent(1));
    // }
      res.render("index", {
        title: "PRODUCTS",
        users: rows,
        category: rows,
      }); 
  });
});


app.get("/delete/:id", (req, res) => {
  const id = req.params.id;
  let sql = `delete FROM products where ProductId=${id}`;
  let query = connection.query(sql, (err, rows) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.get("/remove/:id", (req, res) => {
  const id = req.params.id;
  let sql = `delete FROM categories where CategoryId=${id}`;
  let query = connection.query(sql, (err, rows) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.get("/change/:id", (req, res) => {
  const id = req.params.id;
  let sql = `select * FROM categories where CategoryId=${id}`;
  let query = connection.query(sql, (err, rows) => {
    if (err) throw err;
    res.render("editCategory", {
      title: "Update Category",
      user: rows[0]
    });
});
});

app.get("/edit/:id", (req, res) => {
  const id = req.params.id;
  let sql = `Select * from products where ProductId = ${id}`;
  let query = connection.query(sql, (err, result) => {
    if (err) throw err;
    res.render("editProduct", {
      title: "Update the Product",
      user: result[0]
    });
  });
});


app.post("/update", (req, res) => {
  const Id = req.body.ProductId;
  let sql =
    "update products SET ProductName='" +
    req.body.ProductName +
    "',  CategoryName='" +
    req.body.CategoryName +
    "', CategoryId ='" +
    req.body.CategoryId +
    "' where ProductId =" +
    Id;
  let query = connection.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// updateCategory;
app.post("/modify", (req, res) => {
  const Id = req.body.CategoryId;
  const name = req.body.CategoryName;
  let sql = `update categories set CategoryName = '${name}'  where CategoryId=${Id}`;
  let query = connection.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
});
 

// get all categories with pagination
app.get("/categories", (req, res) => {
  const pageSize = req.query.pageSize || 10; // default page size is 10
  const page = req.query.page || 1; // default page is 1
  const offset = (page - 1) * pageSize;
  const sql = `SELECT * FROM categories LIMIT ${pageSize} OFFSET ${offset}`;
  let query = connection.query(sql, (err, rows) => {
    if (err) throw err;
    res.render("categories", {
      title: "CATEGORIES",
      category: rows,
    });
  });
});


app.get("/categories/:id", (req, res) => {
  const id = req.params.id;
  const sql = `SELECT * FROM products where CategoryId=${id}`;
  // res.send(sql)
  let query = connection.query(sql, (err, rows) => {
    if (err) throw err;
    res.render("index", {
      title: "Related Products",
      users: rows,
      
    });
  });
});

;
// add a new category
app.post("/categories", (req, res) => {
  const { categoryId, categoryName } = req.body;
  const sql = `INSERT INTO categories (CategoryId, CategoryName) VALUES (${categoryId}, '${categoryName}')`;
  connection.query(sql, (error, results) => {
    if (error) throw error;
    res.send("Category added successfully");
  });
});
// /categories/delete/6
app.post("/categories/delete/:id", (req, res) => {
  const id = req.params.id;
  let sql = `delete FROM categories where CategoryId=${id}`;
  let query = connection.query(sql, (err, rows) => {
    if (err) throw err;
    res.redirect("/");
  });
});
// get all products with pagination, including category name and category id
app.get("/products", (req, res) => {
  const pageSize = req.query.pageSize || 10; // default page size is 10
  const page = req.query.page || 1; // default page is 1
  const offset = (page - 1) * pageSize;
  const sql = `SELECT products.ProductId, products.ProductName, categories.CategoryId, categories.CategoryName
               FROM products INNER JOIN categories ON products.CategoryId = categories.CategoryId
               LIMIT ${pageSize} OFFSET ${offset}`;
  connection.query(sql, (error, results) => {
    if (error) throw error;
    res.send(results);
  });
});

// add a new product
app.post("/products", (req, res) => {
  const { productId, productName, categoryId } = req.body;
  const sql = `INSERT INTO products (ProductId, ProductName, CategoryId) VALUES (${productId}, '${productName}', ${categoryId})`;
  connection.query(sql, (error, results) => {
    if (error) throw error;
    res.send("Product added successfully");
  });
});

app.get("/add/product/", (req, res) => {
  res.render("addProduct", {
    title: "Add Product",
  });
});

app.get("/add/category/", (req, res) => {
  res.render("addCategory", {
    title: "Add Category",
  });
});

app.post("/save", (req, res) => {
    let data = {
      ProductName: req.body.ProductName,
      CategoryName: req.body.CategoryName,
      CategoryId: req.body.CategoryId,
    };
    // console.log(req)
    // INSERT INTO categories(CategoryId,CategoryName) values(${data.CategoryId},'${data.CategoryName}');INSERT INTO categories(CategoryId,CategoryName) values(${data.CategoryId},'${data.CategoryName}');
    let sql = `INSERT INTO products SET ?`;
    let query = connection.query(sql, data, (err, results) => {
      if (err) throw err;
      res.redirect("/");
    });
});

app.post("/save/category", (req, res) => {
  let data = {
    CategoryName: req.body.CategoryName,
    CategoryId: req.body.CategoryId,
  };
  // console.log(req)
  // INSERT INTO categories(CategoryId,CategoryName) values(${data.CategoryId},'${data.CategoryName}');INSERT INTO categories(CategoryId,CategoryName) values(${data.CategoryId},'${data.CategoryName}');
  let sql = `INSERT INTO categories(CategoryId,CategoryName) values(${data.CategoryId},'${data.CategoryName}')`;
  let query = connection.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
