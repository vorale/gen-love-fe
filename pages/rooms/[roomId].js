import { Flex, Heading, useTheme, View } from '@aws-amplify/ui-react'
import { useEffect, useState } from 'react'
import { withSSRContext } from 'aws-amplify'
import { InputArea } from '../../components/InputArea'
import { MessageList } from '../../components/Message'
import { ConversationBar } from '../../components/ConversationBar'
import config from '../../src/aws-exports'
import { Amplify, API } from 'aws-amplify'
import { messagesByRoomIdAndCreatedAt } from '../../src/graphql/queries'
import { createMessage } from '../../src/graphql/mutations'
import { onCreateMessage } from '../../src/graphql/subscriptions'
import { useRouter } from 'next/router'
import { listRooms } from '../../src/graphql/queries'
Amplify.configure({ ...config, ssr: true })

function RoomPage({ roomsList, currentRoomData, username }) {
	console.log(username)
	const { tokens } = useTheme()
	const router = useRouter()
	const [messages, setMessages] = useState([])
	const [rooms, setRooms] = useState(roomsList)
	const [currentRoom, setCurrentRoom] = useState(currentRoomData)

	const handleMessageSend = async (newMessage, mediaKey, mediaType = 'image') => {
		const createNewMsg = async (text, mediaKey, mediaType) => {
			let content = { text }
			if (mediaType === 'image') {
				content.imageId = mediaKey
			} else if (mediaType === 'audio') {
				content.audioId = mediaKey
			}

			return await API.graphql({
				query: createMessage,
				variables: {
					input: {
						content,
						roomId: currentRoom.id,
						owner: username,
						createdAt: new Date().toISOString()
					},
				},
			})
		}

		await createNewMsg(newMessage, mediaKey, mediaType)
	}

	const handleRoomChange = (roomID) => {
		const newRoom = rooms.find((room) => room.id === roomID)
		setCurrentRoom(newRoom)
		router.push(`/rooms/${roomID}`)
	}

	useEffect(() => {
		if (!currentRoom?.id) return;
		
		API.graphql({
			query: messagesByRoomIdAndCreatedAt,
			variables: {
				roomId: currentRoom.id,
				sortDirection: 'DESC',
				limit: 50
			},
		}).then(({ data }) => {
			setMessages(data.messagesByRoomIdAndCreatedAt.items);
		});
	}, [currentRoom?.id])

	useEffect(() => {
		if (!currentRoom?.id) return;
		
		const subscription = API.graphql({
			query: onCreateMessage,
			variables: {
				filter: {
					roomId: { eq: currentRoom.id }
				}
			},
		}).subscribe({
			next: ({ value }) => {
				setMessages((messages) => [value.data.onCreateMessage, ...messages]);
			},
			error: (error) => console.warn(error),
		});

		return () => subscription.unsubscribe();
	}, [currentRoom?.id]);

	return (
		<>
			<View>
				<Flex direction={{ base: 'column', medium: 'row' }}>
					<ConversationBar rooms={rooms} onRoomChange={handleRoomChange} />
					<View flex={{ base: 0, medium: 1 }}>
						<View margin="0 auto" maxWidth={{ base: '95vw', medium: '100vw' }}>
							<Heading
								style={{ borderBottom: '1px solid black' }}
								padding={tokens.space.small}
								textAlign={'center'}
								level={3}
								color={tokens.colors.blue[60]}
							>
								{currentRoom.name}
							</Heading>
							<Flex direction="column" height="85vh">
								<MessageList messages={messages} myUsername={username} />
								<InputArea onMessageSend={handleMessageSend} />
							</Flex>
						</View>
					</View>
				</Flex>
			</View>
		</>
	)
}

export default RoomPage

export async function getServerSideProps(context) {
	const { API, Auth } = withSSRContext(context)
	try {
		const user = await Auth.currentAuthenticatedUser()
		const { data } = await API.graphql({
			query: listRooms,
		})

		const currentRoomData = data.listRooms.items.find(
			(room) => room.id === context.params.roomId
		)

		return {
			props: {
				currentRoomData,
				username: user.username,
				roomsList: data.listRooms.items,
			},
		}
	} catch (err) {
		return {
			redirect: {
				destination: '/',
				permanent: false,
			},
		}
	}
}
