'use client'

import { FC } from 'react'
import { signOut } from 'next-auth/react'

import Button from './ui/Button'

interface LogoutButtonProps {}

const LogoutButton: FC<LogoutButtonProps> = ({}) => {
  return (
      <Button onClick={() => signOut({callbackUrl: '/dashboard'})}>Logout</Button>
  )
}

export default LogoutButton;