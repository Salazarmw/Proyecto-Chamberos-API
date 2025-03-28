const mongoose = require('mongoose');
const Job = require('../models/Job');
const Quotation = require('../models/Quotation');
require('dotenv').config();

const updateJobs = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to the database');

    // Get all jobs
    const jobs = await Job.find();
    console.log(`Found ${jobs.length} jobs to update`);

    // Update each job
    for (const job of jobs) {
      // Get associated quotation
      const quotation = await Quotation.findOne({ job: job._id });
      
      if (quotation) {
        // Update the job with the IDs of the client and the chambero
        job.client_id = quotation.client_id;
        job.chambero_id = quotation.chambero_id;
        await job.save();
        console.log(`Job ${job._id} updated successfully`);
      } else {
        console.log(`No quotation found for job ${job._id}`);
      }
    }

    console.log('Update process completed');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateJobs(); 