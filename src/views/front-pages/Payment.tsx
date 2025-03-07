'use client'

// React Imports
import type { ChangeEvent } from 'react'
import { useState, useEffect } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Select from '@mui/material/Select'
import Grid from '@mui/material/Grid'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import type { SelectChangeEvent } from '@mui/material/Select'
import type { ButtonProps } from '@mui/material/Button'

// Third-party Imports
import classnames from 'classnames'

// Type Imports
import type { CustomInputHorizontalData } from '@core/components/custom-inputs/types'
import type { PricingPlanType } from '@/types/pages/pricingTypes'

// Component Imports
import CustomInputHorizontal from '@core/components/custom-inputs/Horizontal'
import PricingDialog from '@components/dialogs/pricing'
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import DirectionalIcon from '@components/DirectionalIcon'
import { useSettings } from '@core/hooks/useSettings'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'

// Data
const cardData: CustomInputHorizontalData[] = [
  {
    title: (
      <div className='flex items-center gap-4'>
        <Avatar
          variant='rounded'
          className='is-[58px] bs-[34px]'
          sx={{
            backgroundColor: theme =>
              theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.action.hover
          }}
        >
          <img src='/images/logos/visa.png' alt='plan' className='bs-3' />
        </Avatar>
        <Typography color='text.primary'>Credit Card</Typography>
      </div>
    ),
    value: 'credit-card',
    isSelected: true
  },
  {
    title: (
      <div className='flex items-center gap-4'>
        <Avatar
          variant='rounded'
          className='is-[58px] bs-[34px]'
          sx={{
            backgroundColor: theme =>
              theme.palette.mode === 'dark' ? theme.palette.common.white : theme.palette.action.hover
          }}
        >
          <img src='/images/logos/paypal.png' alt='plan' className='bs-5' />
        </Avatar>
        <Typography color='text.primary'>Paypal</Typography>
      </div>
    ),
    value: 'paypal'
  }
]

const countries = ['Australia', 'Brazil', 'Canada', 'India', 'United Arab Emirates', 'United Kingdom', 'United States']

