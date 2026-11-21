import { Order } from '../models/Order.js';
import { OrderActivity } from '../models/OrderActivity.js';
import { Quotation } from '../models/Quotation.js';

const generateOrderNumber = async () => {
  const count = await Order.countDocuments();
  const year = new Date().getFullYear();
  return `PC-ORD-${year}-${String(count + 5001).padStart(5, '0')}`;
};

export const createOrderFromQuotation = async (req, res) => {
  try {
    const { quotationId, shippingAddress, paymentMethod = 'invoice' } = req.body;

    if (!quotationId) {
      return res.status(400).json({ success: false, message: 'Quotation reference is required' });
    }

    const quotation = await Quotation.findById(quotationId);
    if (!quotation) {
      return res.status(404).json({ success: false, message: 'Quotation not found' });
    }

    // Verify ownership
    if (quotation.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Must be accepted
    if (quotation.status !== 'accepted' && quotation.status !== 'quotation_prepared' && quotation.status !== 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Order can only be placed on an authorized or accepted quotation.',
      });
    }

    // If not marked accepted yet, update it
    if (quotation.status !== 'accepted') {
      quotation.status = 'accepted';
      await quotation.save();
    }

    const orderNumber = await generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customer: req.user._id,
      quotation: quotation._id,
      design: quotation.design,
      configurationSnapshot: quotation.configurationSnapshot,
      quantity: quotation.quantity,
      confirmedUnitPrice: quotation.pricingSnapshot.unitCost,
      subtotal: quotation.pricingSnapshot.subtotal,
      taxAmount: quotation.pricingSnapshot.taxAmount,
      shippingAmount: quotation.adminAdjustments?.adjustedShipping || quotation.pricingSnapshot.shippingEstimate,
      totalAmount: quotation.pricingSnapshot.totalAmount,
      shippingAddress: shippingAddress || {
        fullName: quotation.customerDetails.name,
        company: quotation.customerDetails.businessName,
        street: quotation.customerDetails.deliveryLocation.address || '120 Innovation Way',
        city: quotation.customerDetails.deliveryLocation.city || 'Austin',
        state: 'TX',
        postalCode: quotation.customerDetails.deliveryLocation.postalCode || '78701',
        country: quotation.customerDetails.deliveryLocation.country || 'USA',
        phone: quotation.customerDetails.phone,
      },
      paymentStatus: paymentMethod === 'credit_card' ? 'paid' : 'invoiced',
      status: 'order_placed',
    });

    // Record initial activity log
    await OrderActivity.create({
      order: order._id,
      previousStatus: 'none',
      newStatus: 'order_placed',
      actor: {
        name: req.user.name,
        role: req.user.role,
        userId: req.user._id,
      },
      notes: 'Customer submitted confirmed order from Quotation ' + quotation.quotationNumber,
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.user._id })
      .populate('quotation')
      .populate('design')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name email companyName phone')
      .populate('quotation')
      .populate('design');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const activities = await OrderActivity.find({ order: order._id }).sort({ timestamp: 1 });

    res.json({ success: true, data: { order, activities } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: list all orders
export const adminGetOrders = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
        { 'shippingAddress.company': { $regex: search, $options: 'i' } },
      ];
    }

    const orders = await Order.find(query)
      .populate('customer', 'name email companyName phone')
      .populate('quotation')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: update order status with activity tracking
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { status, notes, trackingNumber, carrier, paymentStatus, estimatedShipDate } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const prevStatus = order.status;

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (carrier) order.carrier = carrier;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (estimatedShipDate) order.estimatedShipDate = new Date(estimatedShipDate);

    await order.save();

    // Log activity if status changed or notes provided
    if (status && status !== prevStatus) {
      await OrderActivity.create({
        order: order._id,
        previousStatus: prevStatus,
        newStatus: status,
        actor: {
          name: req.user.name,
          role: 'admin',
          userId: req.user._id,
        },
        notes: notes || `Production workflow status transitioned from ${prevStatus} to ${status}.`,
      });
    }

    const activities = await OrderActivity.find({ order: order._id }).sort({ timestamp: 1 });

    res.json({ success: true, data: { order, activities } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
