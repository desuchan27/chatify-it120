import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { FC } from 'react'

interface pageProps {
  params: {
    chatId: string
  }
}

const page = async ({ params }: pageProps) => {
  
  
  const {chatId} = params //destructuring chatId  
  const session = await getServerSession(authOptions) //determine the session

  //to check if there is no session
  if(!session) notFound()

  //destructure the user
  const { user } = session

  //access to chatId
  const [userId1, userId2] = chatId.split('--')



  return <div>{params.chatId}</div>
}

export default page