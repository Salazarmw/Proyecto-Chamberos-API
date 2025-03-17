const Quotation = require('../models/Quotation');
const Job = require('../models/Job');

exports.getAllQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().populate('client_id chambero_id');
    res.json(quotations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getQuotationById = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('client_id chambero_id');
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createQuotation = async (req, res) => {
  const quotation = new Quotation(req.body);
  try {
    const newQuotation = await quotation.save();
    res.status(201).json(newQuotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuotation = async (req, res) => { //update a quotation in general
  try {
    const quotation = await Quotation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json(quotation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateQuotationStatus = async (req, res) => { //update a quotation status
  try {
    const { status } = req.body;
    const quotation = await Quotation.findById(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

    quotation.status = status;
    await quotation.save();

    // if status is 'aprobado', create a new Job
    if (status === 'aprobado') {
      const job = new Job({
        quotation_id: quotation._id,
        status: 'in_progress',
        client_ok: 'false',
        chambero_ok: 'false',
      });
      await job.save();
      return res.status(201).json({ message: 'Quotation approved and Job created', job });
    }

    res.json({ message: `Quotation status updated to ${status}`, quotation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) return res.status(404).json({ message: 'Quotation not found' });
    res.json({ message: 'Quotation deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};