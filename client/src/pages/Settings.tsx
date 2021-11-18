import { SwitchHorizontalIcon, UserIcon } from '@heroicons/react/outline'
import React, { useState } from 'react'
import AccountDetails from '../components/AccountDetails'
import ShopPreferences from '../components/ShopPreferences'

const Settings = () => {

  const [selectedSetting, setSelectedSetting] = useState('Account Details')

  const getSettingPage = () => {
    switch (selectedSetting) {
      case 'Account Details':
        return <AccountDetails />
      case 'Shop Preferences':
        return <ShopPreferences />
    }
  }

  return (
    <div className="px-36 py-10 sm:p-4">
      <div className="text-2xl font-medium mb-4">Settings</div>

      <div className="flex sm:block">
        <div className="flex-2">
          <div className={`mb-2 text-lg cursor-pointer ${selectedSetting === 'Account Details' ? 'underline' : ''}`} onClick={() => setSelectedSetting('Account Details')}>
            <div className="flex items-center">
              <UserIcon className="h-6 w-6 mr-3" />
              <span>Account Details</span>
            </div>
          </div>

          <div className={`mb-2 text-lg cursor-pointer ${selectedSetting === 'Shop Preferences' ? 'underline' : ''}`} onClick={() => setSelectedSetting('Shop Preferences')}>
            <div className="flex items-center">
              <SwitchHorizontalIcon className="h-6 w-6 mr-3" />
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
