import type { CardStatsType } from '@/types/pages/widgetTypes'

export const db: CardStatsType = {
  statsHorizontalWithAvatar: [
    {
      stats: '$24,983',
      title: 'Total Earning',
      avatarIcon: 'ri-money-dollar-circle-line',
      avatarColor: 'primary'
    },
    {
      stats: '$8,647',
      title: 'Unpaid Earning',
      avatarIcon: 'ri-gift-line',
      avatarColor: 'success'
    },
    {
      stats: '2,367',
      title: 'Signups',
      avatarIcon: 'ri-group-line',
      avatarColor: 'error'
    },
    {
      stats: '4.5%',
      title: 'Conversion Rate',
      avatarIcon: 'ri-refresh-line',
      avatarColor: 'info'
    }
  ],
  statsHorizontalWithBorder: [
    {
      title: 'Pacientes Activos',
      stats: 5,
      trendNumber: 18.2,
      avatarIcon: 'ri-user-line',
      color: 'primary'
    },
    {
      title: 'Pacientes en preanestesia',
      stats: 8,
      trendNumber: -8.7,
      avatarIcon: 'ri-medicine-bottle-line',
      color: 'warning'
    },
    {
      title: 'Pacientes en pabellon',
      stats: 3,
      trendNumber: 4.3,
      avatarIcon: 'ri-surgical-mask-line',
      color: 'error'
    },
    {
      title: 'Pacientes en recuperación', 
      stats: 13,
      trendNumber: 2.5,
      avatarIcon: 'ri-hotel-bed-line',
      color: 'info'
    }
  ],
  customerStats: [
    {
      color: 'primary',
      avatarIcon: 'ri-money-dollar-circle-line',
      title: 'account balance',
      stats: '$7480',
      content: ' Credit Left',
      description: 'Account balance for next purchase'
    },
    {
      color: 'success',
      avatarIcon: 'ri-gift-line',
      title: 'loyalty program',
      chipLabel: 'Platinum member',
      description: '3000 points to next tier'
    },
    {
      color: 'warning',
      avatarIcon: 'ri-star-smile-line',
      title: 'wishlist',
      stats: '15',
      content: 'Items in wishlist',
      description: 'Receive notifications on price drops'
    },
    {
      color: 'info',
      avatarIcon: 'ri-vip-crown-line',
      title: 'coupons',
      stats: '21',
      content: 'Coupons you win',
      description: 'Use coupon on next purchase'
    }
  ],
  statsHorizontal: [
    {
      stats: '2,856',
      trendNumber: '10.2%',
      color: 'primary',
      title: 'New Customers',
      icon: 'ri-group-line'
    },
    {
      stats: '28.6K',
      trend: 'up',
      color: 'success',
      trendNumber: '25.8%',
      title: 'Total Revenue',
      icon: 'ri-money-dollar-circle-line '
    },
    {
      color: 'info',
      stats: '16.6K',
      trendNumber: '12.1%',
      title: 'New Transactions',
      icon: 'ri-pie-chart-2-line'
    },
    {
      stats: '2,856',
      trend: 'up',
      color: 'warning',
      icon: 'ri-bar-chart-line',
      trendNumber: '54.6%',
      title: 'Total Profit'
    }
  ],
  statsVertical: [
    {
      stats: '862',
      trend: 'negative',
      trendNumber: '18%',
      title: 'New Project',
      subtitle: 'Yearly Project',
      avatarColor: 'primary',
      avatarIcon: 'ri-file-word-2-line'
    },
    {
      avatarIcon: 'ri-pie-chart-2-line ',
      stats: '$25.6k',
      avatarColor: 'secondary',
      trendNumber: '42%',
      title: 'Total Profit',
      subtitle: 'Weekly Profit'
    },
    {
      stats: '$95.2k',
      title: 'Revenue',
      avatarColor: 'success',
      trendNumber: '12%',
      avatarIcon: 'ri-money-dollar-circle-line',
      subtitle: 'Revenue Increase'
    },
    {
      avatarColor: 'error',
      stats: '44.10k',
      trend: 'negative',
      title: 'Logistics',
      trendNumber: '42%',
      avatarIcon: 'ri-car-line',
      subtitle: 'Regional Logistics'
    },
    {
      stats: '268',
      title: 'Reports',
      avatarColor: 'warning',
      trend: 'negative',
      trendNumber: '28%',
      avatarIcon: 'ri-file-chart-line',
      subtitle: 'System Bugs'
    },
    {
      stats: '1.2k',
      avatarColor: 'info',
      trendNumber: '38%',
      title: 'Transactions',
      avatarIcon: 'ri-bank-card-line',
      subtitle: 'Daily Transactions'
    }
  ],
  statsCharacter: [
    {
      stats: '13k',
      title: 'Ratings',
      trendNumber: '15.6%',
      chipColor: 'primary',
      src: '/images/illustrations/characters/9.png',
      chipText: `Year of ${new Date().getFullYear()}`
    },
    {
      stats: '24k',
      trend: 'negative',
      title: 'Sessions',
      trendNumber: '20%',
      chipText: 'Last Week',
      src: '/images/illustrations/characters/10.png'
    },
    {
      stats: '28k',
      chipColor: 'info',
      title: 'Customers',
      trendNumber: '59%',
      chipText: 'Daily Customers',
      src: '/images/illustrations/characters/11.png'
    },
    {
      stats: '42k',
      trendNumber: '26%',
      chipColor: 'warning',
      title: 'Total Orders',
      chipText: 'Last Month',
      src: '/images/illustrations/characters/12.png'
    }
  ]
}
