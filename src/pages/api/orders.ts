// pages/api/orders.ts

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
    const resp = await client.search({
      index: 'orders',
      size: 200,                        // adjust if you have more
      sort: [{ created_at: 'desc' }],   // newest first
      _source: [
        'order_id',
        'country',
        'channel',
        'category',
        'amount',
        'status',
        'created_at',
      ],
    })

    const rows = (resp.hits.hits as any[]).map((h) => ({
      id: h._id,
      ...h._source,
    }))

    res.status(200).json({ total: resp.hits.total?? rows.length, rows })
  } catch (e: any) {
    console.error(e)
    res.status(500).json({ error: e.message })
  }
}
