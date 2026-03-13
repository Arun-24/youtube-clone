import Razorpay from "razorpay";
import crypto from "crypto";
import User from "../Modals/Auth.js";
import nodemailer from "nodemailer";
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/* ---------------- PLAN CONFIG ---------------- */

const PLAN_AMOUNT = {
  BRONZE: 1000,
  SILVER: 5000,
  GOLD: 10000,
};

const PLAN_WATCH_TIME = {
  BRONZE: 420,
  SILVER: 600,
  GOLD: null,
};

/* ---------------- CREATE ORDER ---------------- */

export const createOrder = async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const { plan } = req.body;

    if (!PLAN_AMOUNT[plan]) {
      return res.status(400).json({ message: "Invalid plan selected" });
    }

    const options = {
      amount: PLAN_AMOUNT[plan],
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: "Failed to create order" });
  }
};

/* ---------------- VERIFY PAYMENT + SEND INVOICE ---------------- */

export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      email,
    } = req.body;

    if (!PLAN_WATCH_TIME.hasOwnProperty(plan)) {
      return res.status(400).json({ message: "Invalid plan" });
    }

    const signBody = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(signBody)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    /* ---------- Update User Plan ---------- */

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        plan,
        watchTimeLimit: PLAN_WATCH_TIME[plan],
        planActivatedAt: new Date(),
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    /* ---------- Generate Invoice PDF ---------- */

    const invoiceId = `INV-${Date.now()}`;
    const invoicePath = path.join(
      process.cwd(),
      `invoice-${invoiceId}.pdf`
    );

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(invoicePath));

    doc.fontSize(22).text("YouTube Clone Invoice", { align: "center" });
    doc.moveDown();

    doc.fontSize(14).text(`Invoice ID: ${invoiceId}`);
    doc.text(`Date: ${new Date().toLocaleString()}`);
    doc.text(`Customer Email: ${email}`);
    doc.moveDown();

    doc.text(`Plan Purchased: ${plan}`);
    doc.text(`Amount Paid: ₹${PLAN_AMOUNT[plan] / 100}`);
    doc.text(`Payment ID: ${razorpay_payment_id}`);
    doc.moveDown();

    doc.text("Thank you for upgrading your plan!", {
      align: "center",
    });

    doc.end();

    /* ---------- Send Email with Attachment ---------- */

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Invoice - Plan Upgrade Successful",
      text: "Your invoice is attached.",
      attachments: [
        {
          filename: `Invoice-${invoiceId}.pdf`,
          path: invoicePath,
        },
      ],
    });

    /* Optional: delete file after sending */
    fs.unlinkSync(invoicePath);

    return res.status(200).json({
      message: "Payment verified, plan upgraded, invoice sent",
      plan: updatedUser.plan,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({ message: "Verification failed" });
  }
};