import cors from "cors";
import express from "express";
import { routes } from "./src/routes/index.js";
import { registerScraperCron } from "./src/scraper/scheduler.js";

// Create the Express app and choose the port it should run on.
const app = express();
const PORT = process.env.PORT || 3000;

// Allow the server to read JSON request
app.use(express.json());

// Allow cross-origin requests from the frontend
app.use(cors());

// Register all API routes from the routes file.
app.use(routes);

// Start the scheduled scraper job while the backend is running.
registerScraperCron();

// Start listening for incoming requests.
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});
