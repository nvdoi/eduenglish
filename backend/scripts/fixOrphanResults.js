/* eslint-disable no-console */
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Result from '../src/models/Result.js';
import Course from '../src/models/Course.js';

dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('❌ Missing MONGODB_URI in environment.');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: 'EnglishAI' });
  console.log('✅ Connected to MongoDB');

  const ACTION = process.env.ACTION || 'report'; // 'report' | 'assign' | 'delete'
  const APPLY = String(process.env.APPLY || 'false').toLowerCase() === 'true';
  const TARGET_COURSE_ID = process.env.COURSE_ID || '';

  // 1) Find orphan results
  const nullCourseResults = await Result.find({ $or: [ { courseId: { $exists: false } }, { courseId: null } ] });

  // results that have courseId but that course does not exist
  const resultsWithCourse = await Result.find({ courseId: { $ne: null } }).select('courseId');
  const uniqueIds = [...new Set(resultsWithCourse.map(r => r.courseId?.toString()).filter(Boolean))];
  const existingCourses = await Course.find({ _id: { $in: uniqueIds } }).select('_id');
  const existingSet = new Set(existingCourses.map(c => c._id.toString()));

  const invalidCourseResults = (await Result.find({ courseId: { $ne: null } }))
    .filter(r => !existingSet.has(r.courseId.toString()));

  const totalOrphans = nullCourseResults.length + invalidCourseResults.length;

  console.log('--- Report ---');
  console.log('Null courseId results:', nullCourseResults.length);
  console.log('Invalid courseId results:', invalidCourseResults.length);
  console.log('Total orphan results:', totalOrphans);

  if (ACTION === 'report' || totalOrphans === 0) {
    console.log('ℹ️ ACTION=report or no orphan records. Nothing to do.');
    await mongoose.disconnect();
    return;
  }

  if (ACTION === 'assign') {
    if (!TARGET_COURSE_ID) {
      console.error('❌ ACTION=assign requires COURSE_ID env.');
      await mongoose.disconnect();
      process.exit(1);
    }
    const targetCourse = await Course.findById(TARGET_COURSE_ID);
    if (!targetCourse) {
      console.error('❌ COURSE_ID not found in Course collection.');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`➡️ Reassigning ${totalOrphans} orphan Result(s) to course ${TARGET_COURSE_ID} (${targetCourse.name || targetCourse.title})`);
    if (!APPLY) {
      console.log('🧪 Dry-run (set APPLY=true to apply).');
      await mongoose.disconnect();
      return;
    }

    const idsToFix = [
      ...nullCourseResults.map(r => r._id),
      ...invalidCourseResults.map(r => r._id),
    ];

    const { modifiedCount } = await Result.updateMany(
      { _id: { $in: idsToFix } },
      { $set: { courseId: TARGET_COURSE_ID } }
    );
    console.log(`✅ Updated ${modifiedCount} Result(s).`);
    await mongoose.disconnect();
    return;
  }

  if (ACTION === 'delete') {
    console.log(`🗑️ Deleting ${totalOrphans} orphan Result(s).`);
    if (!APPLY) {
      console.log('🧪 Dry-run (set APPLY=true to apply).');
      await mongoose.disconnect();
      return;
    }

    const idsToDelete = [
      ...nullCourseResults.map(r => r._id),
      ...invalidCourseResults.map(r => r._id),
    ];
    const { deletedCount } = await Result.deleteMany({ _id: { $in: idsToDelete } });
    console.log(`✅ Deleted ${deletedCount} Result(s).`);
    await mongoose.disconnect();
    return;
  }

  console.log(`⚠️ Unknown ACTION=${ACTION}. Use 'report' | 'assign' | 'delete'.`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err);
  mongoose.disconnect().finally(() => process.exit(1));
});
