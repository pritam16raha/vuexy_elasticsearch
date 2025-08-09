import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid, { GridProps } from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import { ApexOptions } from 'apexcharts'
import Icon from 'src/@core/components/icon'
import CustomAvatar from 'src/@core/components/mui/avatar'
import CustomChip from 'src/@core/components/mui/chip'
import OptionsMenu from 'src/@core/components/option-menu'
import ReactApexcharts from 'src/@core/components/react-apexcharts'

import { useEffect, useState } from 'react'
import { hexToRGBA } from 'src/@core/utils/hex-to-rgba'

const StyledGrid = styled(Grid)<GridProps>(({ theme }) => ({
  [theme.breakpoints.up('sm')]: {
    paddingTop: '0 !important'
  }
}))

const AnalyticsEarningReports = () => {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string | null>(null)
  const [earnings, setEarnings] = useState(0)
  const [profit, setProfit] = useState(0)
  const [expense, setExpense] = useState(0)
  const [chartSeries, setChartSeries] = useState<number[]>([])

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/metrics')
        if (!res.ok) throw new Error('Failed to load metrics')
        const json = await res.json()
        const e = json.kpis.paidAmount || 0
        const x = json.kpis.refundedAmount || 0
        const p = json.kpis.profit || (e - x)

        setEarnings(e)
        setExpense(x)
        setProfit(p)
        setChartSeries(json.timeseries?.map((d: any) => d.revenue) || [])
      } catch (e: any) {
        setErr(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const options: ApexOptions = {
    chart: { parentHeightOffset: 0, toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, distributed: true, columnWidth: '42%', endingShape: 'rounded', startingShape: 'rounded' } },
    legend: { show: false },
    tooltip: { enabled: false },
    dataLabels: { enabled: false },
    colors: [
      hexToRGBA(theme.palette.primary.main, 0.16),
      hexToRGBA(theme.palette.primary.main, 0.16),
      hexToRGBA(theme.palette.primary.main, 0.16),
      hexToRGBA(theme.palette.primary.main, 0.16),
      hexToRGBA(theme.palette.primary.main, 1),
      hexToRGBA(theme.palette.primary.main, 0.16),
      hexToRGBA(theme.palette.primary.main, 0.16)
    ],
    states: { hover: { filter: { type: 'none' } }, active: { filter: { type: 'none' } } },
    grid: { show: false, padding: { top: -28, left: -9, right: -10, bottom: -12 } },
    xaxis: {
      axisTicks: { show: false }, axisBorder: { show: false },
      categories: ['Mo','Tu','We','Th','Fr','Sa','Su'],
      labels: { style: { fontSize: '14px', colors: theme.palette.text.disabled, fontFamily: theme.typography.fontFamily } }
    },
    yaxis: { show: false }
  }

  const series = [{ data: chartSeries.length ? chartSeries.slice(-7) : [0,0,0,0,0,0,0] }]

  const rows = [
    { title: 'Earnings', stats: `$${earnings.toFixed(2)}`, progress: 64, avatarIcon: 'tabler:currency-dollar' },
    { title: 'Profit',   stats: `$${profit.toFixed(2)}`,   progress: 59, avatarIcon: 'tabler:chart-pie-2', avatarColor: 'info',  progressColor: 'info' },
    { title: 'Expense',  stats: `$${expense.toFixed(2)}`,  progress: 22, avatarIcon: 'tabler:brand-paypal', avatarColor: 'error', progressColor: 'error' },
  ]

  if (loading) return <Card><CardContent>Loading…</CardContent></Card>
  if (err)      return <Card><CardContent>Failed: {err}</CardContent></Card>

  return (
    <Card>
      <CardHeader
        sx={{ pb: 0 }}
        title='Earning Reports'
        subheader='Weekly Earnings Overview'
        subheaderTypographyProps={{ sx: { mt: '0 !important' } }}
        action={<OptionsMenu options={['Last Week','Last Month','Last Year']} iconButtonProps={{ size:'small', sx:{ color:'text.disabled' } }} />}
      />
      <CardContent>
        <Grid container spacing={6}>
          <StyledGrid item sm={5} xs={12} sx={{ display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'flex-end' }}>
            <Box sx={{ mb:3, rowGap:1, columnGap:2.5, display:'flex', flexWrap:'wrap', alignItems:'center' }}>
              <Typography variant='h4'>${earnings.toFixed(0)}</Typography>
              <CustomChip rounded size='small' skin='light' color='success' label='+4.2%' />
            </Box>
            <Typography variant='body2'>You informed of this week compared to last week</Typography>
          </StyledGrid>
          <StyledGrid item xs={12} sm={7}>
            <ReactApexcharts type='bar' height={160} series={series} options={options} />
          </StyledGrid>
        </Grid>

        <Box sx={{ mt: 6, borderRadius: 1, p: theme.spacing(4,5), border: `1px solid ${theme.palette.divider}` }}>
          <Grid container spacing={6}>
            {rows.map((item, idx) => (
              <Grid item xs={12} sm={4} key={idx}>
                <Box sx={{ mb: 2.5, display:'flex', alignItems:'center' }}>
                  <CustomAvatar skin='light' variant='rounded' color={item.avatarColor as any} sx={{ mr:2, width:26, height:26 }}>
                    <Icon fontSize='1.125rem' icon={item.avatarIcon} />
                  </CustomAvatar>
                  <Typography sx={{ fontWeight: 500 }}>{item.title}</Typography>
                </Box>
                <Typography variant='h5' sx={{ mb: 2.5 }}>{item.stats}</Typography>
                <LinearProgress variant='determinate' value={item.progress} color={item.progressColor as any} sx={{ height: 4 }} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default AnalyticsEarningReports
