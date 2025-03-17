const historyController = require("../controllers/historyController")
const historyRoutes = [ { method: "GET", path: "/history", handler: historyController.getAllHistory },]

 module.exports = historyRoutes;