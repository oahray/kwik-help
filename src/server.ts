import 'dotenv/config';

import { PORT } from "./constants/config";
import DB from "./config/mongodb"
import app from "./app";

new DB();

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
