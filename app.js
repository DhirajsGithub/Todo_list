const express = require("express");
const app = express();
const bodyParse = require("body-parser");
app.use(bodyParse.urlencoded({ extended: true }));

const lodash = require("lodash")

// creating our own modules and importing in our main app
const date = require(__dirname + "/date.js");

app.use("*/css", express.static("public/css"));

// const port = 5500;

// -------------------------------
// use a mongoose model in todo 


const mongoose = require("mongoose");
// const url = "mongodb://localhost:27017/todoListDB";
// const url = "mongodb+srv://Mycluster:Mongodb@123.in@cluster0.djouu.mongodb.net/todoListDB";
const url = "mongodb+srv://Mycluster:Zr4OtBueKECR5UUX@cluster0.djouu.mongodb.net/todoListDB";
mongoose.connect(url, { useNewUrlParser: true });
// Making a Schema for todoList
const todoListSchema = new mongoose.Schema({
  name: String,
});
// Making a collection/model
const Item = mongoose.model("Item", todoListSchema);
// items in a colloction name Item
const item1 = new Item({
  name: "Welcome to your to do list",
});
const item2 = new Item({
  name: "Hit a + button to add a new item",
});
const item3 = new Item({
  name: "<--- Hit this to delete an item",
});
const defaultItems = [item1, item2, item3];

// --------------------------------

// for EJS
app.set("view engine", "ejs");

// storing all the new list items over here
// let items = ["Buy Food", "Cook Food", "Eat Food"]
// storing the Work Items
// let workItems = [];

app.get("/", (req, res) => {
  let fullDay = date.formatedDate();
  let year = date.formatedYear();
  // res.render('list.ejs', {listTitle: fullDay, newListItems: items, year: year})
  Item.find({}, (err, foundItems) => {
    // checking if defaultItemes are exist in data base or not
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("items added successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list.ejs", {
        listTitle: fullDay,
        newListItems: foundItems,
        year: year,
      });
    }
  });
});



const listSchema = {
    name: String,
    items: [todoListSchema]         
}
// makign a collection of list // items will be a user will enter dynamically
const List = mongoose.model("List", listSchema)

// Express route paramters. Dynamic routes
app.get("/:customListName", (req, res)=>{
    const customListName = lodash.capitalize(req.params.customListName);
    // preventing to save duplicate list as we don't need Home Home two times
    List.findOne({name: customListName}, (err, foundItem)=>{
        if(!err){
            if(!foundItem){
                // create a new list
                const list = new List({
                    name: customListName,         // e.g. Home
                    items: defaultItems           // list items in Home
                })    
                list.save();
                // don't get hanged out 
                res.redirect("/"+customListName)
            }else{
                let year = date.formatedYear();
                // show an existing list
                res.render("list.ejs",{
                    listTitle: foundItem.name,
                    newListItems: foundItem.items,
                    year: year,
                  }); 
                // console.log(foundItem)
            }
        }
    })  

    


})

// adding items to Item collection
app.post("/", (req, res) => {
  const itemName = req.body.newItem;

  let fullDay = date.formatedDate();
  let year = date.formatedYear();
  // storing the itemName to specific root
  const listName = req.body.list;
  // list is the name of name and it's value is <%= listTitle %> which is passed as fullDay

  const item = new Item({
    name: itemName
})

  if (listName == fullDay){
    item.save();
    // this will help to redirect to the home directly after item.save() page will be loading for long time hence res.redirect
    res.redirect("/")
    
  }else{
    List.findOne({name : listName}, (err, foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName)
    })
  }


});
 

app.get("/about", (req, res) => {
  let year = date.formatedYear();
  res.render("about.ejs", { year: year });
});

app.post("/delete", (req, res)=>{

  let fullDay = date.formatedDate();
  let year = date.formatedYear();
    // req.body.name     --> (name from form name)
    const checkedItemId = req.body.checkName
    const listName = req.body.listName;
    if (listName == fullDay){
    // console.log(checkedItemId)
    // in mongoose we have findByIdAndRemove methd
    // need to provide call back by mongoose documentation 
    Item.findByIdAndRemove(checkedItemId, (err)=>{
      if(err){
          console.log(err)
      }else{
          console.log('item deleted successfully')
          res.redirect("/")
      }
  })
    }else{
      // deleting an item from an array using it's id
      // https://www.mongodb.com/docs/manual/reference/operator/update/pull/
      List.findOneAndUpdate({name: listName},{$pull : {items: {_id:checkedItemId}}},(err, foundList)=>{
        if(!err){
          res.redirect("/"+listName);
        }
      })
    }


})


// heroku port
let port = process.env.PORT;
if (port == null || port == "") {
  port = 5500;
}

app.listen(port, () => {
  console.log("listening to the port " + port);
});
