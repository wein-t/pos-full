const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();


const PORT = config.port;
connectDB();

// Middlewares
app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:5173',
        'https://metanoia-pos-frontend.vercel.app' // <--- ADDED NEW VERCEL LINK HERE
    ]
}));
app.use(express.json());
app.use(cookieParser());


//Root Endpoint
app.get("/", (req, res) => {
    res.json({
        message: "Hello from POS Server!"
    });
});

// Other Endpoints
app.use("/api/user", require("./routes/userRoutes"));

// ==========================================================
// 🚨 FIX HERE: Changed "/api/order" to "/api/orders"
// This matches your frontend request: /api/orders/bulk-import
// ==========================================================
app.use("/api/orders", require("./routes/orderRoutes")); 

app.use("/api/data", require("./routes/dataRoutes")); 
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));

//Global Error Handler
app.use(globalErrorHandler);

//Server
app.listen(PORT, () => {
    console.log(`☑️  POS Server is listening on port ${PORT}`);
});