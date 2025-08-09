import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: process.env.ELASTICSEARCH_NODE,
  auth: {
    username: process.env.ELASTICSEARCH_USERNAME as string,
    password: process.env.ELASTICSEARCH_PASSWORD as string,
  },
})

export default async function handler(req: any, res: any) {
  try {
    const kpis = await client.search({
      index: 'orders',
      size: 0,
      aggs: {
        by_status: { terms: { field: 'status' }, aggs: { amount_sum: { sum: { field: 'amount' } } } },
        total_orders: { value_count: { field: 'order_id' } },
      },
    })

    const ts = await client.search({
      index: 'orders',
      size: 0,
      query: { range: { created_at: { gte: 'now-7d/d', lte: 'now' } } },
      aggs: {
        by_day: { date_histogram: { field: 'created_at', calendar_interval: 'day' }, aggs: { revenue: { sum: { field: 'amount' } } } }
      },
    })

    const buckets: any[] = (kpis.aggregations as any).by_status.buckets
    const paid = buckets.find(b => b.key === 'paid') ?? { amount_sum: { value: 0 } }
    const refunded = buckets.find(b => b.key === 'refunded') ?? { amount_sum: { value: 0 } }

    res.status(200).json({
      kpis: {
        totalOrders: (kpis.aggregations as any).total_orders.value,
        paidAmount: paid.amount_sum.value,
        refundedAmount: refunded.amount_sum.value,
        profit: paid.amount_sum.value - refunded.amount_sum.value,
      },
      timeseries: (ts.aggregations as any).by_day.buckets.map((b: any) => ({ date: b.key_as_string, revenue: b.revenue.value })),
    })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}
