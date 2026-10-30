import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { config } from '../src/config.js';
import { User } from '../src/models/User.js';
import { Document } from '../src/models/Document.js';
import { Chunk } from '../src/models/Chunk.js';
import { ingestDocument } from '../src/routes/documents.js';
import { sampleDocs } from './sampleDocs.js';

await mongoose.connect(config.mongoUri);
await Chunk.init();

const adminEmail = config.adminEmails[0] || 'admin@college.edu';
let admin = await User.findOne({ email: adminEmail });
if (!admin) {
  admin = await User.create({
    name: 'Campus Admin',
    email: adminEmail,
    passwordHash: await bcrypt.hash('Admin@12345', 10),
    role: 'admin',
  });
  console.log(`Created admin  ${adminEmail}  /  Admin@12345   (change this password!)`);
}

let added = 0;
for (const d of sampleDocs) {
  if (await Document.findOne({ title: d.title })) continue;
  await ingestDocument({ ...d, filename: 'sample.txt', uploadedBy: admin._id });
  added++;
}
console.log(`Sample documents added: ${added}`);
await mongoose.disconnect();
