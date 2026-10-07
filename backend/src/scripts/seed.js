import { getDatabase, seedDatabase } from '../config/db.js';

console.log("🔄 Resetting and reseeding database...");
const db = getDatabase();
seedDatabase(db);
console.log("🎉 Database seeding completed successfully!");
