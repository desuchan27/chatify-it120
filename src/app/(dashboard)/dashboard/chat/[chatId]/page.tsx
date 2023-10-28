import { fetchRedis } from '@/helpers/redis'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { messageArrayValidator } from '@/lib/validations/message'
import { getServerSession } from 'next-auth'
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
  const chatPartner = (await db.get(`user:${chatPartnerId}`)) as User //to get the chat partner info
  const initialMessages = await getChatMessages(chatId) //to get the messages

  return <div>{params.chatId}</div>
}

export default page