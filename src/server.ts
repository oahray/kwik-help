import 'dotenv/config';

import { PORT } from "./constants/config.constants";
import app from "./app";

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
