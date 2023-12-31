import ChatInput from '@/components/ChatInput'
import Messages from '@/components/Messages'
import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { FC } from 'react'

interface pageProps {
  params: {
    chatId: string
  }
}

async function getChatMessages(chatId: string) {
  try {
    const results: string[] = await fetchRedis(
      'zrange',
      `chat:${chatId}:messages`,
      0,
      -1
    )
    const dbMessages = results.map((message) => JSON.parse(message) as Message) //to parse messages

    //to distribute messages in reverse order
    const reverseDbMessages = dbMessages.reverse()

    //to parse the db messages
    const messages = messageArrayValidator.parse(reverseDbMessages)

    return messages
  } catch (error) {
    notFound()
  }
}

const page = async ({ params }: pageProps) => {


  const { chatId } = params //destructuring chatId  
  const session = await getServerSession(authOptions) //determine the session

  //to check if there is no session
  if (!session) notFound()

  //destructure the user
  const { user } = session

  //access to chatId
  const [userId1, userId2] = chatId.split('--')

  if (user.id !== userId1 && user.id !== userId2) {
    notFound()
  }

  const chatPartnerId = user.id === userId1 ? userId2 : userId1 //to determine id which is yours

  //to get the chat partner info
  const chatPartnerRaw = (await fetchRedis(
    'get',
    `user:${chatPartnerId}`
  ))as string
  const chatPartner = JSON.parse(chatPartnerRaw) as User
 
  const initialMessages = await getChatMessages(chatId) //to get the messages

  return <div className='flex-1 justify-between flex flex-col h-full max-h-[1rem] max-h-[calc(100vh-6rem)]'>
    <div className='flex sm:items-center justify-between py-3 border-b-2 border-gray-200'>
      <div className='relative flex items-center space-x-4'>
        <div className='relative'>
          <div className='flex w-8 sm:w-12 h-8 sm:h-12'>
            <Image 
              fill
              referrerPolicy='no-referrer'
              src={chatPartner?.image}
              alt={`${chatPartner.name} profile picture`}
              className='rounded-full'
            />
          </div>
        </div>

        <div className='flex flex-col leading-tight'>
          <div className='text-xl flex flex-center'>
            <span className='text-gray-700 mr-3 font-semibold'>
              {chatPartner.name}
            </span>
          </div>

          <span className='text-sm text-gray-600'>{chatPartner.email}</span>
        </div>
      </div>
    </div>

    <Messages sessionId={session.user.id} initialMessages={initialMessages} sessionImg={session.user.image} chatPartner={chatPartner} chatId={chatId} />
    <ChatInput chatId={chatId} chatPartner={chatPartner} />
  </div>
}

export default page