const mongoose = require("mongoose");

const quotationSchema = new mongoose.Schema(
  {
    client_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chambero_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service_description: {
      type: String,
      required: true,
    },
    scheduled_date: {
      type: Date,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected", "offer"],
    },
  },
  {
    timestamps: true,
  }
);

quotationSchema.pre("save", function (next) {
  if (
    this.client_id &&
    typeof this.client_id === "object" &&
    this.client_id._id
  ) {
    this.client_id = this.client_id._id;
  }
  if (
    this.chambero_id &&
    typeof this.chambero_id === "object" &&
    this.chambero_id._id
  ) {
    this.chambero_id = this.chambero_id._id;
  }
  next();
});

module.exports = mongoose.model("Quotation", quotationSchema);
