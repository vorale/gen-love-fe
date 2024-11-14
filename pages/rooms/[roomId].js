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
	const [suggestions, setSuggestions] = useState([])
	const [inputText, setInputText] = useState('')
	const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false)
	const [isLoading, setIsLoading] = useState(false)

	// const fetchSuggestions = async (messages, newMessage = '') => {
	// 	try {
	// 		const conversationHistory = messages
	// 			.slice()
	// 			.reverse()
	// 			.map(msg => `${msg.owner}: ${msg.content?.text || ''}`)
	// 			.join('\n');

	// 		const fullText = newMessage ? `${conversationHistory}\n${newMessage}` : conversationHistory;

	// 		const response = await fetch('http://35.77.89.181/v1/workflows/run', {
	// 			method: 'POST',
	// 			headers: {
	// 				'Authorization': 'Bearer app-RmWlW1p1VAQilrrzmaQpMJaC',
	// 				'Content-Type': 'application/json'
	// 			},
	// 			body: JSON.stringify({
	// 				inputs: {
	// 					text: "",
	// 					file_path: "",
	// 					username: "warren",
	// 					"sys.files": [],
	// 					"sys.user_id": "346ab516-948d-42e1-b54b-2b002ac93f86",
	// 					"sys.app_id": "be3ed3f2-2419-48bf-a872-db27ad10760b",
	// 					"sys.workflow_id": "64807ddc-cd37-4525-9944-a2ca6f697a1e",
	// 					"sys.workflow_run_id": "54400afb-ffc5-4600-ad5f-2b165a12512b"
	// 				},
	// 				response_mode: "blocking",
	// 				user: "abc-123"
	// 			})
	// 		});
	// 		const data = await response.json();
    //         if (data?.data?.outputs?.result) {
	// 			const resultData = JSON.parse(data.data.outputs.result);
	// 			setSuggestions(resultData.suggestions);
	// 		}
	// 	} catch (error) {
	// 		console.error('Error fetching suggestions:', error);
	// 	}
	// };

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

	const handleSuggestionClick = (suggestion) => {
		setInputText(suggestion);
		setIsSuggestionsOpen(false)
	};

	const handleSuggestionsReceived = (suggestionsOrUpdater) => {
		if (typeof suggestionsOrUpdater === 'function') {
			setSuggestions(suggestionsOrUpdater);
		} else {
			setSuggestions(suggestionsOrUpdater);
		}
	};

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
			const messageItems = data.messagesByRoomIdAndCreatedAt.items;
			setMessages(messageItems);
			// fetchSuggestions(messageItems);
		});
	}, [currentRoom?.id]);

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
				setMessages((messages) => {
					const newMessages = [value.data.onCreateMessage, ...messages];
					// fetchSuggestions(newMessages);
					return newMessages;
				});
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
								<MessageList 
									isLoading={isLoading}
									isSuggestionsOpen={isSuggestionsOpen}
									messages={messages} 
									myUsername={username} 
									suggestions={suggestions}
									onSuggestionClick={handleSuggestionClick}
								/>
								<InputArea 
									setIsSuggestionsOpen={setIsSuggestionsOpen}
									onMessageSend={handleMessageSend} 
									setIsLoading={setIsLoading}
									isLoading={isLoading}
									messages={messages}
									inputText={inputText}
									setInputText={setInputText}
									onSuggestionsReceived={handleSuggestionsReceived}
								/>
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
