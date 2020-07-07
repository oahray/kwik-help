import app from "./app";
import { PORT } from "./constants/config.constants";

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
