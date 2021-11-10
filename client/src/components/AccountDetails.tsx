import React from 'react'

const AccountDetails = () => {
  return (
    <div>
      <div className="text-2xl font-medium mb-4">Account Details</div>

      <form>
        <div className="mb-4">
          <div className="mb-1">Email</div>
          <input type="text" placeholder="Email" className="rounded-lg"/>
        </div>

        <div className="mb-4">
          <div className="mb-1">Password</div>
          <input type="password" placeholder="Password" className="rounded-lg"/>
        </div>
      </form>
    </div>
  )
}

export default AccountDetails
