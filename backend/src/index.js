import mongoose from 'mongoose';
import { config } from './config.js';
import { createApp } from './app.js';
import { Chunk } from './models/Chunk.js';

await mongoose.connect(config.mongoUri);
await Chunk.init(); // make sure the text index exists
const app = createApp();
app.listen(config.port, () => {
  console.log(`Campus Assist API on http://localhost:${config.port}  (AI: ${config.llm.provider})`);
});
