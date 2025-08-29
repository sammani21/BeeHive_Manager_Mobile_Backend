// app.js

const express = require('express');
const mongoose = require('mongoose');
const env = require("dotenv");
const cors = require('cors');
const errorHandler = require('./middlewares/ErrorHandler');
const bodyParser = require('body-parser');
//const authRoutes = require('./routes/auth.route');
const beekeeperRoute = require('./routes/beekeeper.route');
const issueRoute = require('./routes/issue.route');
const chatRoutes = require('./routes/chatRoutes');
const hiveRoutes = require('./routes/hiveRoutes');
const productRoutes = require('./routes/productRoute');
const recommendationRoutes = require('./routes/recommendationRoutes');
const taskRoutes = require('./routes/tasks'); 
const cookieParser = require('cookie-parser');
//const recommendationRoutes = require('./routes/recommendation.route');
//const insightRoutes = require('./routes/insight.route');
//const cookieParser = require('cookie-parser');
env.config();



// Connect to MongoDB
//console.log(process.env.MONGO_URL)
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch((er) => console.log(er));

 /*'mongodb://localhost:27017/passenger-db', {
  /*useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,*/

  const app = express();

  app.use(cors());

  app.use(express.urlencoded({ extended: true }));

  app.use(cookieParser());

// Middleware
app.use(bodyParser.json());
app.use(express.json());
//app.use(cookieParser());

// Routes
//app.use('/auth', authRoutes);
app.use("/api/v1/beekeeper", beekeeperRoute);
app.use("/api/v1/issue", issueRoute);
app.use('/api/v1/chat', chatRoutes);
app.use('/api/v1/hive', hiveRoutes);
app.use('/api/v1/product', productRoutes);
app.use('/api/v1/recommendations', recommendationRoutes);
app.use('/api/v1/tasks', taskRoutes); 
//app.use('/api/v1/recommendations', recommendationRoutes);
//app.use('/api/v1/insights', insightRoutes);

// Start the server
//const PORT = process.env.PORT || 3000;
app.listen(process.env.PORT, () => {
    console.log(`[server]: Server is running at http://localhost:${process.env.PORT}`);
  });
