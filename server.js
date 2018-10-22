const inquirer = require("inquirer");
const mysql = require("mysql");
const {
  table
} = require("table");

const db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "",
  database: "storefront_db"
});

const displayStock = () => {

  db.query("SELECT * FROM products", function (err, inventory) {
    if (err) throw err;
    let data = [
      ["ID", "Product", "Department", "Price ($)", "Inventory"]
    ];

    inventory.forEach(product => {
      let col = [];
      col.push(product.id, product.product_name, product.department_name, product.price, product.stock_quantity);
      data.push(col);
    })
    let output = table(data);
    console.log(output);
    purchaseById();
  })
}

const purchaseById = () => {

  inquirer.prompt([{
    type: "input",
    name: "id",
    message: "Please enter the ID of the item you would like to purchase:",
    default: "1",
    validate: (answer) => (!isNaN(answer)) ? true : false
  }]).then(purchase => {
    checkInventory(purchase);
  });
}

const checkInventory = (purchase) => {
  db.query("SELECT * FROM products WHERE id = ?", purchase.id, (err, item) => {
    if (err) throw err;
    if (item === []) {
      console.log("Sorry, that item does not exist in our inventory.");
      purchaseById();
    } else {
      if (item.stock_quantity === 0) {
        console.log("Sorry, that itme is out of stock.")
      } else {
        updateInventory();
      }
    }
  })
}

db.connect(err => {

  if (err) throw err;
  console.log("Connected to database.");
  displayStock();
});