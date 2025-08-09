'use client'

import { useEffect, useMemo, useState } from 'react'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'
import LinearProgress from '@mui/material/LinearProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'

type Order = {
  id: string
  order_id: string
  country: string
  channel: string
  category: string
  amount: number
  status: 'paid' | 'refunded' | string
  created_at: string
}

export default function OrdersTable() {
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }), [])

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch orders')
        const json = await res.json()
        setRows(json.rows || [])
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <Card sx={{ maxHeight: 375, display: 'flex', flexDirection: 'column' }}>
      <CardHeader title='Recent Orders (Elasticsearch)' subheader='Live data from the orders index' />
      <CardContent sx={{ pt: 0, flex: 1, overflowY: 'auto' }}>
        {loading && <LinearProgress />}

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Box sx={{ overflowX: 'auto' }}>
            <Table size='small' stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Order ID</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align='right'>Amount</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map(r => (
                  <TableRow key={r.id} hover>
                    <TableCell>{r.order_id}</TableCell>
                    <TableCell>{r.country}</TableCell>
                    <TableCell>{r.channel}</TableCell>
                    <TableCell>{r.category}</TableCell>
                    <TableCell align='right'>{currency.format(r.amount)}</TableCell>
                    <TableCell>
                      <Chip
                        label={r.status}
                        size='small'
                        color={r.status === 'paid' ? 'success' : r.status === 'refunded' ? 'warning' : 'default'}
                        variant='outlined'
                      />
                    </TableCell>
                    <TableCell>{new Date(r.created_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}
      </CardContent>
    </Card>
  )
}
