import React, { useState } from 'react'
import { UserIcon, CreditCardIcon, TruckIcon, SwitchHorizontalIcon  } from '@heroicons/react/outline'
import AccountDetails from '../components/AccountDetails'

const Settings = () => {

  const [selectedSetting, setSelectedSetting] = useState('Account Details')

  const getSettingPage = () => {
    switch(selectedSetting) {
      case 'Account Details':
        return <AccountDetails />
      case 'Payment Methods':
        return <AccountDetails />
      case 'Delivery Addresses':
        return <AccountDetails />
      case 'Shop Preferences':
        return <AccountDetails />
    }
  }

  return (
    <div className="px-36 py-10">
      <div className="text-2xl font-medium mb-4">Settings</div>

      <div className="flex">
        <div className="flex-2">
          <div className={`mb-2 text-lg cursor-pointer ${selectedSetting === 'Account Details' ? 'underline' : ''}`} onClick={() => setSelectedSetting('Account Details')}>
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 mr-3"/>
              <span>Account Details</span>
            </div>
          </div>
          
          <div className={`mb-2 text-lg cursor-pointer ${selectedSetting === 'Payment Methods' ? 'underline' : ''}`} onClick={() => setSelectedSetting('Payment Methods')}>
            <div className="flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-3"/>
              <span>Payment Methods</span>
            </div>
          </div>

          <div className={`mb-2 text-lg cursor-pointer ${selectedSetting === 'Delivery Addresses' ? 'underline' : ''}`} onClick={() => setSelectedSetting('Delivery Addresses')}>
            <div className="flex items-center">
              <TruckIcon className="h-6 w-6 mr-3"/>
              <span>Delivery Addresses</span>
            </div>
          </div>

          <div className={`mb-2 text-lg cursor-pointer ${selectedSetting === 'Shop Preferences' ? 'underline' : ''}`} onClick={() => setSelectedSetting('Shop Preferences')}>
            <div className="flex items-center">
              <SwitchHorizontalIcon className="h-6 w-6 mr-3"/>
              <span>Shop Preferences</span>
            </div>
          </div>
        </div>

        <div className="flex-4">
          {getSettingPage()}
        </div>
      </div>
    </div>
  )
}

export default Settings
