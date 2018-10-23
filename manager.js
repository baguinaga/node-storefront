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

const managerMenu = () => {

  inquirer.prompt([{
    type: "list",
    name: "menuChoice",
    message: "Welcome. Which functionality would you like to access?",
    choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
  }]).then(response => {
    (response.menuChoice === "View Products for Sale") ? displayInventory():
      (response.menuChoice === "View Low Inventory") ? console.log("placeholder") :
      console.log("end")
  });
}

const displayInventory = () => {

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
    managerMenu();
  })
}

db.connect(err => {
  if (err) throw err;
  console.log("Connected to database.\n");
  managerMenu();
});