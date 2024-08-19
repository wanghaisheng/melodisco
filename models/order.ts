import { Order } from "@/types/order";
import { getDb } from "@/models/db";
import { Prisma } from "@prisma/client";

export async function insertOrder(order: Order) {
  const prisma = getDb();
  const res = await prisma.orders.create({
    data: {
      order_no: order.order_no,
      created_at: order.created_at,
      user_uuid: order.user_uuid,
      user_email: order.user_email,
      amount: order.amount,
      plan: order.plan,
      expired_at: order.expired_at,
      order_status: order.order_status,
      credits: order.credits,
      currency: order.currency,
    }
  });

  return res;
}

export async function findOrderByOrderNo(
  order_no: string
): Promise<Order | undefined> {
  const prisma = getDb();
  const res = await prisma.orders.findUnique({
    where: { order_no: order_no }
  });

  return res ? formatOrder(res) : undefined;
}

export async function updateOrderStatus(
  order_no: string,
  order_status: number,
  paied_at: string
) {
  const prisma = getDb();
  const res = await prisma.orders.update({
    where: { order_no },
    data: {
      order_status,
      paied_at
    }
  });

  return res;
}

export async function updateOrderSession(
  order_no: string,
  stripe_session_id: string
) {
  const prisma = getDb();
  const res = await prisma.orders.update({
    where: { order_no },
    data: { stripe_session_id }
  });

  return res;
}

export async function getUserOrders(
  user_uuid: string
): Promise<Order[] | undefined> {
  const now = new Date();
  const prisma = getDb();
  const res = await prisma.orders.findMany({
    where: {
      user_uuid,
      order_status: 2,
      expired_at: { gte: now }
    }
  });

  if (res.length === 0) {
    return undefined;
  }

  return res.map(formatOrder);
}

function formatOrder(row: Prisma.ordersGetPayload<{}>): Order {
  const order: Order = {
    order_no: row.order_no,
    created_at: row.created_at.toISOString(),
    user_uuid: row.user_uuid,
    user_email: row.user_email,
    amount: row.amount,
    plan: row.plan ?? '',
    expired_at: row.expired_at?.toISOString() ?? '',
    order_status: row.order_status,
    paied_at: row.paied_at?.toISOString(),
    stripe_session_id: row.stripe_session_id ?? undefined,
    credits: row.credits,
    currency: row.currency ?? '',
  };

  return order;
}