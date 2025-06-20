const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

const auth = require('./routes/auth');
const loginRouter = require('./routes/login');
const adminLogin = require('./routes/adminlogin');
const supplierRoute = require('./routes/supplier');
const inventoryRoute = require('./routes/inventory');
const authsupplier = require('./middlewares/SupplierAuth')
const recipesRouter = require('./routes/recipes'); 
const cartRoutes = require('./routes/cart'); 
const orderRoute = require('./routes/order')
const userRoute = require('./routes/userProfile');

app.use(express.json());
app.use(cors({
  origin: "https://kitchnix-frontend-72vtrqbv9-devaljain525-gmailcoms-projects.vercel.app",
  credentials: true // if you're using cookies or auth headers
}));

app.use('/api/v1/user', userRoute);
app.use('/api/v1',loginRouter);
app.use('/api/v1',auth);
app.use('/admin', adminLogin);
app.use('/api/v1', recipesRouter);
app.use('/api/v1/cart', cartRoutes); 
app.use('/api/v1/order', orderRoute);
// Public routes
app.use('/', supplierRoute);

// Protected route (access inventory only after login)
app.use('/', inventoryRoute);


app.get('/', (req, res) => {
  res.json({
    msg: "hello there!"
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
