const Job = require("../models/Job");

exports.getAllJobs = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Build query based on user type
    let query = {};
    if (user.user_type === "client") {
      query.client_id = user._id;
    } else if (user.user_type === "chambero") {
      query.chambero_id = user._id;
    }

    // Add status filters if they exist
    if (req.query.status && Array.isArray(req.query.status)) {
      query.status = { $in: req.query.status };
    }

    const jobs = await Job.find(query)
      .populate("quotation_id")
      .populate("client_id", "name email")
      .populate("chambero_id", "name email")
      .sort({ createdAt: -1 });

    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("quotation_id")
      .populate("quotation_id.client_id", "name email")
      .populate("quotation_id.chambero_id", "name email");
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createJob = async (req, res) => {
  const job = new Job(req.body);
  try {
    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.approveJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    const { user_type } = req.body;

    if (user_type === "client") {
      job.client_ok = true;
    } else if (user_type === "chambero") {
      job.chambero_ok = true;
    } else {
      return res.status(400).json({ message: "Invalid user type" });
    }

    // Si ambos han aprobado, actualizar el estado a completado
    if (job.client_ok && job.chambero_ok) {
      job.status = "completed";
    }

    await job.save();

    const updatedJob = await Job.findById(job._id)
      .populate("quotation_id")
      .populate("client_id", "name email")
      .populate("chambero_id", "name email");

    res.json(updatedJob);
  } catch (err) {
    console.error("Error approving job:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });
    res.json({ message: "Job deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