const Payment = ({ data }: { data: PricingPlanType[] }) => {
  // Vars
  const buttonProps: ButtonProps = {
    variant: 'outlined',
    children: 'Change Plan'
  }

  const initialSelected: string = cardData.filter(item => item.isSelected)[
    cardData.filter(item => item.isSelected).length - 1
  ].value

  // States
  const [selectCountry, setSelectCountry] = useState('')
  const [selectInput, setSelectInput] = useState<string>(initialSelected)

  // Hooks
  const { updatePageSettings } = useSettings()

  const handleCountryChange = (event: SelectChangeEvent) => {
    setSelectCountry(event.target.value)
  }

  const handlePaymentChange = (prop: string | ChangeEvent<HTMLInputElement>) => {
    if (typeof prop === 'string') {
      setSelectInput(prop)
    } else {
      setSelectInput((prop.target as HTMLInputElement).value)
    }
  }

  // For Page specific settings
  useEffect(() => {
    return updatePageSettings({
      skin: 'default'
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className={classnames('md:plb-[100px] plb-6', frontCommonStyles.layoutSpacing)}>
      <Card>
        <CardContent className='p-0'>
          <Grid container>
            <Grid item md={12} lg={7}>
              <div className='flex flex-col gap-y-8 p-8 border-be lg:border-be-0 lg:border-e bs-full'>
                <div className='flex flex-col gap-2'>
                  <Typography variant='h4'>Checkout</Typography>
                  <Typography color='text.secondary'>
                    All plans include 40+ advanced tools and features to boost your product. Choose the best plan to fit
                    your needs.
                  </Typography>
                </div>
                <div className='flex gap-5'>
                  <Grid container spacing={4}>
                    {cardData.map((item, index) => (
                      <CustomInputHorizontal
                        key={index}
                        type='radio'
                        name='paymemt-method'
                        data={item}
                        selected={selectInput}
                        handleChange={handlePaymentChange}
                        gridProps={{ sm: 6, xs: 12 }}
                      />
                    ))}
                  </Grid>
                </div>
                <div className='flex flex-col gap-6 mbe-1'>
                  <Typography variant='h4'>Billing Details</Typography>
                  <div className='flex sm:flex-row flex-col gap-5'>
                    <TextField fullWidth label='Email Address' defaultValue='admin@master.com' type='email' />
                    <TextField fullWidth type='password' id='password-input' label='Password' defaultValue='admin' />
                  </div>
                  <div className='flex sm:flex-row flex-col gap-5'>
                    <FormControl fullWidth>
                      <InputLabel id='country-select-label'>Billing Country</InputLabel>
                      <Select
                        fullWidth
                        labelId='country-select-label'
                        id='country-select'
                        value={selectCountry}
                        label='Billing Country'
                        onChange={handleCountryChange}
                      >
                        {countries.map(country => (
                          <MenuItem key={country} value={country}>
                            {country}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      label='Billing Zip / Postal Code'
                      id='postal-code-input'
                      placeholder='123456'
                      fullWidth
                      type='number'
                    />
                  </div>
                </div>
                {selectInput === 'credit-card' && (
                  <div className='flex flex-col gap-6 mbe-1'>
                    <Typography variant='h4'>Credit Card Info</Typography>
                    <TextField
                      fullWidth
                      id='card-number-input'
                      placeholder='8763 2345 3478'
                      label='Card Number'
                      type='number'
                    />
                    <div className='flex sm:flex-row flex-col gap-5'>
                      <TextField fullWidth id='card-holder-name' placeholder='John Doe' label='Card Holder' />
                      <div className='flex gap-5'>
                        <TextField fullWidth id='expiry-date' placeholder='05/2026' label='EXP. date' type='number' />
                        <TextField fullWidth id='cvv' placeholder='734' label='CVV' type='number' />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Grid>
            <Grid item md={12} lg={5}>
              <div className='flex flex-col gap-8 p-8'>
                <div className='flex flex-col gap-2'>
                  <Typography variant='h4'>Order Summary</Typography>
                  <Typography color='text.secondary'>
                    It can help you manage and service orders before, during, and after fulfillment.
                  </Typography>
                </div>
                <div className='flex flex-col gap-5'>
                  <div className='flex flex-col gap-4 p-6 bg-actionHover rounded'>
                    <Typography color='text.secondary'>A simple start for everyone</Typography>
                    <div className='flex items-baseline'>
                      <Typography variant='h1'>$59.99</Typography>
                      <Typography component='sub' color='text.secondary' className='font-medium'>
                        /month
                      </Typography>
                    </div>
                    <OpenDialogOnElementClick
                      element={Button}
                      elementProps={buttonProps}
                      dialog={PricingDialog}
                      dialogProps={{ data }}
                    />
                  </div>
                  <div>
                    <div className='flex gap-2 items-center justify-between mbe-2'>
                      <Typography color='text.secondary'>Subscription</Typography>
                      <Typography color='text.primary' className='font-medium'>
                        $85.99
                      </Typography>
                    </div>
                    <div className='flex gap-2 items-center justify-between'>
                      <Typography color='text.secondary'>Tax</Typography>
                      <Typography color='text.primary' className='font-medium'>
                        $4.99
                      </Typography>
                    </div>
                    <Divider className='mlb-4' />
                    <div className='flex gap-2 items-center justify-between'>
                      <Typography color='text.secondary'>Total</Typography>
                      <Typography color='text.primary' className='font-medium'>
                        $90.98
                      </Typography>
                    </div>
                  </div>
                  <Button
                    variant='contained'
                    color='success'
                    endIcon={<DirectionalIcon ltrIconClass='ri-arrow-right-line' rtlIconClass='ri-arrow-left-line' />}
                  >
                    Proceed With Payment
                  </Button>
                </div>
                <Typography color='text.secondary'>
                  By continuing, you accept to our Terms of Services and Privacy Policy. Please note that payments are
                  non-refundable.
                </Typography>
              </div>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </section>
  )
}

export default Payment
