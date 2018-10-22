const inquirer = require("inquirer");
const mysql = require("mysql");
const {table} = require("table");

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "storefront_db"
});

const displayStock = () => {
  
  db.query("SELECT * FROM products", function (err, result) {
    if (err) throw err;
    let data = [["ID", "Product", "Department", "Price ($)", "Inventory"]];
    
    result.forEach(product => {
      let col = [];
      col.push(product.id, product.product_name, product.department_name, product.price, product.stock_quantity);
      data.push(col);
    })
    let output = table(data);
    console.log(output);
  });
}

db.connect(err => {

  if (err) throw err;
  console.log(`Connected on ${db.threadId}.`);
  displayStock();
  // userMenu(); 
});