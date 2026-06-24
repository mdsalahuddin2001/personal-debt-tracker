import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongoose";
import { Contact } from "@/models/contact";
import { Transaction } from "@/models/transaction";

// The admin user who should own all pre-existing (unowned) data.
const ADMIN_ID = process.env.BACKFILL_OWNER_ID || "6a372927af451ad095016ac8";

/**
 * One-time, idempotent migration: assigns `owner = ADMIN_ID` to every contact
 * and transaction that has no owner yet. Re-running is safe — the
 * `{ owner: { $exists: false } }` filter matches nothing once backfilled, and
 * nothing is ever deleted or reassigned.
 */
async function run() {
  await connectDB();

  const contacts = await Contact.updateMany(
    { owner: { $exists: false } },
    { $set: { owner: ADMIN_ID } }
  );
  const transactions = await Transaction.updateMany(
    { owner: { $exists: false } },
    { $set: { owner: ADMIN_ID } }
  );

  console.log(`✓ Backfilled owner=${ADMIN_ID}`);
  console.log(`  Contacts updated:     ${contacts.modifiedCount}`);
  console.log(`  Transactions updated: ${transactions.modifiedCount}`);

  const orphanContacts = await Contact.countDocuments({
    owner: { $exists: false },
  });
  const orphanTxns = await Transaction.countDocuments({
    owner: { $exists: false },
  });
  console.log(
    `  Remaining unowned — contacts: ${orphanContacts}, transactions: ${orphanTxns}`
  );
}

run()
  .catch((err) => {
    console.error("✗ Backfill failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
